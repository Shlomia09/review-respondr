import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { AITemplateLibrary } from "@/components/AITemplateLibrary";
import { AIResponseStats } from "@/components/AIResponseStats";
import { useState, useEffect } from "react";

export function AIResponses() {
  const { t } = useTranslation();
  
  // Mock AI stats data
  const aiStats = {
    totalResponses: 1247,
    autoResponseRate: 87,
    averageResponseTime: 3.5,
    responseAccuracy: 94,
    weeklyGrowth: 15,
    sentimentImprovement: 23
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.aiResponses")}</h1>
      </div>

      {/* AI Response Statistics */}
      <AIResponseStats stats={aiStats} />
      
      {/* AI Template Library */}
      <AITemplateLibrary />
    </div>
  );
}