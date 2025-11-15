import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
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
