import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    const prompt = `Translate the following ${sourceLang === "ko" ? "Korean" : "English"} text to ${targetLang === "ko" ? "Korean" : "English"}. Maintain the original meaning and tone:

${text}

Translation:`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const translatedText = completion.choices[0].message.content?.trim() || "";

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
} 