import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, Star, TrendingUp, Search, MessageSquare, ExternalLink, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CRMCustomer {
  key: string;          // unique key: author_id or author_name
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
  platforms: string[];
  totalReviews: number;
  averageRating: number;
  lastReviewDate: string;
  sentiment: "positive" | "neutral" | "negative";
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CRMCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("author_name, author_id, reviewer_avatar_url, reviewer_profile_url, platform, rating, sentiment, review_date")
        .eq("user_id", user.id)
        .order("review_date", { ascending: false });

      if (error) throw error;

      // Aggregate by customer (author_id if available, else author_name)
      const map = new Map<string, CRMCustomer>();

      for (const r of reviews || []) {
        const name = r.author_name || "Anonymous";
        const key = r.author_id || name;

        if (!map.has(key)) {
          map.set(key, {
            key,
            name,
            avatarUrl: r.reviewer_avatar_url || undefined,
            profileUrl: r.reviewer_profile_url || undefined,
            platforms: [],
            totalReviews: 0,
            averageRating: 0,
            lastReviewDate: r.review_date,
            sentiment: "neutral",
            positiveCount: 0,
            negativeCount: 0,
            neutralCount: 0,
          });
        }

        const c = map.get(key)!;
        c.totalReviews++;
        c.averageRating = (c.averageRating * (c.totalReviews - 1) + (r.rating || 3)) / c.totalReviews;

        if (!c.platforms.includes(r.platform)) c.platforms.push(r.platform);
        if (!c.avatarUrl && r.reviewer_avatar_url) c.avatarUrl = r.reviewer_avatar_url;
        if (!c.profileUrl && r.reviewer_profile_url) c.profileUrl = r.reviewer_profile_url;

        if (r.sentiment === "positive") c.positiveCount++;
        else if (r.sentiment === "negative") c.negativeCount++;
        else c.neutralCount++;
      }

      // Derive overall sentiment
      const result = Array.from(map.values()).map(c => ({
        ...c,
        averageRating: Math.round(c.averageRating * 10) / 10,
        sentiment: (c.positiveCount >= c.negativeCount && c.positiveCount >= c.neutralCount)
          ? "positive"
          : (c.negativeCount >= c.positiveCount && c.negativeCount >= c.neutralCount)
            ? "negative"
            : "neutral" as "positive" | "neutral" | "negative",
      }));

      // Sort by last review date (most recent first)
      result.sort((a, b) => new Date(b.lastReviewDate).getTime() - new Date(a.lastReviewDate).getTime());
      setCustomers(result);
    } catch (e) {
      console.error("Error fetching customers:", e);
    } finally {
      setLoading(false);
    }
  }

  const allPlatforms = [...new Set(customers.flatMap(c => c.platforms))];

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSentiment = filterSentiment === "all" || c.sentiment === filterSentiment;
    const matchPlatform = filterPlatform === "all" || c.platforms.includes(filterPlatform);
    return matchSearch && matchSentiment && matchPlatform;
  });

  const stats = {
    total: customers.length,
    withAvatar: customers.filter(c => !!c.avatarUrl).length,
    avgRating: customers.length ? customers.reduce((s, c) => s + c.averageRating, 0) / customers.length : 0,
    totalReviews: customers.reduce((s, c) => s + c.totalReviews, 0),
  };

  const platformColor: Record<string, string> = {
    facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    google: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    trustpilot: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  };

  const sentimentColor: Record<string, string> = {
    positive: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    negative: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("sidebar.customers")}</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.customers")}</h1>
        <span className="text-sm text-muted-foreground ml-2">{t("customers.crmSubtitle") || "CRM — aggregated from reviews"}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("customers.totalCustomers")}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-primary opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("customers.totalReviews") || "Total Reviews"}</p>
              <p className="text-2xl font-bold">{stats.totalReviews}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500 opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("customers.avgRating")}</p>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)} ⭐</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500 opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("customers.withProfile") || "With Profile Pic"}</p>
              <p className="text-2xl font-bold">{stats.withAvatar}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500 opacity-60" />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>{t("customers.customerList")}</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t("customers.searchCustomers")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-56"
                />
              </div>
              <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.allSentiments")}</SelectItem>
                  <SelectItem value="positive">{t("dashboard.positive")}</SelectItem>
                  <SelectItem value="neutral">{t("dashboard.neutral")}</SelectItem>
                  <SelectItem value="negative">{t("dashboard.negative")}</SelectItem>
                </SelectContent>
              </Select>
              {allPlatforms.length > 1 && (
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("dashboard.allPlatforms")}</SelectItem>
                    {allPlatforms.map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="rounded-md border min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("customers.name")}</TableHead>
                    <TableHead>{t("reviews.platform")}</TableHead>
                    <TableHead>{t("customers.reviews")}</TableHead>
                    <TableHead>{t("customers.rating")}</TableHead>
                    <TableHead>{t("dashboard.sentiment")}</TableHead>
                    <TableHead>{t("customers.lastReview")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t("customers.noCustomersFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => (
                      <TableRow key={c.key} className="hover:bg-muted/50">
                        {/* Avatar + Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              {c.avatarUrl ? (
                                <img
                                  src={c.avatarUrl}
                                  alt={c.name}
                                  className="h-9 w-9 rounded-full object-cover border border-border"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    (e.target as HTMLImageElement).nextSibling && ((e.target as HTMLImageElement).nextSibling as HTMLElement).classList.remove("hidden");
                                  }}
                                />
                              ) : null}
                              <div className={`h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary ${c.avatarUrl ? "hidden" : ""}`}>
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{c.name}</p>
                              {c.platforms.includes("facebook") && c.key !== c.name && (
                                <p className="text-xs text-muted-foreground">ID: {c.key.substring(0, 8)}…</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Platforms */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {c.platforms.map(p => (
                              <Badge key={p} className={`text-xs capitalize ${platformColor[p] || "bg-muted text-muted-foreground"}`}>
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        {/* Review count */}
                        <TableCell>
                          <span className="font-semibold">{c.totalReviews}</span>
                        </TableCell>

                        {/* Rating */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{c.averageRating.toFixed(1)}</span>
                          </div>
                        </TableCell>

                        {/* Sentiment */}
                        <TableCell>
                          <Badge className={`text-xs ${sentimentColor[c.sentiment]}`}>
                            {c.positiveCount > 0 && `+${c.positiveCount} `}
                            {c.negativeCount > 0 && `−${c.negativeCount} `}
                            {t(`dashboard.${c.sentiment}`)}
                          </Badge>
                        </TableCell>

                        {/* Last Review */}
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(c.lastReviewDate).toLocaleDateString()}
                          </div>
                        </TableCell>

                        {/* Profile link */}
                        <TableCell>
                          {c.profileUrl && (
                            <a
                              href={c.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="View profile"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}