import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, 
  RefreshCw, 
  Copy, 
  Save, 
  Send, 
  Image as ImageIcon,
  Hash,
  Calendar,
  Target,
  Sparkles
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface GeneratedContent {
  text: string;
  hashtags: string[];
  suggestedImage: string;
  tone: string;
  platform: string;
}

interface ContentIdea {
  title: string;
  description: string;
  category: 'promotional' | 'educational' | 'behind-scenes' | 'user-generated';
  platforms: string[];
  estimatedReach: number;
}

export function SocialContentGenerator() {
  const { t } = useTranslation();
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [contentType, setContentType] = useState('promotional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  // Mock content ideas
  const contentIdeas: ContentIdea[] = [
    {
      title: 'לקוחות מספרים על החוויה',
      description: 'פוסט המציג ביקורות חיוביות מלקוחות מרוצים',
      category: 'user-generated',
      platforms: ['Facebook', 'Instagram', 'LinkedIn'],
      estimatedReach: 2500
    },
    {
      title: 'מאחורי הקלעים - תהליך השירות',
      description: 'הציגו איך אתם עובדים כדי לספק שירות מעולה',
      category: 'behind-scenes',
      platforms: ['Instagram', 'TikTok'],
      estimatedReach: 1800
    },
    {
      title: 'טיפים לבחירת השירות המתאים',
      description: 'תוכן חינוכי שעוזר ללקוחות לקבל החלטות',
      category: 'educational',
      platforms: ['LinkedIn', 'Facebook', 'Blog'],
      estimatedReach: 3200
    },
    {
      title: 'הנחה מיוחדת לחודש זה',
      description: 'פרסם על מבצעים ומחירים מיוחדים',
      category: 'promotional',
      platforms: ['Facebook', 'Instagram', 'WhatsApp'],
      estimatedReach: 4500
    }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI content generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockContent: GeneratedContent = {
      text: `🌟 לקוחות יקרים! 

אנחנו גאים לחלוק איתכם את הביקורות המדהימות שקיבלנו השבוע:

"שירות מקצועי ומהיר! ממליצה בחום 🔥" - שרה כהן
"צוות נפלא ותוצאות מעולות ✨" - דוד לוי  
"החוויה הכי טובה שהייתה לי 💫" - מיכל רוזן

תודה רבה לכם על האמון! 🙏
המשיכו לשתף אותנו בחוויות שלכם.

#שירותמעולה #לקוחותמרוצים #איכות`,
      hashtags: ['#שירותמעולה', '#לקוחותמרוצים', '#איכות', '#ביקורותחיוביות', '#המלצות'],
      suggestedImage: 'תמונת קולאז של ביקורות חיוביות עם כוכבים וצבעים חמים',
      tone: selectedTone,
      platform: selectedPlatform
    };
    
    setGeneratedContent(mockContent);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.text);
    }
  };

  const getPlatformIcon = (platform: string) => {
    // Return appropriate platform colors/icons
    switch (platform.toLowerCase()) {
      case 'facebook': return 'bg-blue-100 text-blue-800';
      case 'instagram': return 'bg-pink-100 text-pink-800';
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'tiktok': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'promotional': return <Target className="h-4 w-4" />;
      case 'educational': return <Hash className="h-4 w-4" />;
      case 'behind-scenes': return <ImageIcon className="h-4 w-4" />;
      case 'user-generated': return <Sparkles className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
          <TabsTrigger value="generator">{t('socialHub.contentGenerator')}</TabsTrigger>
          <TabsTrigger value="ideas">{t('socialHub.contentIdeas')}</TabsTrigger>
          <TabsTrigger value="templates">{t('socialHub.templates')}</TabsTrigger>
        </TabsList>

        {/* Content Generator */}
        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  {t('socialHub.generateContent')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('socialHub.contentType')}</label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">{t('socialHub.promotional')}</SelectItem>
                      <SelectItem value="educational">{t('socialHub.educational')}</SelectItem>
                      <SelectItem value="behind-scenes">{t('socialHub.behindScenes')}</SelectItem>
                      <SelectItem value="user-generated">{t('socialHub.userGenerated')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('socialHub.tone')}</label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">{t('aiResponses.professional')}</SelectItem>
                      <SelectItem value="friendly">{t('aiResponses.friendly')}</SelectItem>
                      <SelectItem value="warm">{t('aiResponses.warm')}</SelectItem>
                      <SelectItem value="casual">{t('socialHub.casual')}</SelectItem>
                      <SelectItem value="exciting">{t('socialHub.exciting')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('socialHub.targetPlatform')}</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('socialHub.allPlatforms')}</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('socialHub.customPrompt')}</label>
                  <Textarea
                    placeholder={t('socialHub.customPromptPlaceholder')}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full" 
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('socialHub.generating')}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      {t('socialHub.generate')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('socialHub.generatedContent')}</span>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {generatedContent.text}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">{t('socialHub.suggestedHashtags')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.hashtags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">{t('socialHub.imagesuggestion')}</h4>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                        <ImageIcon className="h-4 w-4 inline mr-2" />
                        {generatedContent.suggestedImage}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('socialHub.generateContentPrompt')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Ideas */}
        <TabsContent value="ideas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentIdeas.map((idea, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getCategoryIcon(idea.category)}
                      {idea.title}
                    </CardTitle>
                    <Badge className={getPlatformIcon(idea.platforms[0])}>
                      {idea.estimatedReach.toLocaleString()} הגעה
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{idea.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {idea.platforms.map((platform, pIndex) => (
                      <Badge 
                        key={pIndex} 
                        variant="outline" 
                        className={`text-xs ${getPlatformIcon(platform)}`}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setContentType(idea.category);
                      setCustomPrompt(idea.description);
                    }}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {t('socialHub.useThisIdea')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('socialHub.templatesComingSoon')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}