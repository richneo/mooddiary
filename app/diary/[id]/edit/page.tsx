import { DiaryForm } from "@/components/diary/DiaryForm";
import { getDiary } from "@/app/actions/diary";
import { notFound } from "next/navigation";

export default async function EditDiaryPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const diary = await getDiary(id);
  
  if (!diary) {
    notFound();
  }

  return (
    <main className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Diary</h1>
      <DiaryForm diary={diary} isEditing />
    </main>
  );
} 