import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReviewCard from "@/components/ReviewCard";
import PlatformConnection from "@/components/PlatformConnection";
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Filter,
  Search,
  BarChart3,
  LogOut,
  Settings,
  Plus
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface DatabaseReview {
  id: string;
  customer_name: string;
  customer_email?: string;
  platform: string;
  rating: number;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  ai_response?: string;
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
  response_status: 'pending' | 'generating' | 'generated' | 'approved' | 'sent';
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [generatingResponses, setGeneratingResponses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
        await fetchReviews();
      }
      setLoading(false);
    };
    getUser();
  }, [navigate]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching reviews",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Transform database reviews to match ReviewCard interface
      const transformedReviews: Review[] = (data || []).map((dbReview: any) => ({
        id: dbReview.id,
        customer_name: dbReview.customer_name,
        rating: dbReview.rating,
        content: dbReview.content,
        sentiment: dbReview.sentiment,
        platform: dbReview.platform,
        review_date: dbReview.review_date,
        ai_response: dbReview.ai_response,
        response_status: dbReview.response_status || 'pending'
      }));
      setReviews(transformedReviews);
    }
  };

  useEffect(() => {
    let filtered = reviews;
    
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
  }, [reviews, searchTerm, sentimentFilter, platformFilter]);

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
    const responseRate = total > 0 ? (reviews.filter(r => r.ai_response).length / total) * 100 : 0;
    
    return { total, positive, negative, neutral, avgRating, responseRate };
  };

  const stats = getStats();

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
          businessType: 'עסק כללי'
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
          title: "תגובת AI נוצרה בהצלחה",
          description: "התגובה ממתינה לאישור",
        });
        await fetchReviews();
      }

    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לייצר תגובת AI. נסה שוב.",
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
          title: "שגיאה",
          description: "לא הצלחנו לאשר את התגובה",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "תגובה אושרה",
        description: "התגובה אושרה בהצלחה",
      });
      
      await fetchReviews();
    } catch (error) {
      console.error('Error approving response:', error);
    }
  };

  const handleSendResponse = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ response_status: 'sent' })
        .eq('id', reviewId);

      if (error) {
        console.error('Error sending response:', error);
        toast({
          title: "שגיאה",
          description: "לא הצלחנו לשלוח את התגובה",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "תגובה נשלחה",
        description: "התגובה נשלחה ללקוח בהצלחה",
      });
      
      await fetchReviews();
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">RevAI Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Connect Platform
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                +0.2 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {stats.positive} Positive
                </Badge>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {stats.negative} Negative
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Connections */}
        <PlatformConnection />

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Reviews Dashboard
            </CardTitle>
            <CardDescription>
              Monitor and respond to your online reviews across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="trustpilot">Trustpilot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No reviews found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or connect a new platform to start receiving reviews.
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
                isGenerating={generatingResponses.has(review.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;