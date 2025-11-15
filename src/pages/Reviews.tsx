import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ReviewsTable } from "@/components/ReviewsTable";
import { ViewReviewModal } from "@/components/ViewReviewModal";
import { ManualResponseModal } from "@/components/ManualResponseModal";
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
  requires_manual_attention?: boolean;
  attention_reason?: string;
  attention_priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export function Reviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewReviewModal, setViewReviewModal] = useState<{ open: boolean; review: Review | null }>({
    open: false,
    review: null
  });
  const [editResponseModal, setEditResponseModal] = useState<{ open: boolean; review: Review | null }>({
    open: false,
    review: null
  });
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
        requires_manual_attention: dbReview.requires_manual_attention || false,
        attention_reason: dbReview.attention_reason,
        attention_priority: dbReview.attention_priority,
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
      if (action === 'generateAI') {
        // Generate AI responses for all selected reviews
        const promises = selectedIds.map(id => 
          supabase.functions.invoke('generate-review-response', {
            body: { reviewId: id }
          })
        );
        
        await Promise.all(promises);
        
        toast({
          title: t('reviews.success'),
          description: `${selectedIds.length} ${t('reviews.bulkAIGenerated')}`,
        });
      } else {
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
      }
      
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
    setViewReviewModal({ open: true, review });
  };

  const handleEditResponse = (review: Review) => {
    setEditResponseModal({ open: true, review });
  };

  const handleGenerateAIResponse = async (reviewId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-review-response', {
        body: { reviewId }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: t('reviews.success'),
        description: t('reviews.aiResponseGenerated'),
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: t('dashboard.error'),
        description: error instanceof Error ? error.message : t('reviews.aiResponseFailed'),
        variant: "destructive",
      });
    }
  };

  const handleSendResponse = async (reviewId: string) => {
    try {
      // For now, just update status to 'sent'
      // In the future, this will actually send to the platform
      const { error } = await supabase
        .from('reviews')
        .update({ response_status: 'sent' })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: t('reviews.success'),
        description: t('reviews.responseSentSuccess'),
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: t('dashboard.error'),
        description: t('reviews.responseSentFailed'),
        variant: "destructive",
      });
    }
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
        onGenerateAIResponse={handleGenerateAIResponse}
        onSendResponse={handleSendResponse}
      />

      <ViewReviewModal
        review={viewReviewModal.review}
        open={viewReviewModal.open}
        onOpenChange={(open) => setViewReviewModal({ open, review: null })}
      />

      <ManualResponseModal
        review={editResponseModal.review}
        isOpen={editResponseModal.open}
        onClose={() => setEditResponseModal({ open: false, review: null })}
        onSuccess={fetchReviews}
      />
    </div>
  );
}