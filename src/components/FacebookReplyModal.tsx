import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, CheckCircle, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  customer_name?: string;
  content?: string;
  ai_response?: string;
  manual_response?: string;
  review_url?: string;
  business_id?: string;
  platform?: string;
}

interface FacebookReplyModalProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FacebookReplyModal({ review, open, onOpenChange }: FacebookReplyModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [responseText, setResponseText] = useState("");

  // Sync response text when review changes
  const currentResponse = review?.manual_response || review?.ai_response || "";

  const handleOpen = () => {
    setResponseText(currentResponse);
    setCopied(false);
  };

  const facebookUrl = review?.review_url ||
    (review?.business_id
      ? `https://www.facebook.com/${review.business_id}/reviews`
      : "https://www.facebook.com");

  const handleCopyAndOpen = async () => {
    const textToCopy = responseText || currentResponse;

    // 1. Copy to clipboard
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
    } catch {
      // Fallback for browsers that block clipboard
      const el = document.createElement("textarea");
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
    }

    // 2. Show toast
    toast({
      title: "✅ Response copied!",
      description: "Now paste it in Facebook and click Publish.",
      duration: 8000,
    });

    // 3. Open Facebook
    window.open(facebookUrl, "_blank", "noopener,noreferrer");

    // 4. Close modal after short delay
    setTimeout(() => onOpenChange(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        onOpenAutoFocus={(e) => { e.preventDefault(); handleOpen(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded p-1">
              <Facebook className="h-4 w-4" />
            </div>
            Reply on Facebook
          </DialogTitle>
          <DialogDescription>
            Facebook doesn't allow automatic replies via API. Follow the 3 steps below to publish your response.
          </DialogDescription>
        </DialogHeader>

        {/* Step-by-step guide */}
        <div className="flex gap-2 text-sm">
          {[
            { step: "1", label: "Edit response below" },
            { step: "2", label: "Click Copy & Open" },
            { step: "3", label: "Paste in Facebook → Publish" },
          ].map(({ step, label }) => (
            <div key={step} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 text-center">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                {step}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Review snippet */}
        {review?.content && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium text-xs text-muted-foreground mb-1">Review by {review.customer_name || "Customer"}:</p>
            <p className="text-foreground line-clamp-2">{review.content}</p>
          </div>
        )}

        {/* Response editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your Response</label>
            <Badge variant="outline" className="text-xs">AI Generated</Badge>
          </div>
          <Textarea
            value={responseText || currentResponse}
            onChange={(e) => setResponseText(e.target.value)}
            rows={5}
            className="resize-none text-sm"
            placeholder="Your AI-generated response will appear here..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={handleCopyAndOpen}
            disabled={!(responseText || currentResponse)}
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Copied! Opening Facebook...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy &amp; Open Facebook
                <ExternalLink className="h-3 w-3 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
