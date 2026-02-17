import { CheckCircle2, FileEdit, Home, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HowItWorks({
  isLoggedIn,
  isOnboarded,
  handleSetupProfile,
  handleGoToDashboard,
}: {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  handleSetupProfile: () => void;
  handleGoToDashboard: () => void;
}) {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-medium text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Get started in three simple steps
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card className="overflow-hidden border-2 transition-transform duration-200 hover:scale-[1.01]">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-serif font-bold shadow-sm">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-serif font-medium text-foreground">
                      Create Your Account
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Sign up with your university email to get started. It&apos;s
                    quick, free, and secure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="overflow-hidden border-2 transition-transform duration-200 hover:scale-[1.01]">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-serif font-bold shadow-sm">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <FileEdit className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-serif font-medium text-foreground">
                      Complete Your Profile
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    Tell us about your lifestyle, preferences, and what
                    you&apos;re looking for in a roommate. This helps us find
                    your perfect match.
                  </p>
                  {isLoggedIn && !isOnboarded ? (
                    <Button size="lg" onClick={handleSetupProfile}>
                      Set Up My Profile
                    </Button>
                  ) : !isLoggedIn ? (
                    <Button
                      size="lg"
                      variant="default"
                      onClick={handleSetupProfile}
                    >
                      Sign In to Continue
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Profile Complete!</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="overflow-hidden border-2 transition-transform duration-200 hover:scale-[1.01]">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-serif font-bold shadow-sm">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-serif font-medium text-foreground">
                      Start Browsing &amp; Matching
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    Browse available listings, see your compatibility scores,
                    and connect with potential roommates. Your perfect match is
                    waiting!
                  </p>
                  {isLoggedIn && isOnboarded ? (
                    <Button size="lg" onClick={handleGoToDashboard}>
                      Go to Dashboard
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Complete steps 1 &amp; 2 to unlock dashboard access
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
