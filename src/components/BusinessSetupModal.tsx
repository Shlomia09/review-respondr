import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BusinessSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const BusinessSetupModal = ({ isOpen, onClose, onComplete }: BusinessSetupModalProps) => {
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_description: "",
    target_audience: "",
    business_tone: "professional",
    special_instructions: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const businessTypes = [
    { value: "restaurant", label: "מסעדה" },
    { value: "cafe", label: "בית קפה" },
    { value: "retail_store", label: "חנות" },
    { value: "beauty_salon", label: "מספרה/סלון יופי" },
    { value: "medical_clinic", label: "מרפאה/קליניקה" },
    { value: "fitness_gym", label: "חדר כושר" },
    { value: "hotel", label: "מלון/צימר" },
    { value: "automotive", label: "שירותי רכב" },
    { value: "technology", label: "שירותי טכנולוגיה" },
    { value: "consulting", label: "ייעוץ ושירותים" },
    { value: "education", label: "חינוך והכשרה" },
    { value: "real_estate", label: "נדל\"ן" },
    { value: "entertainment", label: "בידור ואירועים" },
    { value: "other", label: "אחר" }
  ];

  const toneOptions = [
    { value: "professional", label: "מקצועי ורציני" },
    { value: "friendly", label: "ידידותי וחם" },
    { value: "casual", label: "קליל ונגיש" },
    { value: "luxury", label: "יוקרתי ומשובח" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_name || !formData.business_type) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "פרופיל העסק נשמר",
        description: "המערכת תספק תגובות מותאמות לעסק שלך",
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשמור את פרטי העסק",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-right text-lg font-semibold">הגדרת פרופיל העסק</DialogTitle>
          <DialogDescription className="text-right text-sm text-muted-foreground leading-relaxed">
            כדי שנוכל לספק תגובות מותאמות ומדויקות, אנא ספר לנו על העסק שלך
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name" className="text-right block text-sm font-medium">
                שם העסק *
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="למשל: מסעדת הלב הירוק"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type" className="text-right block text-sm font-medium">
                סוג העסק *
              </Label>
              <Select 
                value={formData.business_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר סוג עסק" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_description" className="text-right block text-sm font-medium">
              תיאור העסק
            </Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
              placeholder="תאר בקצרה מה העסק מציע, מה המיוחד בו..."
              className="text-right resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience" className="text-right block text-sm font-medium">
              קהל היעד
            </Label>
            <Input
              id="target_audience"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              placeholder="משפחות עם ילדים, צעירים, אנשי עסקים..."
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_tone" className="text-right block text-sm font-medium">
              טון התגובות
            </Label>
            <Select 
              value={formData.business_tone} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_tone: value }))}
            >
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions" className="text-right block text-sm font-medium">
              הוראות מיוחדות למערכת
            </Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              placeholder="הוראות נוספות למערכת AI על איך להגיב..."
              className="text-right resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              למשל: תמיד להזכיר את המבצעים, להזמין לאירועים מיוחדים
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? "שומר..." : "שמירה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};