import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  Save
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AITemplate {
  id: string;
  name: string;
  category: 'positive' | 'negative' | 'neutral' | 'request_details';
  tone: 'professional' | 'warm' | 'friendly' | 'short';
  template: string;
  usageCount: number;
  rating: number;
  isDefault: boolean;
}

const defaultTemplates: AITemplate[] = [
  {
    id: '1',
    name: 'תגובה חיובית מקצועית',
    category: 'positive',
    tone: 'professional',
    template: 'שלום {customerName},\n\nתודה רבה על הביקורת החיובית שלך! אנחנו שמחים לשמוע שהיית מרוצה מהשירות שלנו.\n\nנשמח לראות אותך שוב בקרוב!\n\nבברכה,\nצוות {businessName}',
    usageCount: 45,
    rating: 4.8,
    isDefault: true
  },
  {
    id: '2',
    name: 'תגובה שלילית - פתרון בעיות',
    category: 'negative',
    tone: 'warm',
    template: 'שלום {customerName},\n\nתודה לך על המשוב החשוב. אנחנו מצטערים לשמוע שהחוויה שלך לא הייתה מושלמת.\n\nנשמח לפגוש אותך כדי לפתור את הנושא ולשפר את השירות שלנו. אנא צור איתנו קשר ב-{contactInfo}.\n\nבכבוד רב,\nצוות {businessName}',
    usageCount: 32,
    rating: 4.6,
    isDefault: true
  },
  {
    id: '3',
    name: 'בקשה לפרטים נוספים',
    category: 'request_details',
    tone: 'friendly',
    template: 'שלום {customerName},\n\nתודה על הביקורת שלך!\n\nנשמח לשמוע עוד פרטים על החוויה שלך כדי שנוכל להמשיך ולשפר את השירות שלנו.\n\nניתן ליצור איתנו קשר ב-{contactInfo}.\n\nתודה רבה!\nצוות {businessName}',
    usageCount: 18,
    rating: 4.4,
    isDefault: true
  }
];

export function AITemplateLibrary() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<AITemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTone, setFilterTone] = useState<string>('all');

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesTone = filterTone === 'all' || template.tone === filterTone;
    return matchesCategory && matchesTone;
  });

  const handleEditTemplate = (template: AITemplate) => {
    setSelectedTemplate(template);
    setEditingTemplate(template.template);
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, template: editingTemplate }
          : t
      ));
      setIsEditing(false);
      setSelectedTemplate(null);
    }
  };

  const handleCopyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-600" />;
      case 'request_details': return <MessageCircle className="h-4 w-4 text-blue-600" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'request_details': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'warm': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'friendly': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'short': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('aiResponses.templateLibrary')}</h3>
          <p className="text-sm text-muted-foreground">{t('aiResponses.templateLibraryDesc')}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('aiResponses.createTemplate')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('aiResponses.filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('aiResponses.allCategories')}</SelectItem>
            <SelectItem value="positive">{t('aiResponses.positive')}</SelectItem>
            <SelectItem value="negative">{t('aiResponses.negative')}</SelectItem>
            <SelectItem value="neutral">{t('aiResponses.neutral')}</SelectItem>
            <SelectItem value="request_details">{t('aiResponses.requestDetails')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTone} onValueChange={setFilterTone}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('aiResponses.filterByTone')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('aiResponses.allTones')}</SelectItem>
            <SelectItem value="professional">{t('aiResponses.professional')}</SelectItem>
            <SelectItem value="warm">{t('aiResponses.warm')}</SelectItem>
            <SelectItem value="friendly">{t('aiResponses.friendly')}</SelectItem>
            <SelectItem value="short">{t('aiResponses.short')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                {template.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    {t('aiResponses.default')}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getCategoryColor(template.category)}>
                  {getCategoryIcon(template.category)}
                  <span className="ml-1">{t(`aiResponses.${template.category}`)}</span>
                </Badge>
                <Badge className={getToneColor(template.tone)}>
                  {t(`aiResponses.${template.tone}`)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {template.rating}
                </div>
                <span>{template.usageCount} {t('aiResponses.uses')}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-sm bg-muted p-3 rounded-lg max-h-24 overflow-y-auto">
                {template.template}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopyTemplate(template.template)}
                  className="flex-1"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {t('aiResponses.copy')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditTemplate(template)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {!template.isDefault && (
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Template Modal */}
      {isEditing && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>{t('aiResponses.editTemplate')}: {selectedTemplate.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editingTemplate}
                onChange={(e) => setEditingTemplate(e.target.value)}
                rows={10}
                placeholder={t('aiResponses.templatePlaceholder')}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t('aiResponses.cancel')}
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('aiResponses.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}