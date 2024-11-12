"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { analyzeEmotion } from "@/lib/openai";
import type { DiaryEntry } from "@/types/diary";

const COOKIE_NAME = "diaries";

export async function getDiaries(): Promise<DiaryEntry[]> {
  const diariesCookie = cookies().get(COOKIE_NAME);
  if (!diariesCookie) return [];
  
  try {
    return JSON.parse(diariesCookie.value);
  } catch {
    return [];
  }
}

async function setDiaries(diaries: DiaryEntry[]) {
  cookies().set(COOKIE_NAME, JSON.stringify(diaries));
}

export async function saveDiary({ content }: { content: string }) {
  const diaries = await getDiaries();
  const emotion = await analyzeEmotion(content);
  
  const newDiary: DiaryEntry = {
    id: uuidv4(),
    content,
    emotion,
    isAnalyzed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await setDiaries([newDiary, ...diaries]);
  revalidatePath("/");
}

export async function updateDiary(id: string, content: string) {
  const diaries = await getDiaries();
  const diaryIndex = diaries.findIndex(d => d.id === id);
  if (diaryIndex === -1) throw new Error("Diary not found");

  const emotion = await analyzeEmotion(content);

  diaries[diaryIndex] = {
    ...diaries[diaryIndex],
    content,
    updatedAt: new Date(),
    emotion,
    isAnalyzed: true,
  };

  await setDiaries(diaries);
  revalidatePath("/");
  return diaries[diaryIndex];
}

export async function getDiary(id: string) {
  const diaries = await getDiaries();
  return diaries.find(d => d.id === id);
}

export async function deleteDiary(id: string) {
  const diaries = await getDiaries();
  const filteredDiaries = diaries.filter(d => d.id !== id);
  
  if (diaries.length === filteredDiaries.length) {
    throw new Error("Diary not found");
  }
  
  await setDiaries(filteredDiaries);
  revalidatePath("/");
}

export async function restoreDiaries(diaries: DiaryEntry[]) {
  await setDiaries(diaries);
  revalidatePath("/");
}