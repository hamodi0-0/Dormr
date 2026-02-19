"use client";

import {
  User,
  GraduationCap,
  Moon,
  Sparkles,
  Pencil,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useStudentProfile,
  type StudentProfile,
} from "@/hooks/queries/use-student-profile";

interface ProfilePageClientProps {
  initialProfile: StudentProfile;
  userEmail: string;
}

const YEAR_LABELS: Record<string, string> = {
  "1st_year": "1st Year",
  "2nd_year": "2nd Year",
  "3rd_year": "3rd Year",
  "4th_year": "4th Year",
  graduate: "Graduate Student",
};

const SLEEP_LABELS: Record<string, string> = {
  early_bird: "Early Bird",
  night_owl: "Night Owl",
  flexible: "Flexible",
};

const NOISE_LABELS: Record<string, string> = {
  quiet: "Quiet",
  moderate: "Moderate",
  social: "Social",
};

const GUEST_LABELS: Record<string, string> = {
  rarely: "Rarely",
  sometimes: "Sometimes",
  often: "Often",
};

const STUDY_LABELS: Record<string, string> = {
  library: "Library",
  room: "In My Room",
  both: "Both",
};

const DIET_LABELS: Record<string, string> = {
  no_preference: "No Preference",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  halal: "Halal",
  other: "Other",
};

export function ProfilePageClient({
  initialProfile,
  userEmail,
}: ProfilePageClientProps) {
  // Use React Query with initialData from server (no loading state!)
  const { data: profile } = useStudentProfile(initialProfile);

  const initials = profile!.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Phase 2 Banner */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
        <Pencil className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-primary/80">
          <span className="font-medium text-primary">
            Profile editing coming in Phase 2!
          </span>{" "}
          You can view your profile below. Editing, avatar upload, and more will
          be available soon.
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-6 py-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile!.avatar_url ?? undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-medium font-serif">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                <Pencil className="h-3 w-3 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-serif font-medium text-foreground">
                {profile!.full_name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{profile!.university_name}</span>
                </div>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-sm text-muted-foreground">
                  {userEmail}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="capitalize">
                  {profile!.gender}
                </Badge>
                <Badge variant="secondary">
                  {YEAR_LABELS[profile!.year_of_study] ??
                    profile!.year_of_study}
                </Badge>
                <Badge variant="outline">{profile!.major}</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              disabled
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>

          {profile!.bio && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile!.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Lifestyle Card */}
        <Card className="py-0">
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              Lifestyle
            </CardTitle>
            <CardDescription className="text-xs">
              Your daily habits and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-5 px-5 space-y-3">
            {[
              {
                label: "Sleep Schedule",
                value:
                  SLEEP_LABELS[profile!.sleep_schedule] ??
                  profile!.sleep_schedule,
              },
              {
                label: "Cleanliness",
                value: `${profile!.cleanliness}/5`,
              },
              {
                label: "Noise Level",
                value:
                  NOISE_LABELS[profile!.noise_level] ?? profile!.noise_level,
              },
              {
                label: "Guests",
                value:
                  GUEST_LABELS[profile!.guests_frequency] ??
                  profile!.guests_frequency,
              },
              {
                label: "Study Location",
                value:
                  STUDY_LABELS[profile!.study_location] ??
                  profile!.study_location,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="py-0">
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Your roommate compatibility factors
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-5 px-5 space-y-3">
            {[
              {
                label: "Smoking",
                value: profile!.smoking ? "Yes" : "No",
              },
              {
                label: "Pets",
                value: profile!.pets ? "Yes" : "No",
              },
              {
                label: "Diet",
                value:
                  DIET_LABELS[profile!.diet_preference] ??
                  profile!.diet_preference,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hobbies Card */}
      {profile!.hobbies && profile!.hobbies.length > 0 && (
        <Card className="py-0">
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Hobbies &amp; Interests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-5 px-5">
            <div className="flex flex-wrap gap-2">
              {profile!.hobbies.map((hobby: string) => (
                <Badge key={hobby} variant="secondary" className="text-xs">
                  {hobby}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* University Info */}
      <Card className="mt-4 py-0">
        <CardHeader className="pb-0 pt-5 px-5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            University Info
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-5 px-5 space-y-3">
          {[
            { label: "University", value: profile!.university_name },
            {
              label: "Year",
              value:
                YEAR_LABELS[profile!.year_of_study] ?? profile!.year_of_study,
            },
            { label: "Major", value: profile!.major },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
              <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
