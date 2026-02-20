"use client";

import { useState } from "react";
import { User, GraduationCap, Moon, Sparkles, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useStudentProfile,
  type StudentProfile,
} from "@/hooks/use-student-profile";
import { useUpdateProfileMutation } from "@/hooks/use-update-profile-mutation";
import { type ProfileUpdate } from "@/lib/schemas/profile-edit-schema";
import { EditableField } from "@/components/dashboard/editable-field";
import { EditableSearchField } from "@/components/dashboard/editable-search-field";
import { EditableHobbies } from "@/components/dashboard/editable-hobbies";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { COMMON_MAJORS } from "@/lib/constants";
import { useUniversitySearch } from "@/hooks/use-university-search";

// ─── Label maps ─────────────────────────────────────────────────────────────

const YEAR_LABELS: Record<string, string> = {
  "1st_year": "1st Year",
  "2nd_year": "2nd Year",
  "3rd_year": "3rd Year",
  "4th_year": "4th Year",
  graduate: "Graduate Student",
};

const SLEEP_OPTIONS = [
  { value: "early_bird", label: "Early Bird (before 10 PM)" },
  { value: "night_owl", label: "Night Owl (after 12 AM)" },
  { value: "flexible", label: "Flexible" },
];

const NOISE_OPTIONS = [
  { value: "quiet", label: "Quiet" },
  { value: "moderate", label: "Moderate" },
  { value: "social", label: "Social" },
];

const GUEST_OPTIONS = [
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
];

