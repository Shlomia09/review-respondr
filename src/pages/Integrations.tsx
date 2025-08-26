import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug } from "lucide-react";
import PlatformConnection from "@/components/PlatformConnection";

export function Integrations() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Plug className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.integrations")}</h1>
      </div>

      <PlatformConnection />

      <Card>
        <CardHeader>
          <CardTitle>Additional Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Additional integrations (Shopify, WooCommerce, Mailchimp, etc.) will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}