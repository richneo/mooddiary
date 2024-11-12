"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import type { DiaryEntry } from "@/types/diary";

interface DataManagementProps {
  diaries: DiaryEntry[];
  onRestore: (diaries: DiaryEntry[]) => Promise<void>;
}

export function DataManagement({ diaries, onRestore }: DataManagementProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV 문자열로 변환
  const convertToCSV = (diaries: DiaryEntry[]) => {
    const headers = ["id", "content", "createdAt", "updatedAt", "emotion", "isAnalyzed"];
    const rows = diaries.map(diary => [
      diary.id,
      `"${diary.content.replace(/"/g, '""')}"`, // 내용에 쉼표나 따옴표가 있을 경우를 대비
      new Date(diary.createdAt).toISOString(),
      new Date(diary.updatedAt).toISOString(),
      diary.emotion || "",
      diary.isAnalyzed.toString()
    ]);
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  // CSV 파일을 DiaryEntry 배열로 변환
  const parseCSV = (csvText: string): DiaryEntry[] => {
    const rows = csvText.split("\n");
    const headers = rows[0].split(",");
    
    return rows.slice(1).filter(row => row.trim()).map(row => {
      const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // CSV 파싱 (따옴표 내의 쉼표 무시)
      const entry: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index];
        if (header === "content") {
          value = value.replace(/^"|"$/g, "").replace(/""/g, '"'); // 따옴표 처리 복원
        }
        if (header === "isAnalyzed") {
          value = value === "true";
        }
        if (header === "createdAt" || header === "updatedAt") {
          value = new Date(value);
        }
        entry[header] = value;
      });
      
      return entry as DiaryEntry;
    });
  };

  const handleBackup = () => {
    try {
      const csvContent = convertToCSV(diaries);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mood-diary-backup-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup file downloaded successfully.");
    } catch (error) {
      console.error("Failed to backup:", error);
      toast.error("Failed to create backup file.");
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      // 데이터 유효성 검사
      if (!Array.isArray(data) || !data.every(isValidDiaryEntry)) {
        throw new Error("Invalid backup file format");
      }

      await onRestore(data);
      toast.success("Data restored successfully.");
    } catch (error) {
      console.error("Failed to restore:", error);
      toast.error("Failed to restore data. Please check if the backup file is correct.");
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Data Management</CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Currently {diaries.length} diaries stored.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBackup}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                CSV Backup
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRestoring}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                CSV Restore
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleRestore}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// 데이터 유효성 검사 함수
function isValidDiaryEntry(data: any): data is DiaryEntry {
  return (
    typeof data === "object" &&
    typeof data.id === "string" &&
    typeof data.content === "string" &&
    data.createdAt instanceof Date &&
    data.updatedAt instanceof Date &&
    (data.emotion === undefined || 
      ["happy", "sad", "angry", "normal", "belief"].includes(data.emotion)) &&
    typeof data.isAnalyzed === "boolean"
  );
} 