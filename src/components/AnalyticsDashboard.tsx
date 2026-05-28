import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Target,
  Clock,
  MessageSquare,
  Star,
  Building2,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface MonthBucket {
  label: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

interface PlatformStat {
  platform: string;
  total: number;
  avgRating: number;
  responseRate: number;
}

interface BrandStat {
  name: string;
  total: number;
  avgRating: number;
  positive: number;
  negative: number;
}

interface AnalyticsState {
  totalReviews: number;
  responseRate: number;
  avgRating: number;
  pendingCount: number;
  sentimentTrend: MonthBucket[];
  platforms: PlatformStat[];
  brands: BrandStat[];
  topPositive: string[];
  topNegative: string[];
}

export function AnalyticsDashboard() {
  const { t, language } = useTranslation();
  const [data, setData] = useState<AnalyticsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("6m");
  const [selectedBrand, setSelectedBrand] = useState("all");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Date cutoff
      const months = dateRange === "1m" ? 1 : dateRange === "3m" ? 3 : dateRange === "6m" ? 6 : 12;
      const since = new Date();
      since.setMonth(since.getMonth() - months);

      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("id, rating, sentiment, review_date, response_status, ai_response, manual_response, platform, business_name, content")
        .eq("user_id", user.id)
        .gte("review_date", since.toISOString())
        .order("review_date", { ascending: true });

      if (error) throw error;
      const all = reviews || [];

      // KPIs
      const totalReviews = all.length;
      const withResponse = all.filter(r => r.ai_response || r.manual_response).length;
      const responseRate = totalReviews > 0 ? Math.round((withResponse / totalReviews) * 100) : 0;
      const avgRating = totalReviews > 0
        ? Math.round((all.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews) * 10) / 10
        : 0;
      const pendingCount = all.filter(r => r.response_status === "pending").length;

      // Sentiment trend by month
      const monthMap = new Map<string, MonthBucket>();
      for (const r of all) {
        const d = new Date(r.review_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString(language === "he" ? "he-IL" : language === "de" ? "de-DE" : "en-US", { month: "short", year: "2-digit" });
        if (!monthMap.has(key)) monthMap.set(key, { label, positive: 0, negative: 0, neutral: 0, total: 0 });
        const b = monthMap.get(key)!;
        b.total++;
        if (r.sentiment === "positive") b.positive++;
        else if (r.sentiment === "negative") b.negative++;
        else b.neutral++;
      }
      const sentimentTrend = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => v);

      // Platform stats
      const platMap = new Map<string, { total: number; ratingSum: number; responded: number }>();
      for (const r of all) {
        const p = r.platform || "other";
        if (!platMap.has(p)) platMap.set(p, { total: 0, ratingSum: 0, responded: 0 });
        const b = platMap.get(p)!;
        b.total++;
        b.ratingSum += r.rating || 0;
        if (r.ai_response || r.manual_response) b.responded++;
      }
      const platforms: PlatformStat[] = Array.from(platMap.entries()).map(([platform, v]) => ({
        platform,
        total: v.total,
        avgRating: Math.round((v.ratingSum / v.total) * 10) / 10,
        responseRate: Math.round((v.responded / v.total) * 100),
      })).sort((a, b) => b.total - a.total);

      // Brand stats
      const brandMap = new Map<string, { total: number; ratingSum: number; pos: number; neg: number }>();
      for (const r of all) {
        const name = r.business_name || "—";
        if (!brandMap.has(name)) brandMap.set(name, { total: 0, ratingSum: 0, pos: 0, neg: 0 });
        const b = brandMap.get(name)!;
        b.total++;
        b.ratingSum += r.rating || 0;
        if (r.sentiment === "positive") b.pos++;
        else if (r.sentiment === "negative") b.neg++;
      }
      const brands: BrandStat[] = Array.from(brandMap.entries()).map(([name, v]) => ({
        name,
        total: v.total,
        avgRating: Math.round((v.ratingSum / v.total) * 10) / 10,
        positive: v.pos,
        negative: v.neg,
      })).sort((a, b) => b.total - a.total);

      // Simple keyword extraction from positive/negative reviews
      const stopWords = new Set(["the","and","was","for","are","with","this","that","have","had","been","they","from","our","your","very","will","but","not","you","all","we","my","it","is","in","of","to","a","an","i","so","its"]);
      const countWords = (texts: string[]) => {
        const freq = new Map<string, number>();
        for (const text of texts) {
          for (const word of text.toLowerCase().replace(/[^a-zA-Z\u0590-\u05FF ]/g, " ").split(/\s+/)) {
            if (word.length > 3 && !stopWords.has(word)) {
              freq.set(word, (freq.get(word) || 0) + 1);
            }
          }
        }
        return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
      };
      const topPositive = countWords(all.filter(r => r.sentiment === "positive").map(r => r.content || ""));
      const topNegative = countWords(all.filter(r => r.sentiment === "negative").map(r => r.content || ""));

      setData({ totalReviews, responseRate, avgRating, pendingCount, sentimentTrend, platforms, brands, topPositive, topNegative });
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  const allBrands = data?.brands.map(b => b.name) || [];
  const filteredData = selectedBrand === "all" ? data : data ? {
    ...data,
    brands: data.brands.filter(b => b.name === selectedBrand),
    platforms: data.platforms, // platforms don't change by brand filter here
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const dateOptions = [
    { value: "1m", label: "1 " + (t("analytics.month") || "Month") },
    { value: "3m", label: "3 " + (t("analytics.months") || "Months") },
    { value: "6m", label: "6 " + (t("analytics.months") || "Months") },
    { value: "12m", label: "12 " + (t("analytics.months") || "Months") },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allBrands.length > 1 && (
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("reviews.allBusinesses") || "All Accounts"}</SelectItem>
                {allBrands.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button variant="outline" onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("analytics.refresh") || "Refresh"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("analytics.totalReviews")}</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t("analytics.inPeriod") || "in selected period"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("analytics.responseRate")}</CardTitle>
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{data.responseRate}%</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{data.pendingCount} {t("analytics.awaitingResponse") || "awaiting response"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("analytics.avgRating")}</CardTitle>
            <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">⭐ {data.avgRating}</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{t("analytics.acrossAll") || "across all platforms"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("analytics.pendingReviews") || "Pending"}</CardTitle>
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{data.pendingCount}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{t("analytics.needsResponse") || "need a response"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("analytics.sentimentTrendOverTime")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.sentimentTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("analytics.noData") || "No data for this period"}</p>
            ) : (
              <div className="space-y-3">
                {data.sentimentTrend.map((m, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.label}</span>
                      <span className="text-muted-foreground">{m.total} {t("dashboard.reviews")}</span>
                    </div>
                    <div className="flex h-5 rounded-full overflow-hidden bg-muted">
                      {m.total > 0 && (
                        <>
                          <div className="bg-green-500 transition-all" style={{ width: `${(m.positive / m.total) * 100}%` }} title={`${m.positive} positive`} />
                          <div className="bg-yellow-400 transition-all" style={{ width: `${(m.neutral / m.total) * 100}%` }} title={`${m.neutral} neutral`} />
                          <div className="bg-red-500 transition-all" style={{ width: `${(m.negative / m.total) * 100}%` }} title={`${m.negative} negative`} />
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-green-600">+{m.positive}</span>
                      <span className="text-yellow-600">{m.neutral}</span>
                      <span className="text-red-600">-{m.negative}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("analytics.platformComparison")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.platforms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("analytics.noData") || "No data"}</p>
            ) : (
              <div className="space-y-3">
                {data.platforms.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium capitalize">{p.platform}</div>
                      <div className="text-sm text-muted-foreground">{p.total} {t("dashboard.reviews")}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">⭐ {p.avgRating}</div>
                      <Badge variant="outline" className={p.responseRate >= 80 ? "border-green-500 text-green-600" : p.responseRate >= 50 ? "border-yellow-500 text-yellow-600" : "border-red-500 text-red-600"}>
                        {p.responseRate}% {t("analytics.responded") || "responded"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-Brand Breakdown */}
      {data.brands.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("analytics.perBrand") || "Per Account / Brand"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.brands.map((b, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{b.name}</span>
                    <Badge variant="outline">⭐ {b.avgRating}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{b.total} {t("dashboard.reviews")}</div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                    {b.total > 0 && (
                      <>
                        <div className="bg-green-500" style={{ width: `${(b.positive / b.total) * 100}%` }} />
                        <div className="bg-red-500" style={{ width: `${(b.negative / b.total) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-green-600">+{b.positive} {t("dashboard.positive")}</span>
                    <span className="text-red-600">-{b.negative} {t("dashboard.negative")}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Cloud */}
      {(data.topPositive.length > 0 || data.topNegative.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.topPositive.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  {t("analytics.topPositiveKeywords") || "Top Positive Keywords"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.topPositive.map((w, i) => (
                    <Badge key={i} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-sm px-3 py-1">{w}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {data.topNegative.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  {t("analytics.topNegativeKeywords") || "Top Negative Keywords"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.topNegative.map((w, i) => (
                    <Badge key={i} className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-sm px-3 py-1">{w}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}