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

interface ManualResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onSuccess: () => void;
}

export const ManualResponseModal = ({ isOpen, onClose, review, onSuccess }: ManualResponseModalProps) => {
  const [manualResponse, setManualResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualResponse.trim() || !review) {
      toast({
        title: "שגיאה",
        description: "אנא כתוב תגובה",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          manual_response: manualResponse,
          response_status: 'approved' // Manual responses are automatically approved
        })
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: "תגובה נשמרה",
        description: "התגובה הידנית נשמרה בהצלחה",
      });

      setManualResponse("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving manual response:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשמור את התגובה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setManualResponse("");
    onClose();
  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-right">תגובה ידנית</DialogTitle>
          <DialogDescription className="text-right">
            כתוב תגובה אישית לביקורת של {review.customer_name}
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
            <Label htmlFor="manual_response" className="text-right block">
              התגובה שלך
            </Label>
            <Textarea
              id="manual_response"
              value={manualResponse}
              onChange={(e) => setManualResponse(e.target.value)}
              placeholder="כתוב כאן את התגובה האישית שלך לביקורת..."
              className="text-right min-h-[120px]"
              rows={6}
              required
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {manualResponse.length} תווים
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "שומר..." : "שמירת תגובה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};