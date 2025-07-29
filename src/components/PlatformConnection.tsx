import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe,
  Facebook,
  Star,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: string;
  reviewCount?: number;
}

const PlatformConnection = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "google",
      name: "Google Reviews",
      icon: <Globe className="h-5 w-5" />,
      connected: false,
    },
    {
      id: "facebook",
      name: "Facebook Reviews",
      icon: <Facebook className="h-5 w-5" />,
      connected: false,
    },
    {
      id: "trustpilot",
      name: "Trustpilot",
      icon: <Star className="h-5 w-5" />,
      connected: false,
    },
  ]);

  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async (platformId: string) => {
    try {
      // Call edge function to test connection and store credentials
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'connect',
          platform: platformId,
          credentials: credentials[platformId]
        }
      });

      if (error) throw error;

      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: true, lastSync: new Date().toISOString() }
          : p
      ));

      setShowConfig(null);
      setCredentials(prev => ({ ...prev, [platformId]: '' }));

      toast({
        title: "Platform Connected",
        description: `Successfully connected to ${platforms.find(p => p.id === platformId)?.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to platform",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (platformId: string) => {
    setSyncing(platformId);
    try {
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'sync',
          platform: platformId
        }
      });

      if (error) throw error;

      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { 
              ...p, 
              lastSync: new Date().toISOString(),
              reviewCount: data?.reviewCount || p.reviewCount
            }
          : p
      ));

      toast({
        title: "Sync Complete",
        description: `Imported ${data?.newReviews || 0} new reviews from ${platforms.find(p => p.id === platformId)?.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync reviews",
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleOAuthConnect = async (platform: string) => {
    try {
      // Get OAuth URL from edge function
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'get_oauth_url',
          platform: platform
        }
      });

      if (error) throw error;

      // Open OAuth popup window
      const popup = window.open(
        data.oauth_url,
        `oauth_${platform}`,
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for messages from popup
      const messageListener = (event: MessageEvent) => {
        console.log('Received message:', event.data);
        // Accept messages from popup (no strict origin check needed for OAuth callback)
        if (event.data && event.data.success && event.data.platform === platform) {
          // Connection successful
          setPlatforms(prev => prev.map(p => 
            p.id === platform 
              ? { ...p, connected: true, lastSync: new Date().toISOString() }
              : p
          ));
          
          toast({
            title: "התחברות הושלמה",
            description: `התחברת בהצלחה ל${platform === 'google' ? 'גוגל' : 'פייסבוק'}`,
          });

          // Close popup and cleanup
          popup?.close();
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
        } else if (event.data && event.data.error) {
          // Connection failed
          toast({
            title: "שגיאה בהתחברות",
            description: event.data.error,
            variant: "destructive",
          });
          
          popup?.close();
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
        }
      };

      window.addEventListener('message', messageListener);

      // Fallback: Listen for OAuth completion by checking if window is closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          // Check if connection was successful as fallback
          setTimeout(() => {
            checkConnectionStatus(platform);
          }, 1000);
        }
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate OAuth connection",
        variant: "destructive",
      });
    }
  };

  const checkConnectionStatus = async (platformId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'check_connection',
          platform: platformId
        }
      });

      if (error) throw error;

      if (data.connected) {
        setPlatforms(prev => prev.map(p => 
          p.id === platformId 
            ? { ...p, connected: true, lastSync: new Date().toISOString() }
            : p
        ));

        toast({
          title: "Platform Connected",
          description: `Successfully connected to ${platforms.find(p => p.id === platformId)?.name}`,
        });
      }
    } catch (error: any) {
      console.error('Failed to check connection status:', error);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      const { error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'disconnect',
          platform: platformId
        }
      });

      if (error) throw error;

      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: false, lastSync: undefined, reviewCount: undefined }
          : p
      ));

      toast({
        title: "Platform Disconnected",
        description: `Disconnected from ${platforms.find(p => p.id === platformId)?.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect platform",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Platform Connections
        </CardTitle>
        <CardDescription>
          Connect your review platforms to automatically import and manage reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {platform.icon}
                <div>
                  <h3 className="font-medium">{platform.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {platform.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        {platform.lastSync && (
                          <span className="text-xs text-muted-foreground">
                            Last sync: {new Date(platform.lastSync).toLocaleDateString()}
                          </span>
                        )}
                        {platform.reviewCount && (
                          <span className="text-xs text-muted-foreground">
                            {platform.reviewCount} reviews
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not connected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {platform.connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(platform.id)}
                      disabled={syncing === platform.id}
                    >
                      {syncing === platform.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setShowConfig(platform.id)}
                    size="sm"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Configuration Modal */}
          {showConfig && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>
                    Connect {platforms.find(p => p.id === showConfig)?.name}
                  </CardTitle>
                  <CardDescription>
                    הזן את פרטי החיבור שלך לפלטפורמה
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                   {showConfig === "google" && (
                     <div className="space-y-4">
                       <div>
                         <Label htmlFor="google-email">אימייל Google</Label>
                         <Input
                           id="google-email"
                           type="email"
                           placeholder="name@gmail.com"
                           value={credentials.google_email || ''}
                           onChange={(e) => setCredentials(prev => ({ ...prev, google_email: e.target.value }))}
                         />
                       </div>
                       <div>
                         <Label htmlFor="google-password">סיסמה</Label>
                         <Input
                           id="google-password"
                           type="password"
                           placeholder="הזן את הסיסמה שלך"
                           value={credentials.google_password || ''}
                           onChange={(e) => setCredentials(prev => ({ ...prev, google_password: e.target.value }))}
                         />
                       </div>
                       <div className="text-center">
                         <span className="text-sm text-muted-foreground">או</span>
                       </div>
                       <Button
                         variant="outline"
                         className="w-full"
                         onClick={() => handleOAuthConnect('google')}
                       >
                         <Globe className="h-4 w-4 mr-2" />
                         התחבר עם Google
                       </Button>
                     </div>
                   )}
                   {showConfig === "facebook" && (
                     <div className="space-y-4">
                       <div>
                         <Label htmlFor="facebook-email">אימייל Facebook</Label>
                         <Input
                           id="facebook-email"
                           type="email"
                           placeholder="name@example.com"
                           value={credentials.facebook_email || ''}
                           onChange={(e) => setCredentials(prev => ({ ...prev, facebook_email: e.target.value }))}
                         />
                       </div>
                       <div>
                         <Label htmlFor="facebook-password">סיסמה</Label>
                         <Input
                           id="facebook-password"
                           type="password"
                           placeholder="הזן את הסיסמה שלך"
                           value={credentials.facebook_password || ''}
                           onChange={(e) => setCredentials(prev => ({ ...prev, facebook_password: e.target.value }))}
                         />
                       </div>
                       <div className="text-center">
                         <span className="text-sm text-muted-foreground">או</span>
                       </div>
                       <Button
                         variant="outline"
                         className="w-full"
                         onClick={() => handleOAuthConnect('facebook')}
                       >
                         <Facebook className="h-4 w-4 mr-2" />
                         התחבר עם Facebook
                       </Button>
                     </div>
                   )}
                   {showConfig === "trustpilot" && (
                     <div className="space-y-4">
                       <div>
                         <Label htmlFor="trustpilot-email">אימייל Trustpilot</Label>
                         <Input
                           id="trustpilot-email"
                           type="email"
                           placeholder="name@example.com"
                           value={credentials.trustpilot_email || ''}
                           onChange={(e) => setCredentials(prev => ({ ...prev, trustpilot_email: e.target.value }))}
                         />
                       </div>
                       <div>
                         <Label htmlFor="trustpilot-password">סיסמה</Label>
                         <Input
                           id="trustpilot-password"
                           type="password"
                           placeholder="הזן את הסיסמה שלך"
                           value={credentials.trustpilot_password || ''}
                           onChange={(e) => setCredentials(prev => ({ ...prev, trustpilot_password: e.target.value }))}
                         />
                       </div>
                     </div>
                   )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleConnect(showConfig)}
                      disabled={!credentials[showConfig]}
                      className="flex-1"
                    >
                      Connect
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfig(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformConnection;