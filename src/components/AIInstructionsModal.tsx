import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  platform: string;
}

interface AIInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onSuccess: (reviewId: string) => void;
}

export const AIInstructionsModal = ({ isOpen, onClose, review, onSuccess }: AIInstructionsModalProps) => {
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!instructions.trim() || !review) {
      toast({
        title: "שגיאה",
        description: "אנא כתוב הוראות למערכת",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Save instructions to the review
      const { error } = await supabase
        .from('reviews')
        .update({ 
          ai_instructions: instructions
        })
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: "הוראות נשמרו",
        description: "המערכת תכלול את ההוראות בתגובת ה-AI",
      });

      setInstructions("");
      onSuccess(review.id);
      onClose();
    } catch (error) {
      console.error('Error saving AI instructions:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשמור את ההוראות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInstructions("");
    onClose();
  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-right text-lg font-semibold">הוראות למערכת AI</DialogTitle>
          <DialogDescription className="text-right text-sm text-muted-foreground leading-relaxed">
            הוסף הוראות מיוחדות למערכת לתגובה על ביקורת של {review.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">
                {review.platform} • {review.rating}/5
              </div>
              <h4 className="font-medium truncate mr-2">{review.customer_name}</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 text-right leading-relaxed break-words">
              "{review.content}"
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ai_instructions" className="text-right block text-sm font-medium">
                הוראות למערכת AI
              </Label>
              <Textarea
                id="ai_instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="למשל: הזכר את המבצע החדש, התנצל על התקלה שהוזכרה..."
                className="text-right min-h-[120px] resize-none"
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground text-right mt-2 leading-relaxed">
                ההוראות האלו יתווספו לפרומפט של מערכת ה-AI לביקורת הספציפית הזו
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 text-right">
                דוגמאות להוראות:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 text-right">
                <li className="flex items-start gap-2 flex-row-reverse">
                  <span>•</span>
                  <span>"הזכר את המבצע על המנה החדשה"</span>
                </li>
                <li className="flex items-start gap-2 flex-row-reverse">
                  <span>•</span>
                  <span>"התנצל על זמן ההמתנה והציע פיצוי"</span>
                </li>
                <li className="flex items-start gap-2 flex-row-reverse">
                  <span>•</span>
                  <span>"הזמן את הלקוח לבקר שוב במהלך השבוע"</span>
                </li>
                <li className="flex items-start gap-2 flex-row-reverse">
                  <span>•</span>
                  <span>"הודה על הפידבק וציין שנתקן את הבעיה"</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                ביטול
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? "שומר..." : "שמירת הוראות"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};