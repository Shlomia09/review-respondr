import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

export function SocialHub() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Share2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.socialHub")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.socialHub")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Social Hub page will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}