"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { saveDiary } from "@/app/actions/diary";
import { toast } from "sonner";
import Link from "next/link";

const AUTO_SAVE_INTERVAL = 30000; // 30초
const DRAFT_KEY = "diary_draft";

export function DiaryForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 드래프트 로드
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setContent(draft);
    }
  }, []);

  // 자동 저장
  useEffect(() => {
    const interval = setInterval(() => {
      if (content) {
        localStorage.setItem(DRAFT_KEY, content);
        setLastSaved(new Date());
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [content]);

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (content) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please write something");
      return;
    }

    setIsSaving(true);
    try {
      await saveDiary({ content });
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Diary saved successfully!");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to save diary:", error);
      toast.error("Failed to save diary. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftSave = () => {
    localStorage.setItem(DRAFT_KEY, content);
    setLastSaved(new Date());
    toast.success("Draft saved!");
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {lastSaved
            ? `Last saved at ${lastSaved.toLocaleTimeString()}`
            : "Not saved yet"}
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your diary..."
          className="min-h-[300px] resize-none"
        />
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handleDraftSave}
              disabled={isSaving}
            >
              Save Draft
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 