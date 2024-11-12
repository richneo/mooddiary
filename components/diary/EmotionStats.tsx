"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Smile, Frown, AlertCircle, Circle, Shield, TrendingUp, TrendingDown } from "lucide-react";
import type { DiaryEntry } from "@/types/diary";
import type { EmotionType } from "@/lib/openai";

interface EmotionStatsProps {
  diaries: DiaryEntry[];
}

const emotionConfig = {
  happy: {
    Icon: Smile,
    label: "Happy",
    color: "text-yellow-600",
    bgColor: "bg-yellow-200",
  },
  sad: {
    Icon: Frown,
    label: "Sad",
    color: "text-blue-600",
    bgColor: "bg-blue-200",
  },
  angry: {
    Icon: AlertCircle,
    label: "Angry",
    color: "text-red-600",
    bgColor: "bg-red-200",
  },
  normal: {
    Icon: Circle,
    label: "Normal",
    color: "text-gray-600",
    bgColor: "bg-gray-200",
  },
  belief: {
    Icon: Shield,
    label: "Belief",
    color: "text-green-600",
    bgColor: "bg-green-200",
  },
} as const;

export function EmotionStats({ diaries }: EmotionStatsProps) {
  const stats = useMemo(() => {
    const counts = {
      happy: 0,
      sad: 0,
      angry: 0,
      normal: 0,
      belief: 0,
    };

    // 월별 감정 추세
    const monthlyTrends: Record<string, typeof counts> = {};
    
    // 요일별 감정 분포
    const dayOfWeekCounts: Record<number, typeof counts> = {
      0: { ...counts }, // 일요일
      1: { ...counts },
      2: { ...counts },
      3: { ...counts },
      4: { ...counts },
      5: { ...counts },
      6: { ...counts }, // 토요일
    };

    diaries.forEach((diary) => {
      if (diary.emotion) {
        // 전체 카운트
        counts[diary.emotion]++;
        
        // 월별 집계
        const monthKey = new Date(diary.createdAt).toISOString().slice(0, 7);
        if (!monthlyTrends[monthKey]) {
          monthlyTrends[monthKey] = { ...counts };
        }
        monthlyTrends[monthKey][diary.emotion]++;
        
        // 요일별 집계
        const dayOfWeek = new Date(diary.createdAt).getDay();
        dayOfWeekCounts[dayOfWeek][diary.emotion!]++;
      }
    });

    const total = diaries.length;
    const percentages = Object.entries(counts).map(([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    const mostFrequent = percentages.reduce((prev, current) => 
      current.count > prev.count ? current : prev
    );

    // 감정 변화 추세 계산
    const trendData = Object.entries(monthlyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-3); // 최근 3개월

    // 요일별 주요 감정 분석
    const dayOfWeekTrends = Object.entries(dayOfWeekCounts).map(([day, emotions]) => {
      const dominantEmotion = Object.entries(emotions).reduce((prev, [emotion, count]) => 
        count > prev.count ? { emotion, count } : prev
      , { emotion: 'normal', count: -1 });
      
      return {
        day: Number(day),
        dominantEmotion: dominantEmotion.emotion as EmotionType,
        count: dominantEmotion.count,
      };
    });

    const last7Days = diaries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7)
      .reverse();

    return {
      counts,
      percentages,
      mostFrequent,
      last7Days,
      total,
      monthlyTrends: trendData,
      dayOfWeekTrends,
    };
  }, [diaries]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emotion Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.percentages.map(({ emotion, count, percentage }) => {
              const { Icon, label, color, bgColor } = emotionConfig[emotion];
              return (
                <div key={emotion} className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${bgColor}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${bgColor} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emotion Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Diaries</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          
          {stats.total > 0 && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Most Frequent Emotion</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const { Icon, label, color } = emotionConfig[stats.mostFrequent.emotion];
                    return (
                      <>
                        <Icon className={`h-5 w-5 ${color}`} />
                        <span className="font-medium">{label}</span>
                        <span className="text-sm text-muted-foreground">
                          ({stats.mostFrequent.percentage}%)
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Daily Emotion Trends</p>
                <div className="grid grid-cols-7 gap-1">
                  {stats.dayOfWeekTrends.map(({ day, dominantEmotion, count }) => {
                    const { bgColor } = emotionConfig[dominantEmotion];
                    return (
                      <div key={day} className="text-center">
                        <div className="text-xs mb-1">{weekDays[day]}</div>
                        <div 
                          className={`h-8 ${bgColor} rounded`}
                          title={`${emotionConfig[dominantEmotion].label} (${count}회)`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last 7 Days Emotions</p>
                <div className="flex gap-1 h-10">
                  {stats.last7Days.map((diary) => {
                    const emotion = diary.emotion || "normal";
                    const { label, bgColor } = emotionConfig[emotion];
                    return (
                      <div
                        key={diary.id}
                        className={`flex-1 ${bgColor} rounded`}
                        title={`${new Date(diary.createdAt).toLocaleDateString()}: ${label}`}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 