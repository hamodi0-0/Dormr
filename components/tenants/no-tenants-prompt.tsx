import { Info, Sparkles, MessageCircle } from "lucide-react";

interface NoTenantsPromptProps {
  variant: "student" | "lister";
}

export function NoTenantsPrompt({ variant }: NoTenantsPromptProps) {
  if (variant === "student") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Compatibility data isn&apos;t available yet for this listing — no
          tenants have been added.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Add tenants to unlock compatibility scores
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Listings with tenants get more engagement from students.
            Compatibility scores show prospective tenants how well they&apos;d
            fit in — increasing the quality of your enquiries.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-md bg-background/60 border border-border/50 px-3 py-2.5">
        <MessageCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Reach out to your current tenants via WhatsApp or chat and ask them to
          request to be listed on Dormr. Once they submit a request, you&apos;ll
          see it here to approve.
        </p>
      </div>
    </div>
  );
}
