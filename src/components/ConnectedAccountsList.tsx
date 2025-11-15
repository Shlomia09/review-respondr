import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";

interface ConnectedAccount {
  id: string;
  platform: string;
  connected: boolean;
  reviewCount: number;
  businessId: string;
  businessName: string;
  lastSync?: string;
}

interface ConnectedAccountsListProps {
  accounts: ConnectedAccount[];
  onSync: (accountId: string, platform: string) => void;
  onSyncAll: (platform: string) => void;
  onDisconnect: (accountId: string, platform: string) => void;
  syncing?: string | null;
  align: string;
}

const ConnectedAccountsList: React.FC<ConnectedAccountsListProps> = ({
  accounts,
  onSync,
  onSyncAll,
  onDisconnect,
  syncing,
  align,
}) => {
  const { t } = useTranslation();

  if (accounts.length === 0) {
    return null;
  }

  const platformAccounts = accounts.filter(a => a.connected);
  if (platformAccounts.length === 0) {
    return null;
  }

  const platform = platformAccounts[0].platform;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-medium ${align}`}>
          {t('platformConnection.connectedAccounts') || 'חשבונות מחוברים'} ({platformAccounts.length})
        </p>
        {platformAccounts.length > 1 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSyncAll(platform)}
            disabled={!!syncing}
            className="text-xs"
          >
            {syncing === `all_${platform}` ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            {t('platformConnection.syncAll') || 'סנכרן הכל'}
          </Button>
        )}
      </div>

      {platformAccounts.map((account) => (
        <div
          key={account.id}
          className="border rounded-md p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className={`font-medium text-sm truncate ${align}`}>
                  {account.businessName}
                </h5>
                <Badge variant="secondary" className="text-xs">
                  {account.reviewCount} {t('platformConnection.reviews')}
                </Badge>
              </div>
              {account.lastSync && (
                <p className={`text-xs text-muted-foreground ${align}`}>
                  {t('platformConnection.lastSync')}: {format(new Date(account.lastSync), 'dd/MM/yyyy HH:mm')}
                </p>
              )}
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onSync(account.id, platform)}
                disabled={!!syncing}
              >
                {syncing === account.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => onDisconnect(account.id, platform)}
                disabled={!!syncing}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConnectedAccountsList;
