import { CheckCircle2, FileEdit, Home, UserPlus } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

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
    <section
      id="how-it-works"
      className="py-24 bg-linear-to-br from-gray-50 to-indigo-50"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in three simple steps
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card className="overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Create Your Account
                    </h3>
                  </div>
                  <p className="text-gray-600 text-lg mb-4">
                    Sign up with your university email to get started. It&apos;s
                    quick, free, and secure.
                  </p>
                  <div className="text-sm text-indigo-600 font-medium">
                    → Sign in button is in the header above
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <FileEdit className="h-6 w-6 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Complete Your Profile
                    </h3>
                  </div>
                  <p className="text-gray-600 text-lg mb-6">
                    Tell us about your lifestyle, preferences, and what
                    you&apos;re looking for in a roommate. This helps us find
                    your perfect match.
                  </p>
                  {isLoggedIn && !isOnboarded ? (
                    <Button
                      size="lg"
                      onClick={handleSetupProfile}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Set Up My Profile
                    </Button>
                  ) : !isLoggedIn ? (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleSetupProfile}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      Sign In to Continue
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Profile Complete!</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="overflow-hidden border-2 border-gray-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-pink-600 to-pink-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-6 w-6 text-pink-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Start Browsing & Matching
                    </h3>
                  </div>
                  <p className="text-gray-600 text-lg mb-6">
                    Browse available listings, see your compatibility scores,
                    and connect with potential roommates. Your perfect match is
                    waiting!
                  </p>
                  {isLoggedIn && isOnboarded ? (
                    <Button
                      size="lg"
                      onClick={handleGoToDashboard}
                      className="bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Complete steps 1 & 2 to unlock dashboard access
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
