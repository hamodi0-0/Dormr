import { Home, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-serif font-medium text-foreground mb-4">
            Why Dormr?
          </h2>
          <p className="text-xl text-muted-foreground">
            Finding the right roommate shouldn&apos;t be a guessing game. We use
            smart matching to connect you with compatible students.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="border-2 transition-transform duration-200 hover:scale-[1.02]">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-medium text-foreground mb-3">
                Smart Matching
              </h3>
              <p className="text-muted-foreground">
                Our algorithm matches you based on lifestyle, study habits,
                sleep schedules, and interests for true compatibility.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-2 transition-transform duration-200 hover:scale-[1.02]">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-medium text-foreground mb-3">
                Verified &amp; Safe
              </h3>
              <p className="text-muted-foreground">
                All users are verified university students. Your safety and
                privacy are our top priorities.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-2 transition-transform duration-200 hover:scale-[1.02]">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Home className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-medium text-foreground mb-3">
                Browse Listings
              </h3>
              <p className="text-muted-foreground">
                See available rooms, locations, and compatibility scores all in
                one place. Find your perfect housing match.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
