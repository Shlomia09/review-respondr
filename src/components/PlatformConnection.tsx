import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Platform {
  name: string;
  connected: boolean;
  reviewCount?: number;
  logo: string;
  description: string;
}

interface PlatformStatus {
  platform: string;
  connected: boolean;
  reviewCount?: number;
}

const PlatformConnection = () => {
  const { t, language } = useTranslation();
  const align = language === 'he' || language === 'ar' ? 'text-right' : 'text-left';
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  
  const platforms: Omit<Platform, 'connected' | 'reviewCount'>[] = [
    {
      name: "Google",
      logo: "https://www.google.com/favicon.ico",
      description: t('platforms.google.description')
    },
    {
      name: "Facebook", 
      logo: "https://www.facebook.com/favicon.ico", 
      description: t('platforms.facebook.description')
    },
    {
      name: "Trustpilot",
      logo: "https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg",
      description: t('platforms.trustpilot.description')
    }
  ];

  useEffect(() => {
    checkPlatformConnections();
  }, []);

  const checkPlatformConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { action: 'check_all_connections' }
      });

      if (error) throw error;
      
      setPlatformStatuses(data.platforms || []);
    } catch (error) {
      console.error('Error checking platform connections:', error);
      toast.error(t('errors.connectionCheck'));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t('errors.notLoggedIn'));
      return;
    }

    setConnectingPlatform(platformName);

    try {
      if (platformName === 'Google') {
        const { data, error } = await supabase.functions.invoke('sync-reviews', {
          body: { 
            action: 'get_oauth_url', 
            platform: 'google' 
          }
        });

        if (error) throw error;

        // Open OAuth URL in popup
        const popup = window.open(
          data.oauth_url,
          'oauth',
          'width=500,height=600,scrollbars=yes'
        );

        // Listen for OAuth completion
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'oauth_success') {
            popup?.close();
            toast.success(t('platforms.connected'));
            checkPlatformConnections(); // Refresh connection status
            window.removeEventListener('message', messageListener);
          } else if (event.data.type === 'oauth_error') {
            popup?.close();
            toast.error(t('errors.connectionFailed'));
            window.removeEventListener('message', messageListener);
          }
        };

        window.addEventListener('message', messageListener);

        // Handle popup close without completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            setConnectingPlatform(null);
          }
        }, 1000);

      }
    } catch (error) {
      console.error('Error connecting to platform:', error);
      toast.error(t('errors.connectionFailed'));
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'disconnect', 
          platform: platformName.toLowerCase() 
        }
      });

      if (error) throw error;
      
      toast.success(t('platforms.disconnected'));
      checkPlatformConnections(); // Refresh connection status
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error(t('errors.disconnectionFailed'));
    }
  };

  const getPlatformData = (platform: any): Platform => {
    const status = platformStatuses.find(s => s.platform.toLowerCase() === platform.name.toLowerCase());
    return {
      ...platform,
      connected: status?.connected || false,
      reviewCount: status?.reviewCount
    };
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

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
          {platforms.map((platformBase) => {
            const platform = getPlatformData(platformBase);
            return (
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
                onClick={() => platform.connected ? handleDisconnect(platform.name) : handleConnect(platform.name)}
                disabled={connectingPlatform === platform.name}
              >
                {connectingPlatform === platform.name ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {platform.connected ? t('platformConnection.manage') : t('platformConnection.connect')}
              </Button>
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformConnection;