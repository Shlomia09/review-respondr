import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Platform {
  name: string;
  connected: boolean;
  reviewCount?: number;
  logo: string;
  description: string;
}

const PlatformConnection = () => {
  const { t, language } = useTranslation();
  const align = language === 'he' || language === 'ar' ? 'text-right' : 'text-left';
  
  const platforms: Platform[] = [
    {
      name: "Google",
      connected: false,
      logo: "https://www.google.com/favicon.ico",
      description: t('platforms.google.description')
    },
    {
      name: "Facebook", 
      connected: true,
      reviewCount: 47,
      logo: "https://www.facebook.com/favicon.ico", 
      description: t('platforms.facebook.description')
    },
    {
      name: "Trustpilot",
      connected: false,
      logo: "https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg",
      description: t('platforms.trustpilot.description')
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${align}`}>
          <ExternalLink className="h-5 w-5" />
          {t('platformConnection.title')}
        </CardTitle>
        <CardDescription className={align}>
          {t('platformConnection.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={platform.logo} 
                    alt={platform.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <h4 className="font-medium">{platform.name}</h4>
                </div>
                <Badge 
                  variant={platform.connected ? "default" : "secondary"}
                  className={platform.connected ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                >
                  {platform.connected ? t('platformConnection.connected') : t('platformConnection.disconnected')}
                </Badge>
              </div>
              
              <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 ${align}`}>
                {platform.description}
              </p>
              
              {platform.connected && platform.reviewCount && (
                <p className={`text-sm text-blue-600 dark:text-blue-400 mb-4 ${align}`}>
                  {platform.reviewCount} {t('platformConnection.reviews')}
                </p>
              )}
              
              <Button 
                size="sm" 
                variant={platform.connected ? "outline" : "default"}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {platform.connected ? t('platformConnection.manage') : t('platformConnection.connect')}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformConnection;