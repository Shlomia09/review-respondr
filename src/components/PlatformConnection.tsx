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
                    Enter your API credentials to connect this platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showConfig === "google" && (
                    <div>
                      <Label htmlFor="google-api">Google Places API Key</Label>
                      <Input
                        id="google-api"
                        type="password"
                        placeholder="Enter your Google Places API key"
                        value={credentials.google || ''}
                        onChange={(e) => setCredentials(prev => ({ ...prev, google: e.target.value }))}
                      />
                    </div>
                  )}
                  {showConfig === "facebook" && (
                    <div>
                      <Label htmlFor="facebook-token">Facebook Access Token</Label>
                      <Input
                        id="facebook-token"
                        type="password"
                        placeholder="Enter your Facebook access token"
                        value={credentials.facebook || ''}
                        onChange={(e) => setCredentials(prev => ({ ...prev, facebook: e.target.value }))}
                      />
                    </div>
                  )}
                  {showConfig === "trustpilot" && (
                    <div>
                      <Label htmlFor="trustpilot-api">Trustpilot API Key</Label>
                      <Input
                        id="trustpilot-api"
                        type="password"
                        placeholder="Enter your Trustpilot API key"
                        value={credentials.trustpilot || ''}
                        onChange={(e) => setCredentials(prev => ({ ...prev, trustpilot: e.target.value }))}
                      />
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