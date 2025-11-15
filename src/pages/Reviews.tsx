import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ReviewsTable } from "@/components/ReviewsTable";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export function Reviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedReviews: Review[] = (data || []).map((dbReview: any) => ({
        id: dbReview.id,
        customer_name: dbReview.customer_name,
        rating: dbReview.rating,
        content: dbReview.content,
        sentiment: dbReview.sentiment,
        platform: dbReview.platform,
        review_date: dbReview.review_date,
        ai_response: dbReview.ai_response,
        manual_response: dbReview.manual_response,
        response_status: dbReview.response_status || 'pending',
        business_name: dbReview.business_name,
        business_id: dbReview.business_id,
      }));
      
      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: t('dashboard.error'),
        description: t('dashboard.errorFetching'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    try {
      let updates: any = {};
      
      if (action === 'approve') {
        updates = { response_status: 'approved' };
      } else if (action === 'send') {
        updates = { response_status: 'sent' };
      }

      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: t('reviews.success'),
        description: t(`reviews.bulk${action.charAt(0).toUpperCase() + action.slice(1)}Success`),
      });
      
      await fetchReviews();
    } catch (error) {
      console.error(`Error ${action} reviews:`, error);
      toast({
        title: t('dashboard.error'),
        description: t(`reviews.failed${action.charAt(0).toUpperCase() + action.slice(1)}`),
        variant: "destructive",
      });
    }
  };

  const handleViewReview = (review: Review) => {
    // TODO: Implement review detail modal
    console.log('View review:', review);
  };

  const handleEditResponse = (review: Review) => {
    // TODO: Implement edit response modal
    console.log('Edit response:', review);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: t('reviews.success'),
        description: t('reviews.deleteSuccess'),
      });
      
      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: t('dashboard.error'),
        description: t('reviews.deleteError'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('dashboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.reviews")}</h1>
      </div>

      <ReviewsTable 
        reviews={reviews}
        onBulkAction={handleBulkAction}
        onViewReview={handleViewReview}
        onEditResponse={handleEditResponse}
        onDeleteReview={handleDeleteReview}
      />
    </div>
  );
}