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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-right">הוראות למערכת AI</DialogTitle>
          <DialogDescription className="text-right">
            הוסף הוראות מיוחדות למערכת לתגובה על ביקורת של {review.customer_name}
          </DialogDescription>
        </DialogHeader>

        {/* Review Display */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">
              {review.platform} • {review.rating}/5
            </div>
            <h4 className="font-medium">{review.customer_name}</h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-right">
            "{review.content}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ai_instructions" className="text-right block">
              הוראות למערכת AI
            </Label>
            <Textarea
              id="ai_instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="למשל: הזכר את המבצע החדש, התנצל על התקלה שהוזכרה, הזמן לפגישה אישית..."
              className="text-right min-h-[120px]"
              rows={6}
              required
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              ההוראות האלו יתווספו לפרומפט של מערכת ה-AI לביקורת הספציפית הזו
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-right">
              דוגמאות להוראות:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-right list-none">
              <li>• "הזכר את המבצע על המנה החדשה"</li>
              <li>• "התנצל על זמן ההמתנה והציע פיצוי"</li>
              <li>• "הזמן את הלקוח לבקר שוב במהלך השבוע"</li>
              <li>• "הודה על הפידבק וציין שנתקן את הבעיה"</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "שומר..." : "שמירת הוראות וייצור תגובה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};