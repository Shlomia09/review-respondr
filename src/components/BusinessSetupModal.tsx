import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface BusinessSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip?: () => void;
}

export const BusinessSetupModal = ({ isOpen, onClose, onComplete, onSkip }: BusinessSetupModalProps) => {
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
  const { t, language } = useTranslation();
  const isRTL = language === 'he' || language === 'ar';
  const align = isRTL ? 'text-right' : 'text-left';

  const businessTypes = [
    { value: "restaurant", label: t('businessSetup.types.restaurant') },
    { value: "cafe", label: t('businessSetup.types.cafe') },
    { value: "retail_store", label: t('businessSetup.types.retail_store') },
    { value: "beauty_salon", label: t('businessSetup.types.beauty_salon') },
    { value: "medical_clinic", label: t('businessSetup.types.medical_clinic') },
    { value: "fitness_gym", label: t('businessSetup.types.fitness_gym') },
    { value: "hotel", label: t('businessSetup.types.hotel') },
    { value: "automotive", label: t('businessSetup.types.automotive') },
    { value: "technology", label: t('businessSetup.types.technology') },
    { value: "consulting", label: t('businessSetup.types.consulting') },
    { value: "education", label: t('businessSetup.types.education') },
    { value: "real_estate", label: t('businessSetup.types.real_estate') },
    { value: "entertainment", label: t('businessSetup.types.entertainment') },
    { value: "other", label: t('businessSetup.types.other') }
  ];

  const toneOptions = [
    { value: "professional", label: t('businessSetup.tone.professional') },
    { value: "friendly", label: t('businessSetup.tone.friendly') },
    { value: "casual", label: t('businessSetup.tone.casual') },
    { value: "luxury", label: t('businessSetup.tone.luxury') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_name || !formData.business_type) {
      toast({
        title: t('businessSetup.toasts.errorTitle'),
        description: t('businessSetup.toasts.errorMissingFields'),
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
        title: t('businessSetup.toasts.savedTitle'),
        description: t('businessSetup.toasts.savedDesc'),
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast({
        title: t('businessSetup.toasts.errorTitle'),
        description: t('businessSetup.toasts.errorSaveDesc'),
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
          <DialogTitle className={`text-lg font-semibold ${align}`}>{t('businessSetup.title')}</DialogTitle>
          <DialogDescription className={`text-sm text-muted-foreground leading-relaxed ${align}`}>
            {t('businessSetup.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name" className={`${align} block text-sm font-medium`}>
                {t('businessSetup.fields.businessName')} *
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder={t('businessSetup.placeholders.businessName')}
                className={align}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type" className={`${align} block text-sm font-medium`}>
                {t('businessSetup.fields.businessType')} *
              </Label>
              <Select 
                value={formData.business_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
              >
                <SelectTrigger className={align}>
                  <SelectValue placeholder={t('businessSetup.placeholders.businessType')} />
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
            <Label htmlFor="business_description" className={`${align} block text-sm font-medium`}>
              {t('businessSetup.fields.description')}
            </Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
              placeholder={t('businessSetup.placeholders.description')}
              className={`${align} resize-none`}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience" className={`${align} block text-sm font-medium`}>
              {t('businessSetup.fields.targetAudience')}
            </Label>
            <Input
              id="target_audience"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              placeholder={t('businessSetup.placeholders.targetAudience')}
              className={align}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_tone" className={`${align} block text-sm font-medium`}>
              {t('businessSetup.fields.tone')}
            </Label>
            <Select 
              value={formData.business_tone} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_tone: value }))}
            >
              <SelectTrigger className={align}>
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
            <Label htmlFor="special_instructions" className={`${align} block text-sm font-medium`}>
              {t('businessSetup.fields.specialInstructions')}
            </Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              placeholder={t('businessSetup.placeholders.specialInstructions')}
              className={`${align} resize-none`}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (onSkip) onSkip();
                else {
                  localStorage.setItem('skipBusinessSetup', 'true');
                  onClose();
                }
              }}
              disabled={loading}
            >
              {t('businessSetup.buttons.dontShowAgain')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('businessSetup.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? t('businessSetup.buttons.saving') : t('businessSetup.buttons.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};