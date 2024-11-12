"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { saveDiary, updateDiary } from "@/app/actions/diary";
import type { DiaryEntry } from "@/types/diary";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface DiaryFormProps {
  diary?: DiaryEntry;
  isEditing?: boolean;
}

const AUTO_SAVE_INTERVAL = 30000; // 30초
const DRAFT_KEY = "diary_draft";

export function DiaryForm({ diary, isEditing }: DiaryFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(diary?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 드래프트 저장
  const saveDraft = useCallback((draftContent: string) => {
    if (draftContent !== lastSavedContent) {
      localStorage.setItem(DRAFT_KEY, draftContent);
      toast.success("Draft saved successfully.");
      setLastSavedContent(draftContent);
      setLastSaved(new Date());
    }
  }, [lastSavedContent]);

  // 드래프트 불러오기
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft && !content) {
        setContent(savedDraft);
        toast.info("Draft loaded");
      }
    }
  }, [isEditing, content]);

  // 자동 저장
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (content && content !== lastSavedContent && !isSaving) {
        saveDraft(content);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(autoSaveTimer);
  }, [content, lastSavedContent, isSaving, saveDraft]);

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (content !== lastSavedContent) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [content, lastSavedContent]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (isEditing && diary) {
        await updateDiary(diary.id, content);
        toast.success("Diary updated successfully.");
      } else {
        await saveDiary(content);
        localStorage.removeItem(DRAFT_KEY);
        toast.success("Diary saved successfully.");
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to save diary:", error);
      toast.error("Failed to save diary. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {lastSaved ? `Last saved: ${formatDate(lastSaved)}` : "Not saved yet"}
          </div>
        </div>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your diary..."
          className="min-h-[300px] resize-none"
        />

        <div className="flex justify-between items-center">
          <Link href="/">
            <Button
              type="button"
              variant="outline"
            >
              Home
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => saveDraft(content)}
              disabled={isSaving || content === lastSavedContent}
            >
              Save Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !content.trim()}
            >
              {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
} 