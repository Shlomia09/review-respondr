import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface ManualResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: any;
  onSuccess: () => void;
}

export const ManualResponseModal = ({ isOpen, onClose, review, onSuccess }: ManualResponseModalProps) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const isRTL = language === 'he' || language === 'ar';
  const align = isRTL ? 'text-right' : 'text-left';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response.trim()) {
      toast({
        title: t('manualResponse.toasts.errorTitle'),
        description: t('manualResponse.toasts.errorMissingResponse'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          manual_response: response.trim(),
          response_status: 'approved'
        })
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: t('manualResponse.toasts.savedTitle'),
        description: t('manualResponse.toasts.savedDesc'),
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving manual response:', error);
      toast({
        title: t('manualResponse.toasts.errorTitle'),
        description: t('manualResponse.toasts.errorSaveDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className={`${align} text-lg font-semibold`}>{t('manualResponse.title')}</DialogTitle>
          <DialogDescription className={`${align} text-sm text-muted-foreground leading-relaxed`}>
            {t('manualResponse.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Review Content */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <div className="mb-3">
            <strong className="text-sm font-medium">{review.customer_name} - {review.rating}⭐</strong>
          </div>
          <p className={`text-sm text-gray-700 dark:text-gray-300 ${align} leading-relaxed break-words`}>
            "{review.content}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual_response" className={`${align} block text-sm font-medium`}>
              {t('manualResponse.fields.response')}
            </Label>
            <Textarea
              id="manual_response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={t('manualResponse.placeholders.response')}
              className={`${align} min-h-[120px] resize-none`}
              required
            />
            <p className={`text-xs text-muted-foreground ${align} mt-2`}>
              {t('manualResponse.helpText')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('manualResponse.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? t('manualResponse.buttons.saving') : t('manualResponse.buttons.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};