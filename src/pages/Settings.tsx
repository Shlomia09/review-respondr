import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export function Settings() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.settings")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings page will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}