import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Check, Clock, Send, Sparkles, Edit, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
  ai_instructions?: string;
  response_status: 'pending' | 'generating' | 'generated' | 'approved' | 'sent';
}

interface ReviewCardProps {
  review: Review;
  onGenerateResponse?: (reviewId: string) => void;
  onApproveResponse?: (reviewId: string) => void;
  onSendResponse?: (reviewId: string) => void;
  onManualResponse?: (review: Review) => void;
  onAIInstructions?: (review: Review) => void;
  isGenerating?: boolean;
}

const ReviewCard = ({ 
  review, 
  onGenerateResponse, 
  onApproveResponse, 
  onSendResponse,
  onManualResponse,
  onAIInstructions,
  isGenerating = false
}: ReviewCardProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "google":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "facebook":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "trustpilot":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  const getResponseStatus = () => {
    switch (review.response_status) {
      case 'sent':
        return { icon: Send, text: "נשלח", color: "text-green-600" };
      case 'approved':
        return { icon: Check, text: "אושר", color: "text-blue-600" };
      case 'generated':
        return { icon: Clock, text: "ממתין לאישור", color: "text-yellow-600" };
      case 'generating':
        return { icon: Clock, text: "מייצר...", color: "text-orange-600" };
      default:
        return null;
    }
  };

  const responseStatus = getResponseStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base">{review.customer_name}</h3>
              <Badge className={getPlatformColor(review.platform)} variant="secondary">
                {review.platform}
              </Badge>
              <Badge className={getSentimentColor(review.sentiment)} variant="secondary">
                {review.sentiment}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(review.rating)}</div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.review_date).toLocaleDateString('he-IL')}
              </span>
            </div>
          </div>
          {responseStatus && (
            <div className="flex items-center gap-1 text-sm">
              <responseStatus.icon className={cn("h-4 w-4", responseStatus.color)} />
              <span className={responseStatus.color}>{responseStatus.text}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-right">
            "{review.content}"
          </p>
        </div>

        {/* Show AI/Manual response if exists or if status is generated/approved */}
        {(review.ai_response || review.manual_response || review.response_status === 'generated' || review.response_status === 'approved') && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {review.manual_response ? "תגובה ידנית" : "תגובת AI"}
              </span>
              {review.ai_instructions && (
                <Badge variant="secondary" className="text-xs">
                  עם הוראות מיוחדות
                </Badge>
              )}
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed text-right">
              {review.manual_response || review.ai_response || "התגובה נוצרה בהצלחה"}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {review.response_status === 'pending' && (
            <>
              {onGenerateResponse && (
                <Button
                  size="sm"
                  onClick={() => onGenerateResponse(review.id)}
                  className="flex items-center gap-1"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      מייצר תגובה...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      צור תגובת AI
                    </>
                  )}
                </Button>
              )}

              {onAIInstructions && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAIInstructions(review)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  AI עם הוראות
                </Button>
              )}

              {onManualResponse && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onManualResponse(review)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  תגובה ידנית
                </Button>
              )}
            </>
          )}
          
          {review.response_status === 'generated' && onApproveResponse && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApproveResponse(review.id)}
              className="flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              אשר תגובה
            </Button>
          )}
          
          {review.response_status === 'approved' && onSendResponse && (
            <Button
              size="sm"
              onClick={() => onSendResponse(review.id)}
              className="flex items-center gap-1"
            >
              <Send className="h-3 w-3" />
              שלח תגובה
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;