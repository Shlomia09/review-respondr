import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  BarChart3,
  Clock,
  CheckCircle,
  Target,
  Users
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface KPIStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  avgRating: number;
  responseRate: number;
  newReviews: number;
  waitingReviews: number;
  processedReviews: number;
}

interface KPIDashboardProps {
  stats: KPIStats;
}

export function KPIDashboard({ stats }: KPIDashboardProps) {
  const { t } = useTranslation();

  const kpiCards = [
    {
      title: t('dashboard.newReviewsThisWeek'),
      value: stats.newReviews,
      change: "+2 " + t('dashboard.fromLastWeek'),
      icon: MessageSquare,
      color: "blue",
      trend: "up"
    },
    {
      title: t('dashboard.averageRating'),
      value: stats.avgRating.toFixed(1),
      change: "+0.2 " + t('dashboard.fromLastWeek'),
      icon: Star,
      color: "yellow",
      trend: "up",
      showStars: true
    },
    {
      title: t('dashboard.responseRate'),
      value: stats.responseRate.toFixed(0) + "%",
      change: "+12% " + t('dashboard.fromLastWeek'),
      icon: Target,
      color: "green",
      trend: "up"
    },
    {
      title: t('dashboard.totalCustomers'),
      value: stats.total,
      change: "+5 " + t('dashboard.fromLastWeek'),
      icon: Users,
      color: "purple",
      trend: "up"
    }
  ];

  const getCardClasses = (color: string) => {
    const colorMap = {
      blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800",
      yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800",
      green: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800",
      purple: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getTextClasses = (color: string) => {
    const colorMap = {
      blue: "text-blue-700 dark:text-blue-300",
      yellow: "text-yellow-700 dark:text-yellow-300", 
      green: "text-green-700 dark:text-green-300",
      purple: "text-purple-700 dark:text-purple-300"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconClasses = (color: string) => {
    const colorMap = {
      blue: "text-blue-600 dark:text-blue-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      green: "text-green-600 dark:text-green-400", 
      purple: "text-purple-600 dark:text-purple-400"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiCards.map((card, index) => (
        <Card key={index} className={getCardClasses(card.color)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${getIconClasses(card.color)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getTextClasses(card.color)} flex items-center`}>
              {card.value}
              {card.showStars && (
                <div className="flex ml-2">
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= Math.round(stats.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              )}
            </div>
            <p className={`text-xs ${getIconClasses(card.color)} flex items-center mt-1`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {card.change}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Sentiment Distribution Card */}
      <Card className="md:col-span-2 lg:col-span-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('dashboard.sentimentDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.positive}</div>
              <p className="text-sm text-green-600 dark:text-green-400">{t('dashboard.positive')} {t('dashboard.reviews')}</p>
              <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
              </Badge>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.neutral}</div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('dashboard.neutral')} {t('dashboard.reviews')}</p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0}%
              </Badge>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.negative}</div>
              <p className="text-sm text-red-600 dark:text-red-400">{t('dashboard.negative')} {t('dashboard.reviews')}</p>
              <Badge className="mt-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}