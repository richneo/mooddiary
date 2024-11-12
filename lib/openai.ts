"use server";

import OpenAI from 'openai';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
    }
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type EmotionType = "happy" | "sad" | "angry" | "normal" | "belief";

const EMOTION_PROMPTS = {
  happy: ["joy", "happiness", "pleasure", "excitement", "satisfaction"],
  sad: ["sadness", "depression", "loneliness", "longing", "loss"],
  angry: ["anger", "irritation", "dissatisfaction", "disappointment", "resentment"],
  normal: ["ordinary", "neutral", "calm", "peaceful", "routine"],
  belief: ["belief", "determination", "will", "resolution", "hope"],
};

export async function analyzeEmotion(content: string): Promise<EmotionType> {
  if (!content.trim()) {
    return "normal";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing the emotions of a diary entry. 
          Please classify the emotion from the following options: ${Object.keys(EMOTION_PROMPTS).join(", ")}.
          The characteristics of each emotion are as follows:
          ${Object.entries(EMOTION_PROMPTS)
            .map(([key, values]) => `${key}: ${values.join(", ")}`)
            .join("\n")}`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const result = response.choices[0]?.message?.content?.toLowerCase() || "";
    const emotion = Object.keys(EMOTION_PROMPTS).find((key) => 
      result.includes(key)
    ) as EmotionType;

    return emotion || "normal";
  } catch (error) {
    console.error("Failed to analyze emotion:", error);
    return "normal";
  }
} 