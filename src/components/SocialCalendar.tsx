import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  Share,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { he } from "date-fns/locale";

interface SocialPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export function SocialCalendar() {
  const { t, language } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [filterPlatform, setFilterPlatform] = useState('all');

  // No real backend yet for scheduled social posts — empty state
  const socialPosts: SocialPost[] = [];

  const locale = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US';
  const dayNames = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, i).toLocaleDateString(locale, { weekday: 'short' })
  );

  const filteredPosts = socialPosts.filter(post => 
    filterPlatform === 'all' || post.platforms.includes(filterPlatform)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'instagram': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'linkedin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'tiktok': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'whatsapp': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => 
      format(post.scheduledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {monthDays.map(day => {
          const postsForDay = getPostsForDate(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div key={day.toString()} className={`
              min-h-24 p-2 border border-muted cursor-pointer hover:bg-muted/50 transition-colors
              ${isToday ? 'bg-primary/10 border-primary' : ''}
            `}>
              <div className="text-sm font-medium mb-1">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {postsForDay.slice(0, 2).map(post => (
                  <div 
                    key={post.id} 
                    className="text-xs p-1 rounded bg-primary/20 text-primary truncate"
                  >
                    {post.title}
                  </div>
                ))}
                {postsForDay.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{postsForDay.length - 2} עוד
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      {filteredPosts.map(post => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <Badge className={getStatusColor(post.status)}>
                    {t(`socialHub.${post.status}`)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(post.scheduledDate, 'dd/MM/yyyy HH:mm', { locale: he })}
                </div>

                <div className="flex items-center gap-2">
                  {post.platforms.map(platform => (
                    <Badge 
                      key={platform} 
                      variant="outline" 
                      className={`text-xs ${getPlatformColor(platform)}`}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>

                {post.engagement && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>👍 {post.engagement.likes}</span>
                    <span>💬 {post.engagement.comments}</span>
                    <span>🔄 {post.engagement.shares}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-1 ml-4">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('socialHub.monthView')}</SelectItem>
              <SelectItem value="week">{t('socialHub.weekView')}</SelectItem>
              <SelectItem value="list">{t('socialHub.listView')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('socialHub.filterByPlatform')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('socialHub.allPlatforms')}</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('socialHub.schedulePost')}
        </Button>
      </div>

      {/* Calendar/List Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {viewMode === 'list' ? t('socialHub.scheduledPosts') : format(selectedDate, 'MMMM yyyy', { locale: he })}
            </div>
            
            {viewMode !== 'list' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                >
                  ←
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  {t('socialHub.today')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                >
                  →
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'month' ? renderCalendarView() : renderListView()}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{socialPosts.length}</div>
            <p className="text-sm text-muted-foreground">{t('socialHub.totalPosts')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {socialPosts.filter(p => p.status === 'scheduled').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('socialHub.scheduled')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {socialPosts.filter(p => p.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('socialHub.drafts')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {socialPosts.reduce((acc, post) => acc + (post.engagement?.likes || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">{t('socialHub.totalLikes')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}