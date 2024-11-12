import { DiaryForm } from "@/components/diary/DiaryForm";

export default function NewDiaryPage() {
  return (
    <main className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-8">Write New Diary</h1>
      <DiaryForm />
    </main>
  );
} 