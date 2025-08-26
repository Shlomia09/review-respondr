import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export function Analytics() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.analytics")}</h1>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}