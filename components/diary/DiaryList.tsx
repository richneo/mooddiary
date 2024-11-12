"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Smile, Frown, AlertCircle, Circle, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteDiary } from "@/app/actions/diary";
import { EmotionFilter } from "@/components/diary/EmotionFilter";
import { SearchInput } from "@/components/diary/SearchInput";
import { toast } from "sonner";
import type { DiaryEntry } from "@/types/diary";
import type { EmotionType } from "@/lib/openai";

interface DiaryListProps {
  diaries: DiaryEntry[];
}

const emotionConfig = {
  happy: {
    icon: Smile,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  sad: {
    icon: Frown,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  angry: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  normal: {
    icon: Circle,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  belief: {
    icon: Shield,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
} as const;

function EmotionIcon({ emotion }: { emotion?: EmotionType }) {
  if (!emotion) return null;
  
  const config = emotionConfig[emotion];
  const Icon = config.icon;
  
  return (
    <div className={`p-2 rounded-full ${config.bgColor}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
    </div>
  );
}

const ITEMS_PER_PAGE = 4;

export function DiaryList({ diaries }: DiaryListProps) {
  if (!diaries) {
    return null;
  }

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    
    if (window.confirm("Are you sure you want to delete this diary?")) {
      setIsDeleting(id);
      try {
        await deleteDiary(id);
        toast.success("Diary deleted successfully.");
      } catch (error) {
        console.error("Failed to delete diary:", error);
        toast.error("Failed to delete. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const filteredDiaries = diaries.filter(diary => {
    const matchesEmotion = selectedEmotion ? diary.emotion === selectedEmotion : true;
    const matchesSearch = searchQuery
      ? diary.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesEmotion && matchesSearch;
  });

  const totalPages = Math.ceil(filteredDiaries.length / ITEMS_PER_PAGE);
  
  const currentDiaries = filteredDiaries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (diaries.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          No diaries yet. Write your first diary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <EmotionFilter
          selectedEmotion={selectedEmotion}
          onSelect={setSelectedEmotion}
        />
      </div>
      {currentDiaries.length === 0 ? (
        <p className="text-center text-muted-foreground">
          {searchQuery ? "No search results." : "No diaries with selected emotion."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {currentDiaries.map((diary) => (
              <Link key={diary.id} href={`/diary/${diary.id}/edit`}>
                <Card className={`hover:bg-muted/50 transition-colors group ${
                  diary.emotion ? emotionConfig[diary.emotion].bgColor : ''
                }`}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-2">
                      {diary.emotion && <EmotionIcon emotion={diary.emotion} />}
                      <div>
                        <CardTitle className="text-lg">
                          {new Date(diary.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardTitle>
                        <CardDescription>
                          {new Date(diary.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(e, diary.id)}
                      disabled={isDeleting === diary.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {diary.content}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 