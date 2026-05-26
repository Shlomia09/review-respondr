import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReviewCard from "@/components/ReviewCard";
import PlatformConnection from "@/components/PlatformConnection";
import { BusinessSetupModal } from "@/components/BusinessSetupModal";
import { ManualResponseModal } from "@/components/ManualResponseModal";
import { AIInstructionsModal } from "@/components/AIInstructionsModal";
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Filter,
  Search,
  BarChart3,
  LogOut,
  Settings,
  Plus,
  Clock,
  CheckCircle,
  Send
} from "lucide-react";
import { KPIDashboard } from "@/components/KPIDashboard";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface DatabaseReview {
  id: string;
  customer_name: string;
  customer_email?: string;
  platform: string;
  rating: number;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  ai_response?: string;
  manual_response?: string;
  ai_instructions?: string;
  response_status: 'pending' | 'generated' | 'approved' | 'sent';
  review_date: string;
  created_at: string;
  updated_at: string;
}

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
  external_review_id?: string;
  attention_reason?: string;
  review_url?: string;
  business_id?: string;
}

const Dashboard = () => {
  const { t, language } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("new");
  const [generatingResponses, setGeneratingResponses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showBusinessSetup, setShowBusinessSetup] = useState(false);
  const [showManualResponse, setShowManualResponse] = useState(false);
  const [showAIInstructions, setShowAIInstructions] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
        await Promise.all([
          fetchReviews(),
          checkBusinessProfile(user.id)
        ]);
      }
      setLoading(false);
    };
    getUser();
  }, [navigate]);

  const checkBusinessProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking business profile:', error);
        return;
      }

      setHasBusinessProfile(!!data);
      
      // Show setup modal if no profile exists and user didn't skip
      if (!data) {
        const skipped = localStorage.getItem('skipBusinessSetup') === 'true';
        if (!skipped) setShowBusinessSetup(true);
      }
    } catch (error) {
      console.error('Error checking business profile:', error);
    }
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: t('dashboard.errorFetching'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Transform database reviews to match ReviewCard interface
      // Note: DB column was renamed from customer_name → author_name in migration
      const transformedReviews: Review[] = (data || []).map((dbReview: any) => ({
        id: dbReview.id,
        customer_name: dbReview.author_name || dbReview.customer_name || 'Anonymous',
        rating: dbReview.rating,
        content: dbReview.content,
        sentiment: dbReview.sentiment,
        platform: dbReview.platform,
        review_date: dbReview.review_date,
        ai_response: dbReview.ai_response,
        manual_response: dbReview.manual_response,
        ai_instructions: dbReview.ai_instructions,
        response_status: dbReview.response_status || 'pending',
        external_review_id: dbReview.external_review_id,
        attention_reason: dbReview.attention_reason,
        review_url: dbReview.review_url,
        business_id: dbReview.business_id,
      }));
      setReviews(transformedReviews);
    }
  };

  useEffect(() => {
    let filtered = reviews;
    
    // Filter by active tab first
    if (activeTab === "new") {
      filtered = filtered.filter(review => review.response_status === 'pending');
    } else if (activeTab === "waiting") {
      filtered = filtered.filter(review => review.response_status === 'generated');
    } else if (activeTab === "processed") {
      filtered = filtered.filter(review => ['approved', 'sent'].includes(review.response_status));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sentimentFilter !== "all") {
      filtered = filtered.filter(review => review.sentiment === sentimentFilter);
    }
    
    if (platformFilter !== "all") {
      filtered = filtered.filter(review => review.platform.toLowerCase() === platformFilter);
    }
    
    setFilteredReviews(filtered);
  }, [reviews, searchTerm, sentimentFilter, platformFilter, activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getStats = () => {
    const total = reviews.length;
    const positive = reviews.filter(r => r.sentiment === "positive").length;
    const negative = reviews.filter(r => r.sentiment === "negative").length;
    const neutral = reviews.filter(r => r.sentiment === "neutral").length;
    const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const responseRate = total > 0 ? (reviews.filter(r => r.ai_response || r.manual_response).length / total) * 100 : 0;
    
    // Stats by tab
    const newReviews = reviews.filter(r => r.response_status === 'pending').length;
    const waitingReviews = reviews.filter(r => r.response_status === 'generated').length;
    const processedReviews = reviews.filter(r => ['approved', 'sent'].includes(r.response_status)).length;
    
    return { total, positive, negative, neutral, avgRating, responseRate, newReviews, waitingReviews, processedReviews };
  };

  const stats = getStats();

  const detectLanguage = (text: string): 'he' | 'ar' | 'ru' | 'es' | 'de' | 'en' => {
    if (/\p{Script=Hebrew}/u.test(text) || /[\u0590-\u05FF]/.test(text)) return 'he';
    if (/\p{Script=Arabic}/u.test(text) || /[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[\u0400-\u04FF]/.test(text)) return 'ru';
    if (/[ñáéíóúü¡¿]/i.test(text)) return 'es';
    if (/[äöüß]/i.test(text)) return 'de';
    return 'en';
  };

  const handleGenerateResponse = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    setGeneratingResponses(prev => new Set([...prev, reviewId]));

    try {
      // Get user session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call AI assistant function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'generate_response',
          reviewId: review.id,
          reviewContent: review.content,
          customerName: review.customer_name,
          rating: review.rating,
          platform: review.platform,
          businessType: t('businessSetup.types.other'),
          aiInstructions: review.ai_instructions,
          targetLanguage: detectLanguage(review.content)
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error generating response:', error);
        throw error;
      }

      if (data?.success) {
        toast({
          title: t('dashboard.aiResponseGenerated'),
          description: t('dashboard.responseWaitingApproval'),
        });
        
        // Immediately update the local state to show the response
        setReviews(prev => prev.map(r => 
          r.id === reviewId 
            ? { 
                ...r, 
                ai_response: data.ai_response, 
                response_status: 'generated' as const
              } 
            : r
        ));
        
        // Also fetch fresh data from server
        setTimeout(() => fetchReviews(), 1000);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: t('dashboard.error'),
        description: t('dashboard.failedToGenerate'),
        variant: "destructive",
      });
    } finally {
      setGeneratingResponses(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleApproveResponse = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ response_status: 'approved' })
        .eq('id', reviewId);

      if (error) {
        console.error('Error approving response:', error);
        toast({
          title: t('dashboard.error'),
          description: t('dashboard.failedToApprove'),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('dashboard.responseApproved'),
        description: t('dashboard.responseApprovedSuccess'),
      });
      
      // Optimistic update: move item to processed
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, response_status: 'approved' as const } : r));
      
      await fetchReviews();
    } catch (error) {
      console.error('Error approving response:', error);
    }
  };

  const handleSendResponse = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Facebook does not support replying to reviews via the Graph API.
    // Redirect the business owner to Facebook to respond manually.
    if (review.platform === 'facebook') {
      const url = review.review_url ||
        (review.business_id ? `https://www.facebook.com/${review.business_id}/reviews` : 'https://www.facebook.com');
      window.open(url, '_blank', 'noopener,noreferrer');
      toast({
        title: 'Open Facebook',
        description: 'Facebook reviews must be replied to manually on Facebook.',
      });
      return;
    }

    try {
      // Call the Edge Function to post the reply to the platform (Google, Trustpilot, etc.)
      const { data, error } = await supabase.functions.invoke('send-review-response', {
        body: { reviewId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.message || data.error);

      toast({
        title: t('dashboard.responseSent'),
        description: t('dashboard.responseSentSuccess'),
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: t('dashboard.error'),
        description: error instanceof Error ? error.message : t('dashboard.failedToSend'),
        variant: "destructive",
      });
    }
  };

  const handleManualResponse = (review: Review) => {
    setSelectedReview(review);
    setShowManualResponse(true);
  };

  const handleAIInstructions = (review: Review) => {
    setSelectedReview(review);
    setShowAIInstructions(true);
  };

  const handleAIInstructionsComplete = async (reviewId: string) => {
    // After saving instructions, generate AI response
    await handleGenerateResponse(reviewId);
  };

  const handleRegenerateResponse = async (reviewId: string) => {
    // Same logic as generating response - regenerate the AI response
    await handleGenerateResponse(reviewId);
  };

  const handleBusinessSetupComplete = () => {
    setHasBusinessProfile(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Enhanced KPI Dashboard */}
      <KPIDashboard stats={stats} />

      {/* Platform Connections */}
      <PlatformConnection />

      {/* Reviews Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('dashboard.newReviews')}
              {stats.newReviews > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.newReviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="waiting" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('dashboard.waitingApproval')}
              {stats.waitingReviews > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.waitingReviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('dashboard.processedResponses')}
              {stats.processedReviews > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.processedReviews}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('dashboard.filterReviews')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('dashboard.searchReviews')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-[140px] sm:w-[180px]">
                    <SelectValue placeholder={t('dashboard.filterBySentiment')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.allSentiments')}</SelectItem>
                    <SelectItem value="positive">{t('dashboard.positive')}</SelectItem>
                    <SelectItem value="negative">{t('dashboard.negative')}</SelectItem>
                    <SelectItem value="neutral">{t('dashboard.neutral')}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-[120px] sm:w-[150px]">
                    <SelectValue placeholder={t('dashboard.filterByPlatform')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.allPlatforms')}</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="trustpilot">Trustpilot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </CardContent>
          </Card>

          <TabsContent value="new">
            <div className="space-y-6 mt-6">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {t('dashboard.noNewReviews')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('dashboard.noNewReviewsDesc')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onGenerateResponse={handleGenerateResponse}
                    onApproveResponse={handleApproveResponse}
                    onSendResponse={handleSendResponse}
                    onManualResponse={handleManualResponse}
                    onAIInstructions={handleAIInstructions}
                    onRegenerateResponse={handleRegenerateResponse}
                    isGenerating={generatingResponses.has(review.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="waiting">
            <div className="space-y-6 mt-6">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {t('dashboard.noWaitingReviews')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('dashboard.noWaitingReviewsDesc')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onGenerateResponse={handleGenerateResponse}
                    onApproveResponse={handleApproveResponse}
                    onSendResponse={handleSendResponse}
                    onManualResponse={handleManualResponse}
                    onAIInstructions={handleAIInstructions}
                    onRegenerateResponse={handleRegenerateResponse}
                    isGenerating={generatingResponses.has(review.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="processed">
            <div className="space-y-6 mt-6">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {t('dashboard.noProcessedReviews')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('dashboard.noProcessedReviewsDesc')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onGenerateResponse={handleGenerateResponse}
                    onApproveResponse={handleApproveResponse}
                    onSendResponse={handleSendResponse}
                    onManualResponse={handleManualResponse}
                    onAIInstructions={handleAIInstructions}
                    onRegenerateResponse={handleRegenerateResponse}
                    isGenerating={generatingResponses.has(review.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <BusinessSetupModal
          isOpen={showBusinessSetup}
          onClose={() => setShowBusinessSetup(false)}
          onComplete={handleBusinessSetupComplete}
          onSkip={() => { localStorage.setItem('skipBusinessSetup', 'true'); setShowBusinessSetup(false); }}
        />
        
        <ManualResponseModal
          isOpen={showManualResponse}
          onClose={() => setShowManualResponse(false)}
          review={selectedReview}
          onSuccess={fetchReviews}
        />
        
        <AIInstructionsModal
          isOpen={showAIInstructions}
          onClose={() => setShowAIInstructions(false)}
          review={selectedReview}
          onSuccess={handleAIInstructionsComplete}
        />
    </div>
  );
};

export default Dashboard;