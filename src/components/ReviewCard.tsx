import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Check, Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  sentiment: "positive" | "neutral" | "negative";
  platform: string;
  review_date: string;
  ai_response?: {
    generated_response: string;
    is_approved: boolean;
    is_sent: boolean;
  };
}

interface ReviewCardProps {
  review: Review;
  onGenerateResponse?: (reviewId: string) => void;
  onApproveResponse?: (reviewId: string) => void;
  onEditResponse?: (reviewId: string) => void;
  onSendResponse?: (reviewId: string) => void;
}

const ReviewCard = ({ 
  review, 
  onGenerateResponse, 
  onApproveResponse, 
  onEditResponse, 
  onSendResponse 
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
    if (!review.ai_response) return null;
    if (review.ai_response.is_sent) return { icon: Send, text: "Sent", color: "text-green-600" };
    if (review.ai_response.is_approved) return { icon: Check, text: "Approved", color: "text-blue-600" };
    return { icon: Clock, text: "Pending", color: "text-yellow-600" };
  };

  const responseStatus = getResponseStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base">{review.reviewer_name}</h3>
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
                {new Date(review.review_date).toLocaleDateString()}
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
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            "{review.review_text}"
          </p>
        </div>

        {review.ai_response && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Generated Response
              </span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              {review.ai_response.generated_response}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!review.ai_response && onGenerateResponse && (
            <Button
              size="sm"
              onClick={() => onGenerateResponse(review.id)}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Generate AI Response
            </Button>
          )}
          
          {review.ai_response && !review.ai_response.is_sent && (
            <>
              {!review.ai_response.is_approved && onApproveResponse && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApproveResponse(review.id)}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Approve
                </Button>
              )}
              
              {onEditResponse && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditResponse(review.id)}
                >
                  Edit Response
                </Button>
              )}
              
              {review.ai_response.is_approved && onSendResponse && (
                <Button
                  size="sm"
                  onClick={() => onSendResponse(review.id)}
                  className="flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  Send Response
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;