import { useTranslation } from "@/hooks/useTranslation";
import { Bot } from "lucide-react";
import { AIResponseStats } from "@/components/AIResponseStats";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AIResponses() {
  const { t } = useTranslation();
  const [aiStats, setAiStats] = useState({
    totalResponses: 0,
    autoResponseRate: 0,
    averageResponseTime: 0,
    responseAccuracy: 0,
    weeklyGrowth: 0,
    sentimentImprovement: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIStats();
  }, []);

  async function fetchAIStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reviews } = await supabase
        .from("reviews")
        .select("ai_response, response_status, sentiment, created_at, ai_generated_at")
        .eq("user_id", user.id);

      const all = reviews || [];
      const total = all.length;
      const withAI = all.filter(r => r.ai_response).length;
      const approved = all.filter(r => ["approved", "sent"].includes(r.response_status)).length;

      // This week vs last week
      const now = new Date();
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const thisWeek = all.filter(r => new Date(r.created_at) >= weekAgo).length;
      const lastWeek = all.filter(r => new Date(r.created_at) >= twoWeeksAgo && new Date(r.created_at) < weekAgo).length;
      const weeklyGrowth = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

      // Positive sentiment rate (for sentimentImprovement heuristic)
      const positiveRate = total > 0 ? Math.round((all.filter(r => r.sentiment === "positive").length / total) * 100) : 0;

      setAiStats({
        totalResponses: withAI,
        autoResponseRate: total > 0 ? Math.round((withAI / total) * 100) : 0,
        averageResponseTime: 0, // Not tracked yet
        responseAccuracy: withAI > 0 ? Math.round((approved / withAI) * 100) : 0,
        weeklyGrowth,
        sentimentImprovement: positiveRate,
      });
    } catch (e) {
      console.error("Error fetching AI stats:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("sidebar.aiResponses")}</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.aiResponses")}</h1>
      </div>

      {/* AI Response Statistics — real data */}
      <AIResponseStats stats={aiStats} />
    </div>
  );
}