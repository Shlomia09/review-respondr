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
      variant: "primary"
    },
    {
      title: t('dashboard.averageRating'),
      value: stats.avgRating.toFixed(1),
      change: "+0.2 " + t('dashboard.fromLastWeek'),
      icon: Star,
      variant: "secondary",
      showStars: true
    },
    {
      title: t('dashboard.responseRate'),
      value: stats.responseRate.toFixed(0) + "%",
      change: "+12% " + t('dashboard.fromLastWeek'),
      icon: Target,
      variant: "accent"
    },
    {
      title: t('dashboard.totalCustomers'),
      value: stats.total,
      change: "+5 " + t('dashboard.fromLastWeek'),
      icon: Users,
      variant: "muted"
    }
  ];

  const getVariantClasses = (variant: string) => {
    const variantMap = {
      primary: "bg-primary/10 border-primary/20 hover:bg-primary/15",
      secondary: "bg-secondary border-border hover:bg-secondary/80",
      accent: "bg-accent border-accent-foreground/10 hover:bg-accent/80", 
      muted: "bg-muted border-border hover:bg-muted/80"
    };
    return variantMap[variant as keyof typeof variantMap] || variantMap.primary;
  };

  const getTextClasses = (variant: string) => {
    const variantMap = {
      primary: "text-primary",
      secondary: "text-foreground",
      accent: "text-accent-foreground",
      muted: "text-muted-foreground"
    };
    return variantMap[variant as keyof typeof variantMap] || variantMap.primary;
  };

  const getIconClasses = (variant: string) => {
    const variantMap = {
      primary: "text-primary",
      secondary: "text-muted-foreground",
      accent: "text-accent-foreground",
      muted: "text-muted-foreground"
    };
    return variantMap[variant as keyof typeof variantMap] || variantMap.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiCards.map((card, index) => (
        <Card key={index} className={getVariantClasses(card.variant)}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-2">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${getIconClasses(card.variant)} flex-shrink-0`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl sm:text-3xl font-bold ${getTextClasses(card.variant)} flex flex-col sm:flex-row sm:items-center`}>
              <span>{card.value}</span>
              {card.showStars && (
                <div className="flex mt-1 sm:mt-0 sm:ml-2">
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${star <= Math.round(stats.avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
              )}
            </div>
            <p className={`text-xs ${getIconClasses(card.variant)} flex flex-col sm:flex-row sm:items-center mt-1 space-y-1 sm:space-y-0`}>
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {card.change}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Sentiment Distribution Card */}
      <Card className="md:col-span-2 lg:col-span-4 bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('dashboard.sentimentDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-card border border-border">
              <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
              <p className="text-sm text-muted-foreground">{t('dashboard.positive')} {t('dashboard.reviews')}</p>
              <Badge variant="secondary" className="mt-2">
                {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
              </Badge>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-card border border-border">
              <div className="text-2xl font-bold text-primary">{stats.neutral}</div>
              <p className="text-sm text-muted-foreground">{t('dashboard.neutral')} {t('dashboard.reviews')}</p>
              <Badge variant="secondary" className="mt-2">
                {stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0}%
              </Badge>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-card border border-border">
              <div className="text-2xl font-bold text-destructive">{stats.negative}</div>
              <p className="text-sm text-muted-foreground">{t('dashboard.negative')} {t('dashboard.reviews')}</p>
              <Badge variant="secondary" className="mt-2">
                {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}