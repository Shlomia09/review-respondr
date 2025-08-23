import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface AIInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: any;
  onSuccess: (reviewId: string) => void;
}

export const AIInstructionsModal = ({ isOpen, onClose, review, onSuccess }: AIInstructionsModalProps) => {
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const isRTL = language === 'he' || language === 'ar';
  const align = isRTL ? 'text-right' : 'text-left';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!instructions.trim()) {
      toast({
        title: t('aiInstructions.toasts.errorTitle'),
        description: t('aiInstructions.toasts.errorMissingInstructions'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          ai_instructions: instructions.trim()
        })
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: t('aiInstructions.toasts.savedTitle'),
        description: t('aiInstructions.toasts.savedDesc'),
      });
      
      onSuccess(review.id);
      onClose();
    } catch (error) {
      console.error('Error saving AI instructions:', error);
      toast({
        title: t('aiInstructions.toasts.errorTitle'),
        description: t('aiInstructions.toasts.errorSaveDesc'),
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
          <DialogTitle className={`${align} text-lg font-semibold`}>{t('aiInstructions.title')}</DialogTitle>
          <DialogDescription className={`${align} text-sm text-muted-foreground leading-relaxed`}>
            {t('aiInstructions.description')}
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
            <Label htmlFor="ai_instructions" className={`${align} block text-sm font-medium`}>
              {t('aiInstructions.fields.instructions')}
            </Label>
            <Textarea
              id="ai_instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t('aiInstructions.placeholders.instructions')}
              className={`${align} min-h-[120px] resize-none`}
              required
            />
            <p className={`text-xs text-muted-foreground ${align} mt-2 leading-relaxed`}>
              {t('aiInstructions.helpText')}
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className={`font-medium text-blue-900 dark:text-blue-100 mb-3 ${align}`}>
                {t('aiInstructions.examples.title')}
              </h4>
              <ul className={`text-sm text-blue-800 dark:text-blue-200 space-y-2 ${align}`}>
                {t('aiInstructions.examples.list').split(',').map((example: string, index: number) => (
                  <li key={index}>• {example.trim()}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('aiInstructions.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? t('aiInstructions.buttons.saving') : t('aiInstructions.buttons.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};