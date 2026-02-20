"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Sparkles,
  Home,
  Users,
  BookOpen,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useStudentProfile,
  type StudentProfile,
} from "@/hooks/use-student-profile";

interface DashboardHomeClientProps {
  initialProfile: StudentProfile;
}

const YEAR_LABELS: Record<string, string> = {
  "1st_year": "1st Year",
  "2nd_year": "2nd Year",
  "3rd_year": "3rd Year",
  "4th_year": "4th Year",
  graduate: "Graduate",
};

// Placeholder dorm cards for the UI
const PLACEHOLDER_DORMS = [
  {
    id: 1,
    name: "Sunrise Student Residence",
    location: "Campus District",
    matchScore: 94,
    price: 850,
    amenities: ["WiFi", "Gym", "Laundry"],
    type: "Single Room",
    available: true,
  },
  {
    id: 2,
    name: "The Scholar's Lodge",
    location: "North Campus",
    matchScore: 88,
    price: 720,
    amenities: ["WiFi", "Study Room", "Cafeteria"],
    type: "Shared Room",
    available: true,
  },
  {
    id: 3,
    name: "Maple Hall Residences",
    location: "University Avenue",
    matchScore: 82,
    price: 980,
    amenities: ["WiFi", "Parking", "Gym", "Pool"],
    type: "Studio",
    available: false,
  },
  {
    id: 4,
    name: "Campus View Apartments",
    location: "South Gate",
    matchScore: 79,
    price: 1100,
    amenities: ["WiFi", "Parking", "Balcony"],
    type: "1 Bedroom",
    available: true,
  },
  {
    id: 5,
    name: "Westfield Student Hub",
    location: "West Campus",
    matchScore: 75,
    price: 660,
    amenities: ["WiFi", "Common Room", "Laundry"],
    type: "Shared Room",
    available: true,
  },
  {
    id: 6,
    name: "The Crest Dormitory",
    location: "East Side",
    matchScore: 71,
    price: 790,
    amenities: ["WiFi", "Study Room"],
    type: "Single Room",
    available: false,
  },
];

function getMatchColor(score: number): string {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-orange-600 dark:text-orange-400";
}

function getMatchBg(score: number): string {
  if (score >= 90)
    return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
  if (score >= 80)
    return "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800";
  if (score >= 70)
    return "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
  return "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800";
}

export function DashboardHomeClient({
  initialProfile,
}: DashboardHomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [filterType, setFilterType] = useState("all");

  // Use React Query with initialData from server (no loading state!)
  const { data: profile } = useStudentProfile(initialProfile);

  const firstName = profile!.full_name.split(" ")[0];
  const yearLabel =
    YEAR_LABELS[profile!.year_of_study] ?? profile!.year_of_study;

  const filteredDorms = PLACEHOLDER_DORMS.filter((dorm) => {
    const matchesSearch =
      searchQuery === "" ||
      dorm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dorm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dorm.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "all" ||
      (filterType === "available" && dorm.available) ||
      (filterType === "single" && dorm.type === "Single Room") ||
      (filterType === "shared" && dorm.type === "Shared Room") ||
      (filterType === "studio" && dorm.type === "Studio");

    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    return 0;
  });

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {yearLabel} · {profile!.major} · {profile!.university_name}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 self-start">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              AI Matching Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          {
            icon: Home,
            label: "Available Dorms",
            value: "248",
            sub: "near your campus",
          },
          {
            icon: Star,
            label: "Top Match",
            value: "94%",
            sub: "compatibility",
          },
          {
            icon: Users,
            label: "Active Students",
            value: "1,200+",
            sub: "looking for rooms",
          },
          {
            icon: BookOpen,
            label: "New Listings",
            value: "32",
            sub: "this week",
          },
        ].map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-serif font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Section */}
      <Card className="mb-6 py-0">
        <CardHeader className="pb-0 pt-5 px-5">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Find Your Perfect Dorm
          </CardTitle>
          <CardDescription className="text-xs">
            Search by name, location, or room type — sorted by your
            compatibility score
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-5 px-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search dorms, locations, room types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex gap-2 shrink-0">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-10 w-auto min-w-[130px]">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="single">Single Room</SelectItem>
                  <SelectItem value="shared">Shared Room</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 w-auto min-w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="price_asc">Price: Low → High</SelectItem>
                  <SelectItem value="price_desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {filteredDorms.length} dorm
            {filteredDorms.length !== 1 ? "s" : ""} found
          </h2>
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              &quot;{searchQuery}&quot;
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Updated 2 hours ago</span>
          <span className="sm:hidden">2h ago</span>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-primary/80">
          <span className="font-medium text-primary">
            Live listings coming soon!
          </span>{" "}
          The cards below are previews of what the matching experience will look
          like.
        </p>
      </div>

      {/* Dorm Cards Grid */}
      {filteredDorms.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No dorms found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDorms.map((dorm) => (
            <Card
              key={dorm.id}
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 py-0 gap-0 overflow-hidden",
                !dorm.available && "opacity-70",
              )}
            >
              {/* Image Placeholder */}
              <div className="relative h-36 sm:h-40 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="h-12 w-12 text-muted-foreground/20" />
                </div>
                {/* Match Score Badge */}
                <div
                  className={cn(
                    "absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold",
                    getMatchBg(dorm.matchScore),
                    getMatchColor(dorm.matchScore),
                  )}
                >
                  <Star className="h-3 w-3 fill-current" />
                  {dorm.matchScore}% match
                </div>
                {/* Availability Badge */}
                {!dorm.available && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/90 border border-border text-xs font-medium text-muted-foreground">
                    Not Available
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Name & Location */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                      {dorm.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {dorm.location}
                      </span>
                    </div>
                  </div>

                  {/* Type & Price */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {dorm.type}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">
                      ${dorm.price}
                      <span className="text-xs font-normal text-muted-foreground">
                        /mo
                      </span>
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {dorm.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                    {dorm.amenities.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        +{dorm.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    variant={dorm.available ? "default" : "outline"}
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5 group/btn"
                    disabled={!dorm.available}
                  >
                    {dorm.available ? (
                      <>
                        View Details
                        <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                      </>
                    ) : (
                      "Unavailable"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
