import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Star, 
  Filter, 
  Search, 
  Send, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  MessageSquare
} from "lucide-react";
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

interface ReviewsTableProps {
  reviews: Review[];
  onBulkAction: (action: string, selectedIds: string[]) => void;
  onViewReview: (review: Review) => void;
  onEditResponse: (review: Review) => void;
  onDeleteReview: (reviewId: string) => void;
}

export function ReviewsTable({ 
  reviews, 
  onBulkAction, 
  onViewReview, 
  onEditResponse, 
  onDeleteReview 
}: ReviewsTableProps) {
  const { t } = useTranslation();
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessFilter, setBusinessFilter] = useState("all");

  // Get unique business names for filter
  const uniqueBusinesses = Array.from(
    new Set(reviews.map(r => r.business_name).filter(Boolean))
  ).sort();

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === "all" || review.sentiment === sentimentFilter;
    const matchesPlatform = platformFilter === "all" || review.platform.toLowerCase() === platformFilter;
    const matchesStatus = statusFilter === "all" || review.response_status === statusFilter;
    const matchesBusiness = businessFilter === "all" || review.business_name === businessFilter;
    
    return matchesSearch && matchesSentiment && matchesPlatform && matchesStatus && matchesBusiness;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(new Set(filteredReviews.map(r => r.id)));
    } else {
      setSelectedReviews(new Set());
    }
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    const newSelected = new Set(selectedReviews);
    if (checked) {
      newSelected.add(reviewId);
    } else {
      newSelected.delete(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const getSentimentBadge = (sentiment: string) => {
    const colors = {
      positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", 
      neutral: "bg-muted text-muted-foreground"
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", icon: Clock },
      generated: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", icon: MessageSquare },
      approved: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", icon: CheckCircle },
      sent: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", icon: Send }
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {t(`reviewCard.${status}`)}
      </Badge>
    );
  };

  const renderStars = (rating: number) => (
    <div className="flex">
      {[1,2,3,4,5].map(star => (
        <Star 
          key={star} 
          className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
        />
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('reviews.allReviews')} ({filteredReviews.length})
          </div>
          
          {selectedReviews.size > 0 && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onBulkAction('approve', Array.from(selectedReviews))}
              >
                {t('reviews.bulkApprove')} ({selectedReviews.size})
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onBulkAction('send', Array.from(selectedReviews))}
              >
                {t('reviews.bulkSend')} ({selectedReviews.size})
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('reviews.searchReviews')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('reviews.filterBySentiment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('reviews.allSentiments')}</SelectItem>
              <SelectItem value="positive">{t('dashboard.positive')}</SelectItem>
              <SelectItem value="neutral">{t('dashboard.neutral')}</SelectItem>
              <SelectItem value="negative">{t('dashboard.negative')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('reviews.filterByPlatform')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('reviews.allPlatforms')}</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="trustpilot">Trustpilot</SelectItem>
            </SelectContent>
          </Select>

          <Select value={businessFilter} onValueChange={setBusinessFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('reviews.filterByBusiness')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('reviews.allBusinesses')}</SelectItem>
              {uniqueBusinesses.map((business) => (
                <SelectItem key={business} value={business || ''}>
                  {business}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('reviews.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('reviews.allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('reviewCard.pending')}</SelectItem>
              <SelectItem value="generated">{t('reviewCard.generated')}</SelectItem>
              <SelectItem value="approved">{t('reviewCard.approved')}</SelectItem>
              <SelectItem value="sent">{t('reviewCard.sent')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('reviews.moreFilters')}
          </Button>
        </div>

        {/* Reviews Table */}
        <div className="w-full overflow-x-auto">
          <div className="rounded-md border min-w-[800px]">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedReviews.size === filteredReviews.length && filteredReviews.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('reviews.customer')}</TableHead>
                <TableHead>{t('reviews.review')}</TableHead>
                <TableHead>{t('reviews.rating')}</TableHead>
                <TableHead>{t('reviews.sentiment')}</TableHead>
                <TableHead>{t('reviews.platform')}</TableHead>
                <TableHead>{t('reviews.date')}</TableHead>
                <TableHead>{t('reviews.status')}</TableHead>
                <TableHead className="text-right">{t('reviews.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedReviews.has(review.id)}
                      onCheckedChange={(checked) => handleSelectReview(review.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{review.customer_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{review.content}</TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell>
                    <Badge className={getSentimentBadge(review.sentiment)}>
                      {t(`dashboard.${review.sentiment}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>{review.platform}</TableCell>
                  <TableCell>{new Date(review.review_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(review.response_status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewReview(review)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEditResponse(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
        
        {filteredReviews.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('reviews.noReviewsFound')}</p>
            <p className="text-sm">{t('reviews.tryDifferentFilters')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}