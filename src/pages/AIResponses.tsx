import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export function AIResponses() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.aiResponses")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.aiResponses")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AI Responses management page will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}