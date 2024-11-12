"use client";

import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Language } from "@/types/diary";

interface TranslateButtonProps {
  content: string;
  currentLanguage: Language;
  onTranslate: (translatedText: string) => void;
}

export function TranslateButton({
  content,
  currentLanguage,
  onTranslate,
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      const targetLang = currentLanguage === "ko" ? "en" : "ko";
      
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          sourceLang: currentLanguage,
          targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const { translatedText } = await response.json();
      onTranslate(translatedText);
      
      toast.success(
        targetLang === "ko" ? "한글로 번역되었습니다." : "Translated to English"
      );
    } catch (error) {
      toast.error("번역 중 오류가 발생했습니다.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTranslate}
      disabled={isTranslating}
    >
      <Languages className="w-4 h-4 mr-2" />
      {isTranslating ? "번역 중..." : "번역"}
    </Button>
  );
} 