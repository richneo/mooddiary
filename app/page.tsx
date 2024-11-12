import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiaryList } from "@/components/diary/DiaryList";
import { EmotionStats } from "@/components/diary/EmotionStats";
import { DataManagement } from "@/components/diary/DataManagement";
import { getDiaries, restoreDiaries } from "@/app/actions/diary";

export default async function Home() {
  const diaries = await getDiaries();
  
  // 최신 일기가 위로 오도록 정렬
  const sortedDiaries = diaries.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="container max-w-2xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">MoodDiary</h1>
        <Link href="/diary/new">
          <Button>New Diary</Button>
        </Link>
      </div>
      <div className="space-y-8">
        <EmotionStats diaries={sortedDiaries} />
        <DataManagement 
          diaries={sortedDiaries}
          onRestore={restoreDiaries}
        />
        <DiaryList diaries={sortedDiaries} />
      </div>
    </main>
  );
}
