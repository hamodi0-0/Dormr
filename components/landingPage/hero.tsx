import { CheckCircle2, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Find Your Perfect Match
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-medium text-foreground leading-tight">
              Find compatible <span className="text-primary">roommates</span>{" "}
              for university
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Match with students who share your lifestyle, study habits, and
              interests. Make university housing stress-free.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Verified students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Secure &amp; private</span>
              </div>
            </div>
          </div>

          {/* Right: Mock Card */}
          <div className="relative">
            <div className="relative bg-card rounded-2xl shadow-xl border border-border p-8">
              <div className="space-y-4">
                {/* Avatar row */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary/40" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded-md" />
                    <div className="h-3 w-24 bg-muted/60 rounded-md" />
                  </div>
                </div>

                {/* Content lines */}
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full bg-muted/50 rounded-md" />
                  <div className="h-3 w-5/6 bg-muted/50 rounded-md" />
                  <div className="h-3 w-4/6 bg-muted/50 rounded-md" />
                </div>

                {/* Tags */}
                <div className="flex gap-2 pt-2 flex-wrap">
                  <div className="h-7 w-20 bg-primary/15 border border-primary/20 rounded-full" />
                  <div className="h-7 w-24 bg-primary/10 border border-primary/15 rounded-full" />
                  <div className="h-7 w-16 bg-primary/20 border border-primary/25 rounded-full" />
                </div>

                {/* Match score + action */}
                <div className="pt-4 flex items-center justify-between border-t border-border">
                  <div className="h-9 w-28 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      98% Match
                    </span>
                  </div>
                  <div className="h-10 w-28 bg-primary rounded-lg opacity-90" />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-lg border border-border px-6 py-3">
              <div className="text-2xl font-serif font-medium text-foreground">
                1000+
              </div>
              <div className="text-sm text-muted-foreground">
                Active Students
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
