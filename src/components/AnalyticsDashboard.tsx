import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar as CalendarIcon,
  Download,
  Target,
  Clock,
  Users,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface AnalyticsData {
  sentimentTrend: Array<{ month: string; positive: number; negative: number; neutral: number }>;
  platformComparison: Array<{ platform: string; reviews: number; avgRating: number; responseRate: number }>;
  responseTimeStats: { avg: number; median: number; improvement: number };
  keywordAnalysis: Array<{ keyword: string; mentions: number; sentiment: 'positive' | 'negative' | 'neutral' }>;
  weeklyMetrics: {
    totalReviews: number;
    responseRate: number;
    avgRating: number;
    sentimentImprovement: number;
  };
}

export function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState('sentiment');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    sentimentTrend: [
      { month: 'ינואר', positive: 65, negative: 15, neutral: 20 },
      { month: 'פברואר', positive: 70, negative: 12, neutral: 18 },
      { month: 'מרץ', positive: 75, negative: 10, neutral: 15 },
      { month: 'אפריל', positive: 78, negative: 8, neutral: 14 },
      { month: 'מאי', positive: 82, negative: 6, neutral: 12 },
      { month: 'יוני', positive: 85, negative: 5, neutral: 10 }
    ],
    platformComparison: [
      { platform: 'Google', reviews: 1247, avgRating: 4.6, responseRate: 94 },
      { platform: 'Facebook', reviews: 832, avgRating: 4.3, responseRate: 87 },
      { platform: 'Trustpilot', reviews: 456, avgRating: 4.8, responseRate: 98 }
    ],
    responseTimeStats: { avg: 3.2, median: 2.1, improvement: 45 },
    keywordAnalysis: [
      { keyword: 'שירות מעולה', mentions: 234, sentiment: 'positive' },
      { keyword: 'מהיר', mentions: 189, sentiment: 'positive' },
      { keyword: 'איכותי', mentions: 156, sentiment: 'positive' },
      { keyword: 'איטי', mentions: 67, sentiment: 'negative' },
      { keyword: 'יקר', mentions: 43, sentiment: 'negative' }
    ],
    weeklyMetrics: {
      totalReviews: 2535,
      responseRate: 93,
      avgRating: 4.6,
      sentimentImprovement: 23
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'negative': return 'text-red-600 bg-red-50 dark:bg-red-950';
      case 'neutral': return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const renderSentimentChart = () => (
    <div className="space-y-4">
      {analyticsData.sentimentTrend.map((data, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{data.month}</span>
            <span className="text-muted-foreground">{data.positive + data.negative + data.neutral} ביקורות</span>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
            <div 
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${data.positive}%` }}
              title={`${data.positive}% חיובי`}
            />
            <div 
              className="bg-yellow-500 transition-all duration-300"
              style={{ width: `${data.neutral}%` }}
              title={`${data.neutral}% נייטרלי`}
            />
            <div 
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${data.negative}%` }}
              title={`${data.negative}% שלילי`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{data.positive}% חיובי</span>
            <span>{data.neutral}% נייטרלי</span>
            <span>{data.negative}% שלילי</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sentiment">{t('analytics.sentimentTrend')}</SelectItem>
              <SelectItem value="platforms">{t('analytics.platformComparison')}</SelectItem>
              <SelectItem value="keywords">{t('analytics.keywordAnalysis')}</SelectItem>
              <SelectItem value="response-time">{t('analytics.responseTime')}</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  <span>{t('analytics.selectDateRange')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t('analytics.exportData')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-2">{t('analytics.totalReviews')}</CardTitle>
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {analyticsData.weeklyMetrics.totalReviews.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% {t('dashboard.fromLastWeek')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-2">{t('analytics.responseRate')}</CardTitle>
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {analyticsData.weeklyMetrics.responseRate}%
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% {t('dashboard.fromLastWeek')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-2">{t('analytics.avgRating')}</CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {analyticsData.weeklyMetrics.avgRating}
            </div>
            <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.3 {t('dashboard.fromLastWeek')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-2">{t('analytics.avgResponseTime')}</CardTitle>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {analyticsData.responseTimeStats.avg}h
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
              <TrendingDown className="h-3 w-3 mr-1" />
              -{analyticsData.responseTimeStats.improvement}% {t('dashboard.fromLastWeek')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('analytics.sentimentTrendOverTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderSentimentChart()}
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('analytics.platformComparison')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.platformComparison.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <div className="font-medium">{platform.platform}</div>
                    <div className="text-sm text-muted-foreground">
                      {platform.reviews.toLocaleString()} ביקורות
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">⭐ {platform.avgRating}</div>
                    <div className="text-sm text-muted-foreground">{platform.responseRate}% מענה</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('analytics.topKeywords')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.keywordAnalysis.map((keyword, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getSentimentColor(keyword.sentiment)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{keyword.keyword}</div>
                  <div className="text-sm font-semibold">{keyword.mentions}</div>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {keyword.mentions} איזכורים
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}