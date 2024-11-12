"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Smile, Frown, AlertCircle, Circle, Shield } from "lucide-react";
import type { EmotionType } from "@/lib/openai";

interface EmotionFilterProps {
  selectedEmotion: EmotionType | null;
  onSelect: (emotion: EmotionType | null) => void;
}

const emotions: { type: EmotionType; icon: React.ElementType; label: string }[] = [
  { type: "happy", icon: Smile, label: "Happy" },
  { type: "sad", icon: Frown, label: "Sad" },
  { type: "angry", icon: AlertCircle, label: "Angry" },
  { type: "normal", icon: Circle, label: "Normal" },
  { type: "belief", icon: Shield, label: "Belief" },
];

export function EmotionFilter({ selectedEmotion, onSelect }: EmotionFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          {selectedEmotion ? (
            <>
              {emotions.find(e => e.type === selectedEmotion)?.label}
              {React.createElement(
                emotions.find(e => e.type === selectedEmotion)?.icon || Circle,
                { className: "ml-2 h-4 w-4" }
              )}
            </>
          ) : (
            <>
              All Emotions
              <Circle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="grid gap-2">
          <Button
            variant={selectedEmotion === null ? "default" : "ghost"}
            size="sm"
            onClick={() => onSelect(null)}
            className="justify-start"
          >
            All Emotions
            <Circle className="ml-auto h-4 w-4" />
          </Button>
          {emotions.map(emotion => (
            <Button
              key={emotion.type}
              variant={selectedEmotion === emotion.type ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelect(emotion.type)}
              className="justify-start"
            >
              {emotion.label}
              {React.createElement(emotion.icon, { className: "ml-auto h-4 w-4" })}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 