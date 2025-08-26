import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function Customers() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.customers")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.customers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Customers CRM page will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}