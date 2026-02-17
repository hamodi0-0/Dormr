import { Building2, CheckCircle2 } from "lucide-react";

export default function ForListers() {
  return (
    <section id="for-listers" className="py-20 bg-background grain">
      <div className="max-w-4xl mx-auto px-6">
        <div className="border border-border rounded-2xl p-8 md:p-12 bg-card">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-medium text-foreground">
                  Have a Room to Rent?
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  List your property and find verified, compatible student
                  tenants.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-primary/5 rounded-full text-xs flex-shrink-0 self-start md:self-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-primary font-medium">Coming soon</span>
            </div>
          </div>

          {/* Features row */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              "Post your listing for free",
              "Reach verified university students",
              "Smart compatibility matching",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
