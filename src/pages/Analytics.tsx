import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export function Analytics() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.analytics")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.analytics")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Analytics page will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}