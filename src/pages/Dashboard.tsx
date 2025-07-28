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

// Mock data for reviews - will be replaced with real data later
const mockReviews = [
  {
    id: "1",
    reviewer_name: "Sarah Johnson",
    rating: 5,
    review_text: "Excellent service! The team was professional and delivered exactly what we needed. Highly recommend!",
    sentiment: "positive" as const,
    platform: "Google",
    review_date: "2024-01-15T10:30:00Z",
    ai_response: {
      generated_response: "Thank you so much for your wonderful review, Sarah! We're thrilled that our team exceeded your expectations. Your recommendation means the world to us!",
      is_approved: false,
      is_sent: false
    }
  },
  {
    id: "2",
    reviewer_name: "Mike Chen",
    rating: 2,
    review_text: "Service was slower than expected and the quality didn't match the price point. Expected much better.",
    sentiment: "negative" as const,
    platform: "Facebook",
    review_date: "2024-01-14T14:20:00Z",
    ai_response: {
      generated_response: "Hi Mike, thank you for taking the time to share your feedback. We sincerely apologize that our service didn't meet your expectations. We'd love the opportunity to make this right - please reach out to us directly so we can discuss how we can improve your experience.",
      is_approved: true,
      is_sent: false
    }
  },
  {
    id: "3",
    reviewer_name: "Emily Rodriguez",
    rating: 4,
    review_text: "Good overall experience. Staff was friendly and the process was smooth. One minor issue with timing but otherwise satisfied.",
    sentiment: "positive" as const,
    platform: "Trustpilot",
    review_date: "2024-01-13T16:45:00Z"
  },
  {
    id: "4",
    reviewer_name: "David Wilson",
    rating: 3,
    review_text: "Average service. Nothing special but got the job done. Could be improved in several areas.",
    sentiment: "neutral" as const,
    platform: "Google",
    review_date: "2024-01-12T09:15:00Z",
    ai_response: {
      generated_response: "Thank you for your honest feedback, David. We appreciate you taking the time to review us. We're always looking for ways to improve - would you mind sharing what specific areas you think we could enhance?",
      is_approved: true,
      is_sent: true
    }
  }
];

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState(mockReviews);
  const [filteredReviews, setFilteredReviews] = useState(mockReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    let filtered = reviews;
    
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.review_text.toLowerCase().includes(searchTerm.toLowerCase())
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
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const responseRate = (reviews.filter(r => r.ai_response).length / total) * 100;
    
    return { total, positive, negative, neutral, avgRating, responseRate };
  };

  const stats = getStats();

  const handleGenerateResponse = (reviewId: string) => {
    toast({
      title: "Generating AI Response",
      description: "Creating a personalized response for this review...",
    });
    // TODO: Implement AI response generation
  };

  const handleApproveResponse = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId && review.ai_response
        ? { ...review, ai_response: { ...review.ai_response, is_approved: true } }
        : review
    ));
    toast({
      title: "Response Approved",
      description: "The AI response has been approved and is ready to send.",
    });
  };

  const handleSendResponse = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId && review.ai_response
        ? { ...review, ai_response: { ...review.ai_response, is_sent: true } }
        : review
    ));
    toast({
      title: "Response Sent",
      description: "Your response has been sent to the review platform.",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ReviewAI Manager</h1>
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;