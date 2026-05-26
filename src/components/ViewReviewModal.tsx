import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  platform: string;
  review_date: string;
  ai_response?: string;
  manual_response?: string;
  response_status: 'pending' | 'generated' | 'approved' | 'sent';
  business_name?: string;
  business_id?: string;
  requires_manual_attention?: boolean;
  attention_reason?: string;
  attention_priority?: 'low' | 'medium' | 'high' | 'urgent';
  review_url?: string;
}

interface ViewReviewModalProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReviewModal({ review, open, onOpenChange }: ViewReviewModalProps) {
  const { t } = useTranslation();

  if (!review) return null;

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      neutral: "bg-muted text-muted-foreground"
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('reviews.reviewDetails')}</DialogTitle>
          <DialogDescription>
            {t('reviews.viewReviewDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer & Platform Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{review.customer_name}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(review.review_date).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {review.platform}
            </Badge>
          </div>

          {/* Rating & Sentiment */}
          <div className="flex items-center gap-4">
            {renderStars(review.rating)}
            <Badge className={getSentimentColor(review.sentiment)}>
              {t(`dashboard.${review.sentiment}`)}
            </Badge>
          </div>

          {/* Business Name */}
          {review.business_name && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t('reviews.business')}: <span className="font-medium text-foreground">{review.business_name}</span>
              </p>
            </div>
          )}

          {/* Review Content */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">{t('reviews.reviewContent')}</h4>
            <p className="text-sm whitespace-pre-wrap">{review.content}</p>
          </div>

          {/* Manual Attention Required */}
          {review.requires_manual_attention && (
            review.attention_reason === 'facebook_recommendation' ? (
              // Facebook Recommendations cannot be replied to via the API (Error Code 12).
              // Show a clear info banner with a direct link to the Facebook Page reviews tab.
              <div className="border border-blue-300 rounded-lg p-4 bg-blue-50 dark:bg-blue-950 dark:border-blue-700">
                <h4 className="font-semibold mb-1 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <span>📌</span> Reply Required on Facebook
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                  Facebook Recommendations can only be replied to manually through the Facebook Page Manager.
                  Click the button below to open the reviews tab and post your reply there.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-400 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900"
                  onClick={() => {
                    const url = review.review_url ||
                      (review.business_id ? `https://www.facebook.com/${review.business_id}/reviews` : 'https://www.facebook.com');
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Facebook
                </Button>
              </div>
            ) : (
              <div className={`
                border rounded-lg p-4 
                ${review.attention_priority === 'urgent' ? 'bg-red-50 border-red-500 dark:bg-red-950 dark:border-red-500' : ''}
                ${review.attention_priority === 'high' ? 'bg-orange-50 border-orange-500 dark:bg-orange-950 dark:border-orange-500' : ''}
                ${review.attention_priority === 'medium' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950 dark:border-yellow-500' : ''}
                ${!review.attention_priority || review.attention_priority === 'low' ? 'bg-blue-50 border-blue-500 dark:bg-blue-950 dark:border-blue-500' : ''}
              `}>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  ⚠️ {t('reviews.requiresAttention')}
                  {review.attention_priority && (
                    <Badge 
                      variant="outline" 
                      className={`
                        ${review.attention_priority === 'urgent' ? 'border-red-600 text-red-600' : ''}
                        ${review.attention_priority === 'high' ? 'border-orange-600 text-orange-600' : ''}
                        ${review.attention_priority === 'medium' ? 'border-yellow-600 text-yellow-600' : ''}
                        ${review.attention_priority === 'low' ? 'border-blue-600 text-blue-600' : ''}
                      `}
                    >
                      {t(`reviews.priority.${review.attention_priority}`)}
                    </Badge>
                  )}
                </h4>
                {review.attention_reason && (
                  <p className="text-sm">{review.attention_reason}</p>
                )}
              </div>
            )
          )}

          {/* AI Response */}
          {review.ai_response && (
            <div className="border rounded-lg p-4 bg-primary/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">AI</span>
                {t('reviews.response')}
              </h4>
              <p className="text-sm whitespace-pre-wrap">{review.ai_response}</p>
            </div>
          )}

          {/* Manual Response */}
          {review.manual_response && (
            <div className="border rounded-lg p-4 bg-secondary/5">
              <h4 className="font-semibold mb-2">{t('reviews.manualResponse')}</h4>
              <p className="text-sm whitespace-pre-wrap">{review.manual_response}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="text-sm text-muted-foreground">
              {t('reviews.status')}: <Badge variant="outline" className="capitalize">{t(`reviewCard.${review.response_status}`)}</Badge>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