const STUDY_OPTIONS = [
  { value: "library", label: "Library" },
  { value: "room", label: "In My Room" },
  { value: "both", label: "Both" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const YEAR_OPTIONS = [
  { value: "1st_year", label: "1st Year" },
  { value: "2nd_year", label: "2nd Year" },
  { value: "3rd_year", label: "3rd Year" },
  { value: "4th_year", label: "4th Year" },
  { value: "graduate", label: "Graduate Student" },
];

const DIET_OPTIONS = [
  { value: "no_preference", label: "No Preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "other", label: "Other" },
];

const CLEANLINESS_OPTIONS = [
  { value: "1", label: "1 — Very Messy" },
  { value: "2", label: "2 — Somewhat Messy" },
  { value: "3", label: "3 — Moderate" },
  { value: "4", label: "4 — Clean" },
  { value: "5", label: "5 — Very Clean" },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProfilePageClientProps {
  initialProfile: StudentProfile;
  userEmail: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfilePageClient({
  initialProfile,
  userEmail,
}: ProfilePageClientProps) {
  const { data: profile } = useStudentProfile(initialProfile);
  const {
    mutate: updateProfile,
    isPending,
    variables,
  } = useUpdateProfileMutation();
  const [universityQuery, setUniversityQuery] = useState("");
  const { data: universities = [], isLoading: isSearchingUniversities } =
    useUniversitySearch(universityQuery);

  if (!profile) return null;

  // Determine which field is actively saving so we can pass isSaving per field
  const isSaving = (field: keyof ProfileUpdate) =>
    isPending && variables !== undefined && field in variables;

  const save = (updates: ProfileUpdate) => {
    updateProfile(updates, {
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to save changes",
        );
      },
    });
  };

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Click-to-edit hint */}
      <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        Click any field to edit it inline
      </p>

      {/* ── Profile Header ── */}
      <Card className="mb-4 py-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            <AvatarUpload currentUrl={profile.avatar_url} initials={initials} />

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-serif font-medium text-foreground">
                {profile.full_name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{profile.university_name}</span>
                </div>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-sm text-muted-foreground">
                  {userEmail}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="capitalize">
                  {profile.gender}
                </Badge>
                <Badge variant="secondary">
                  {YEAR_LABELS[profile.year_of_study] ?? profile.year_of_study}
                </Badge>
                <Badge variant="outline">{profile.major}</Badge>
              </div>
            </div>
          </div>

          {/* Personal editable fields */}
          <div className="border-t border-border pt-1">
            <EditableField
              label="Full Name"
              displayValue={profile.full_name}
              currentValue={profile.full_name}
              onSave={(v) => save({ full_name: String(v) })}
              isSaving={isSaving("full_name")}
            />
            <EditableField
              label="Gender"
              displayValue={
                profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
              }
              currentValue={profile.gender}
              config={{ kind: "select", options: GENDER_OPTIONS }}
              onSave={(v) => save({ gender: v as "male" | "female" })}
              isSaving={isSaving("gender")}
            />
            <EditableField
              label="Phone"
              displayValue={profile.phone ?? ""}
              currentValue={profile.phone ?? ""}
              onSave={(v) => save({ phone: String(v) })}
              isSaving={isSaving("phone")}
            />
            <EditableField
              label="Bio"
              displayValue={profile.bio ?? ""}
              currentValue={profile.bio ?? ""}
              config={{
                kind: "textarea",
                placeholder: "Tell potential roommates about yourself…",
              }}
              onSave={(v) => save({ bio: String(v) })}
              isSaving={isSaving("bio")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── University ── */}
      <Card className="mb-4 py-0">
        <CardHeader className="pb-0 pt-5 px-5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            University Info
          </CardTitle>
          <CardDescription className="text-xs">
            Your academic details
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 pb-5 px-5">
          <EditableSearchField
            label="University"
            displayValue={profile.university_name}
            currentValue={profile.university_name}
            searchResults={universities.map((u) => ({
              label: u.name,
              sublabel: u.country,
            }))}
            onSearch={setUniversityQuery}
            isSearching={isSearchingUniversities}
            onSave={(v) => save({ university_name: v })}
            isSaving={isSaving("university_name")}
          />
          <EditableField
            label="Year of Study"
            displayValue={
              YEAR_LABELS[profile.year_of_study] ?? profile.year_of_study
            }
            currentValue={profile.year_of_study}
            config={{ kind: "select", options: YEAR_OPTIONS }}
            onSave={(v) =>
              save({ year_of_study: v as StudentProfile["year_of_study"] })
            }
            isSaving={isSaving("year_of_study")}
          />
          <EditableSearchField
            label="Major"
            displayValue={profile.major}
            currentValue={profile.major}
            options={COMMON_MAJORS}
            onSave={(v) => save({ major: v })}
            isSaving={isSaving("major")}
          />
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* ── Lifestyle ── */}
        <Card className="py-0">
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              Lifestyle
            </CardTitle>
            <CardDescription className="text-xs">
              Your daily habits
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3 pb-5 px-5">
            <EditableField
              label="Sleep Schedule"
              displayValue={
                SLEEP_OPTIONS.find((o) => o.value === profile.sleep_schedule)
                  ?.label ?? profile.sleep_schedule
              }
              currentValue={profile.sleep_schedule}
              config={{ kind: "select", options: SLEEP_OPTIONS }}
              onSave={(v) =>
                save({ sleep_schedule: v as StudentProfile["sleep_schedule"] })
              }
              isSaving={isSaving("sleep_schedule")}
            />
            <EditableField
              label="Cleanliness"
              displayValue={`${profile.cleanliness}/5`}
              currentValue={String(profile.cleanliness)}
              config={{ kind: "select", options: CLEANLINESS_OPTIONS }}
              onSave={(v) => save({ cleanliness: parseInt(String(v)) })}
              isSaving={isSaving("cleanliness")}
            />
            <EditableField
              label="Noise Level"
              displayValue={
                NOISE_OPTIONS.find((o) => o.value === profile.noise_level)
                  ?.label ?? profile.noise_level
              }
              currentValue={profile.noise_level}
              config={{ kind: "select", options: NOISE_OPTIONS }}
              onSave={(v) =>
                save({ noise_level: v as StudentProfile["noise_level"] })
              }
              isSaving={isSaving("noise_level")}
            />
            <EditableField
              label="Guests"
              displayValue={
                GUEST_OPTIONS.find((o) => o.value === profile.guests_frequency)
                  ?.label ?? profile.guests_frequency
              }
              currentValue={profile.guests_frequency}
              config={{ kind: "select", options: GUEST_OPTIONS }}
              onSave={(v) =>
                save({
                  guests_frequency: v as StudentProfile["guests_frequency"],
                })
              }
              isSaving={isSaving("guests_frequency")}
            />
            <EditableField
              label="Study Location"
              displayValue={
                STUDY_OPTIONS.find((o) => o.value === profile.study_location)
                  ?.label ?? profile.study_location
              }
              currentValue={profile.study_location}
              config={{ kind: "select", options: STUDY_OPTIONS }}
              onSave={(v) =>
                save({ study_location: v as StudentProfile["study_location"] })
              }
              isSaving={isSaving("study_location")}
            />
          </CardContent>
        </Card>

        {/* ── Preferences ── */}
        <Card className="py-0">
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Roommate compatibility factors
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3 pb-5 px-5">
            <EditableField
              label="Smoking"
              displayValue={profile.smoking ? "Yes" : "No"}
              currentValue={profile.smoking}
              config={{ kind: "boolean" }}
              onSave={(v) => save({ smoking: Boolean(v) })}
              isSaving={isSaving("smoking")}
            />
            <EditableField
              label="Pets"
              displayValue={profile.pets ? "Yes" : "No"}
              currentValue={profile.pets}
              config={{ kind: "boolean" }}
              onSave={(v) => save({ pets: Boolean(v) })}
              isSaving={isSaving("pets")}
            />
            <EditableField
              label="Diet"
              displayValue={
                DIET_OPTIONS.find((o) => o.value === profile.diet_preference)
                  ?.label ?? profile.diet_preference
              }
              currentValue={profile.diet_preference}
              config={{ kind: "select", options: DIET_OPTIONS }}
              onSave={(v) =>
                save({
                  diet_preference: v as StudentProfile["diet_preference"],
                })
              }
              isSaving={isSaving("diet_preference")}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Hobbies ── */}
      <Card className="py-0">
        <CardHeader className="pb-0 pt-5 px-5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Hobbies &amp; Interests
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-5 px-5">
          <EditableHobbies
            currentHobbies={profile.hobbies ?? []}
            onSave={(hobbies) => {
              save({ hobbies });
            }}
            isSaving={isSaving("hobbies")}
          />
        </CardContent>
      </Card>
    </main>
  );
}
