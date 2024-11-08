"use server";

import { revalidatePath } from "next/cache";
import { DiaryEntry } from "@/types/diary";
import { cookies } from "next/headers";
import { analyzeEmotion } from "@/lib/openai";

const STORAGE_KEY = "diaries";

async function getDiaries(): Promise<DiaryEntry[]> {
  const cookieStore = cookies();
  const diariesJson = cookieStore.get(STORAGE_KEY)?.value;
  return diariesJson ? JSON.parse(diariesJson) : [];
}

async function setDiaries(diaries: DiaryEntry[]) {
  const cookieStore = cookies();
  cookieStore.set(STORAGE_KEY, JSON.stringify(diaries));
}

export async function saveDiary(content: string, createdAt: Date = new Date()) {
  const diaries = await getDiaries();
  const emotion = await analyzeEmotion(content);
  
  const newDiary: DiaryEntry = {
    id: crypto.randomUUID(),
    content,
    createdAt,
    updatedAt: new Date(),
    emotion,
    isAnalyzed: true,
  };

  diaries.push(newDiary);
  await setDiaries(diaries);
  revalidatePath("/");
  return newDiary;
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

// getDiaries 함수를 export 합니다
export { getDiaries };