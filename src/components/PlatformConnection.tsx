import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Loader2, AlertTriangle, Trash2, Archive } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConnectedAccountsList from "./ConnectedAccountsList";

interface Platform {
  name: string;
  connected: boolean;
  reviewCount?: number;
  logo: string;
  description: string;
}

interface ConnectionInfo {
  id: string;
  platform: string;
  connected: boolean;
  reviewCount?: number;
  businessId?: string;
  businessName?: string;
  lastSync?: string;
}

interface Business {
  id: string;
  name: string;
  address: string;
}

const PlatformConnection = () => {
  const { t, language } = useTranslation();
  const align = language === 'he' || language === 'ar' ? 'text-right' : 'text-left';
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showBusinessSelection, setShowBusinessSelection] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [currentPlatform, setCurrentPlatform] = useState<string>('');
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);
  const [disconnectDialog, setDisconnectDialog] = useState<{
    open: boolean;
    accountId: string;
    platform: string;
    accountName: string;
    reviewCount: number;
    deleting: boolean;
  } | null>(null);
  
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
      
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Error checking platform connections:', error);
      toast.error(t('errors.connectionCheck'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async (platformName: string) => {
    // Show dialog IMMEDIATELY with loading spinner — don't wait 20s
    setBusinesses([]);
    setCurrentPlatform(platformName);
    setSelectedBusiness('');
    setLoadingBusinesses(true);
    setShowBusinessSelection(true); // open NOW

    try {
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'get_businesses', 
          platform: platformName.toLowerCase() 
        }
      });

      if (error) throw error;
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error(t('errors.businessFetchFailed'));
      setShowBusinessSelection(false);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const selectBusiness = async (businessId: string) => {
    try {
      const selected = businesses.find(b => b.id === businessId);
      const { error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'select_business', 
          platform: currentPlatform.toLowerCase(),
          businessId,
          businessName: selected?.name
        }
      });

      if (error) throw error;
      
      toast.success(t('platforms.businessSelected'));
      setShowBusinessSelection(false);
      
      // Find the connection record that was just created/updated
      const { data: connectionData, error: connError } = await supabase
        .from('platform_connections')
        .select('id')
        .eq('external_business_id', businessId)
        .eq('platform', currentPlatform.toLowerCase())
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (connError || !connectionData) {
        console.error('Could not find connection record:', connError);
        await checkPlatformConnections(); // Refresh anyway
        return;
      }

      // Auto-sync reviews immediately
      toast.info(t('platformConnection.autoSyncStarting') || 'Starting automatic sync...');
      try {
        const { data, error: syncError } = await supabase.functions.invoke('sync-reviews', {
          body: { 
            action: 'sync_by_connection',
            connectionId: connectionData.id,
            platform: currentPlatform.toLowerCase()
          }
        });

        if (syncError) throw syncError;

        toast.success(`${t('platformConnection.syncSuccess')} ${data?.newReviews || 0}/${data?.reviewCount || 0}`);
      } catch (syncError) {
        console.error('Sync error:', syncError);
        toast.error(t('platformConnection.syncError') || 'Sync failed');
      }
      
      // Refresh connection status
      await checkPlatformConnections();
    } catch (error) {
      console.error('Error selecting business:', error);
      toast.error(t('errors.businessSelectionFailed'));
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
          // Accept messages from our app origin AND Supabase Functions origin
          const allowedOrigins = [
            window.location.origin,
            'https://epwriqkyqxwewwcxbnsu.supabase.co'
          ];
          if (!allowedOrigins.includes(event.origin)) return;

          const isSuccess = event.data?.type === 'oauth_success' || event.data?.success === true;
          const isError = event.data?.type === 'oauth_error' || !!event.data?.error;

          if (isSuccess) {
            popup?.close();
            toast.success(t('platforms.connected'));
            setConnectingPlatform(null);
            // Fetch businesses after successful connection
            setTimeout(() => {
              fetchBusinesses(platformName);
            }, 500);
            window.removeEventListener('message', messageListener);
          } else if (isError) {
            popup?.close();
            toast.error(t('errors.connectionFailed'));
            setConnectingPlatform(null);
            window.removeEventListener('message', messageListener);
          }
        };

        window.addEventListener('message', messageListener);

        // Fallback: Poll connection status in case postMessage is blocked
        const pollConnection = setInterval(async () => {
          try {
            const { data: status } = await supabase.functions.invoke('sync-reviews', {
              body: { action: 'check_connection', platform: 'google' }
            });
            if (status?.connected) {
              clearInterval(pollConnection);
              popup?.close();
              window.removeEventListener('message', messageListener);
              toast.success(t('platforms.connected'));
              setConnectingPlatform(null);
              fetchBusinesses(platformName);
            }
          } catch (_) {
            // ignore transient errors
          }
        }, 1000);

        // Handle popup close without completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            clearInterval(pollConnection); // prevent orphaned polling
            window.removeEventListener('message', messageListener);
            setConnectingPlatform(null);
          }
        }, 1000);

      } else if (platformName === 'Facebook') {
        const { data, error } = await supabase.functions.invoke('sync-reviews', {
          body: { 
            action: 'get_oauth_url', 
            platform: 'facebook' 
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
          // Accept messages from our app origin AND Supabase Functions origin
          const allowedOrigins = [
            window.location.origin,
            'https://epwriqkyqxwewwcxbnsu.supabase.co'
          ];
          if (!allowedOrigins.includes(event.origin)) return;

          const isSuccess = event.data?.type === 'oauth_success' || event.data?.success === true;
          const isError = event.data?.type === 'oauth_error' || !!event.data?.error;

          if (isSuccess) {
            popup?.close();
            toast.success(t('platforms.connected'));
            setConnectingPlatform(null);
            // Fetch businesses after successful connection
            setTimeout(() => {
              fetchBusinesses(platformName);
            }, 500);
            window.removeEventListener('message', messageListener);
          } else if (isError) {
            popup?.close();
            toast.error(t('errors.connectionFailed'));
            setConnectingPlatform(null);
            window.removeEventListener('message', messageListener);
          }
        };

        window.addEventListener('message', messageListener);

        // Fallback: Poll connection status in case postMessage is blocked
        const pollConnection = setInterval(async () => {
          try {
            const { data: status } = await supabase.functions.invoke('sync-reviews', {
              body: { action: 'check_connection', platform: 'facebook' }
            });
            if (status?.connected) {
              clearInterval(pollConnection);
              popup?.close();
              window.removeEventListener('message', messageListener);
              toast.success(t('platforms.connected'));
              setConnectingPlatform(null);
              fetchBusinesses(platformName);
            }
          } catch (_) {
            // ignore transient errors
          }
        }, 1000);

        // Handle popup close without completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            clearInterval(pollConnection); // prevent orphaned polling
            window.removeEventListener('message', messageListener);
            setConnectingPlatform(null);
          }
        }, 1000);

      } else {
        toast.error(t('errors.platformNotSupported'));
        setConnectingPlatform(null);
      }
    } catch (error) {
      console.error('Error connecting to platform:', error);
      toast.error(t('errors.connectionFailed'));
      setConnectingPlatform(null);
    }
    // Note: setConnectingPlatform(null) is NOT called here in finally —
    // it is called inside each branch (success, error, popup-closed) because
    // the OAuth popup is async and the try block returns immediately after
    // setting up the intervals.
  };

  const handleSyncAccount = async (accountId: string, platform: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSyncingAccount(accountId);
    try {
      toast.loading(t('platformConnection.syncing'));
      
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'sync_by_connection', 
          connectionId: accountId,
          platform: platform.toLowerCase()
        }
      });

      if (error) throw error;

      toast.success(`${t('platformConnection.syncSuccess')} ${data?.newReviews || 0}/${data?.reviewCount || 0}`);
      
      await checkPlatformConnections();
    } catch (error) {
      console.error('Error syncing reviews:', error);
      toast.error(t('platformConnection.syncFailed'));
    } finally {
      setSyncingAccount(null);
    }
  };

  const handleSyncAll = async (platform: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSyncingAccount(`all_${platform}`);
    try {
      toast.loading(t('platformConnection.syncingAll'));
      
      const { data, error } = await supabase.functions.invoke('sync-reviews', {
        body: { 
          action: 'sync_all_platform', 
          platform: platform.toLowerCase()
        }
      });

      if (error) throw error;

      toast.success(`${t('platformConnection.syncSuccess')} ${data?.newReviews || 0}/${data?.reviewCount || 0}`);
      
      await checkPlatformConnections();
    } catch (error) {
      console.error('Error syncing all accounts:', error);
      toast.error(t('platformConnection.syncFailed'));
    } finally {
      setSyncingAccount(null);
    }
  };

  const handleDisconnectAccount = (accountId: string, platform: string) => {
    // Find the account details
    const account = connections.find(c => c.id === accountId);
    setDisconnectDialog({
      open: true,
      accountId,
      platform,
      accountName: account?.businessName || platform,
      reviewCount: account?.reviewCount || 0,
      deleting: false,
    });
  };

  const confirmDisconnect = async (keepReviews: boolean) => {
    if (!disconnectDialog) return;
    const { accountId, platform } = disconnectDialog;

    setDisconnectDialog(prev => prev ? { ...prev, deleting: true } : null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Option 1: Delete reviews FIRST, then connection
      if (!keepReviews) {
        const { error: reviewsErr } = await supabase
          .from('reviews')
          .delete()
          .eq('connection_id', accountId)
          .eq('user_id', user.id);

        if (reviewsErr) {
          toast.error('Failed to delete reviews: ' + reviewsErr.message);
          setDisconnectDialog(prev => prev ? { ...prev, deleting: false } : null);
          return;
        }
        toast.success('Reviews deleted');
      }

      // Delete the connection row
      const { error: connErr } = await supabase
        .from('platform_connections')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (connErr) {
        toast.error('Could not remove account: ' + connErr.message);
        setDisconnectDialog(prev => prev ? { ...prev, deleting: false } : null);
        checkPlatformConnections();
        return;
      }

      // Delete token only if this was the last connection for the platform
      const remainingConnections = connections.filter(
        c => c.id !== accountId && c.platform.toLowerCase() === platform.toLowerCase()
      );
      if (remainingConnections.length === 0) {
        await supabase
          .from('platform_tokens')
          .delete()
          .eq('user_id', user.id)
          .eq('platform', platform.toLowerCase());
      }

      toast.success(
        keepReviews
          ? `${platform} account removed (reviews kept)`
          : `${platform} account and all its reviews removed`
      );
      setDisconnectDialog(null);
      checkPlatformConnections();
    } catch (error) {
      console.error('Error disconnecting:', error);
      setDisconnectDialog(prev => prev ? { ...prev, deleting: false } : null);
      toast.error(t('errors.disconnectionFailed'));
    }
  };

  const getPlatformData = (platform: any) => {
    const platformConnections = connections.filter(
      c => c.platform.toLowerCase() === platform.name.toLowerCase() && c.connected
    );
    
    const totalReviews = platformConnections.reduce((sum, conn) => sum + (conn.reviewCount || 0), 0);
    
    return {
      ...platform,
      connected: platformConnections.length > 0,
      reviewCount: totalReviews,
      connections: platformConnections
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
              
              {platform.connected && platform.reviewCount !== undefined && platform.reviewCount > 0 && (
                <p className={`text-sm text-blue-600 dark:text-blue-400 mb-4 ${align}`}>
                  {t('platformConnection.total')}: {platform.reviewCount} {t('platformConnection.reviews')}
                </p>
              )}

              {platform.connected && (platform as any).connections && (platform as any).connections.length > 0 && (
                <div className="mb-4">
                  <ConnectedAccountsList
                    accounts={(platform as any).connections}
                    onSync={handleSyncAccount}
                    onSyncAll={handleSyncAll}
                    onDisconnect={handleDisconnectAccount}
                    syncing={syncingAccount}
                    align={align}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={platform.connected ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleConnect(platform.name)}
                  disabled={connectingPlatform === platform.name}
                >
                  {connectingPlatform === platform.name ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {platform.connected ? t('platformConnection.addAccount') : t('platformConnection.connect')}
                </Button>
              </div>
            </div>
            );
          })}
        </div>
      </CardContent>
      
      {/* Business Selection Dialog */}
      <Dialog open={showBusinessSelection} onOpenChange={setShowBusinessSelection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={align}>
              {t('platforms.selectBusiness')}
            </DialogTitle>
          </DialogHeader>
          
          {loadingBusinesses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">{t('platforms.loadingBusinesses')}</span>
            </div>
          ) : businesses.length > 0 ? (
            <div className="space-y-4">
              <p className={`text-sm text-gray-600 dark:text-gray-400 ${align}`}>
                {t('platforms.businessSelectionDescription')}
              </p>
              
              <Select onValueChange={setSelectedBusiness} value={selectedBusiness}>
                <SelectTrigger>
                  <SelectValue placeholder={t('platforms.chooseBusiness')} />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      <div className={align}>
                        <div className="font-medium">{business.name}</div>
                        <div className="text-sm text-gray-500">{business.address}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBusinessSelection(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => selectedBusiness && selectBusiness(selectedBusiness)}
                  disabled={!selectedBusiness}
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={`text-gray-600 dark:text-gray-400 ${align}`}>
                {t('platforms.noBusinessesFound')}
              </p>
              <Button
                variant="outline"
                onClick={() => setShowBusinessSelection(false)}
                className="mt-4"
              >
                {t('common.close')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={!!disconnectDialog?.open}
        onOpenChange={(open) => {
          if (!open && !disconnectDialog?.deleting) setDisconnectDialog(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('platformConnection.disconnectTitle')}
            </DialogTitle>
            <DialogDescription className={align}>
              {`${t('platformConnection.disconnectSubtitle')}: "${disconnectDialog?.accountName}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {(disconnectDialog?.reviewCount ?? 0) > 0 && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {t('platformConnection.reviewsWillBeAffected') ||
                    `This account has ${disconnectDialog?.reviewCount} reviews in the system. What would you like to do with them?`}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 pt-1">
              {/* Keep reviews */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4"
                onClick={() => confirmDisconnect(true)}
                disabled={disconnectDialog?.deleting}
              >
                <Archive className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className={`text-start ${align}`}>
                  <div className="font-medium">
                    {t('platformConnection.keepReviews')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('platformConnection.keepReviewsDesc')}
                  </div>
                </div>
              </Button>

              {/* Delete reviews */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                onClick={() => confirmDisconnect(false)}
                disabled={disconnectDialog?.deleting}
              >
                {disconnectDialog?.deleting ? (
                  <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                ) : (
                  <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                <div className={`text-start ${align}`}>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    {t('platformConnection.deleteReviews')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('platformConnection.deleteReviewsDesc')}
                  </div>
                </div>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setDisconnectDialog(null)}
              disabled={disconnectDialog?.deleting}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>

  );
};

export default PlatformConnection;