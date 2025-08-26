import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Clock, 
  Target, 
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Timer
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AIStatsData {
  totalResponses: number;
  autoResponseRate: number;
  averageResponseTime: number;
  responseAccuracy: number;
  weeklyGrowth: number;
  sentimentImprovement: number;
}

interface AIResponseStatsProps {
  stats: AIStatsData;
}

export function AIResponseStats({ stats }: AIResponseStatsProps) {
  const { t } = useTranslation();

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('aiResponses.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')} ${t('aiResponses.hours')}`;
  };

  const statCards = [
    {
      title: t('aiResponses.totalAIResponses'),
      value: stats.totalResponses.toLocaleString(),
      change: `+${stats.weeklyGrowth}% ${t('dashboard.fromLastWeek')}`,
      icon: Bot,
      color: 'blue'
    },
    {
      title: t('aiResponses.autoResponseRate'),
      value: `${stats.autoResponseRate}%`,
      change: t('aiResponses.ofAllReviews'),
      icon: Target,
      color: 'green'
    },
    {
      title: t('aiResponses.averageResponseTime'),
      value: formatResponseTime(stats.averageResponseTime),
      change: `85% ${t('aiResponses.fasterThanManual')}`,
      icon: Timer,
      color: 'orange'
    },
    {
      title: t('aiResponses.responseAccuracy'),
      value: `${stats.responseAccuracy}%`,
      change: t('aiResponses.customerSatisfaction'),
      icon: CheckCircle,
      color: 'purple'
    }
  ];

  const getCardClasses = (color: string) => {
    const colorMap = {
      blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800",
      green: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800",
      orange: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800",
      purple: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getTextClasses = (color: string) => {
    const colorMap = {
      blue: "text-blue-700 dark:text-blue-300",
      green: "text-green-700 dark:text-green-300",
      orange: "text-orange-700 dark:text-orange-300",
      purple: "text-purple-700 dark:text-purple-300"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconClasses = (color: string) => {
    const colorMap = {
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      orange: "text-orange-600 dark:text-orange-400",
      purple: "text-purple-600 dark:text-purple-400"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={getCardClasses(stat.color)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${getIconClasses(stat.color)}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTextClasses(stat.color)}`}>
                {stat.value}
              </div>
              <p className={`text-xs ${getIconClasses(stat.color)} mt-1`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('aiResponses.responseTimeBreakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('aiResponses.immediate')} (&lt;1 {t('aiResponses.minute')})</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>{t('aiResponses.fast')} (1-5 {t('aiResponses.minutes')})</span>
                <span>35%</span>
              </div>
              <Progress value={35} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>{t('aiResponses.moderate')} (5-15 {t('aiResponses.minutes')})</span>
                <span>15%</span>
              </div>
              <Progress value={15} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>{t('aiResponses.slow')} (&gt;15 {t('aiResponses.minutes')})</span>
                <span>5%</span>
              </div>
              <Progress value={5} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('aiResponses.sentimentImpact')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                +{stats.sentimentImprovement}%
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('aiResponses.sentimentImprovementDesc')}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-lg font-semibold text-green-700 dark:text-green-300">78%</div>
                <p className="text-xs text-green-600 dark:text-green-400">{t('dashboard.positive')}</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">18%</div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">{t('dashboard.neutral')}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-lg font-semibold text-red-700 dark:text-red-300">4%</div>
                <p className="text-xs text-red-600 dark:text-red-400">{t('dashboard.negative')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}