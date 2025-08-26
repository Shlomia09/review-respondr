import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { SocialContentGenerator } from "@/components/SocialContentGenerator";
import { SocialCalendar } from "@/components/SocialCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SocialHub() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Share2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.socialHub")}</h1>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">{t('socialHub.contentGenerator')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('socialHub.calendar')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator">
          <SocialContentGenerator />
        </TabsContent>
        
        <TabsContent value="calendar">
          <SocialCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}