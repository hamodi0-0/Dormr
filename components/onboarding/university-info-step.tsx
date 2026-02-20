"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { COMMON_MAJORS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUniversitySearch } from "@/hooks/use-university-search";
import { Loader2 } from "lucide-react";
import {
  UniversityInfoForm,
  universityInfoSchema,
} from "@/lib/schemas/university-info-schema";

export function UniversityInfoStep() {
  const { data, updateData } = useOnboardingStore();
  const [searchQuery, setSearchQuery] = useState(data.university_name || "");
  const [majorSearchQuery, setMajorSearchQuery] = useState(data.major || "");
  const [showUniversities, setShowUniversities] = useState(false);
  const [showMajors, setShowMajors] = useState(false);
  const [queryInput, setQueryInput] = useState("");

  const { data: universities = [], isLoading } =
    useUniversitySearch(queryInput);

  const filteredMajors = majorSearchQuery
    ? COMMON_MAJORS.filter((major) =>
        major.toLowerCase().includes(majorSearchQuery.toLowerCase()),
      )
    : [];

  const form = useForm<UniversityInfoForm>({
    resolver: zodResolver(universityInfoSchema),
    defaultValues: {
      university_name: data.university_name || "",
      year_of_study: data.year_of_study || undefined,
      major: data.major || "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateData(value as Partial<UniversityInfoForm>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateData]);

  const handleUniversitySearch = (value: string) => {
    setSearchQuery(value);
    setQueryInput(value);
    if (value.length >= 2) {
      setShowUniversities(true);
    } else {
      setShowUniversities(false);
    }
  };

  const selectUniversity = (universityName: string) => {
    setSearchQuery(universityName);
    form.setValue("university_name", universityName);
    setShowUniversities(false);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="university_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Search for your university..."
                    value={searchQuery}
                    onChange={(e) => {
                      handleUniversitySearch(e.target.value);
                      field.onChange(e.target.value);
                    }}
                    // if user clicks enter the first university in the list should be selected
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && universities.length > 0) {
                        selectUniversity(universities[0].name);
                      }
                    }}
                    onFocus={() =>
                      searchQuery.length >= 2 && setShowUniversities(true)
                    }
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {showUniversities && universities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border dark:bg-sidebar  rounded-md shadow-lg max-h-60 overflow-auto p-1">
                      {universities.map((uni, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 hover:bg-accent rounded-sm cursor-pointer text-sm"
                          onClick={() => selectUniversity(uni.name)}
                        >
                          <div className="font-medium">{uni.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {uni.country}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year_of_study"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of Study *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1st_year">1st Year</SelectItem>
                  <SelectItem value="2nd_year">2nd Year</SelectItem>
                  <SelectItem value="3rd_year">3rd Year</SelectItem>
                  <SelectItem value="4th_year">4th Year</SelectItem>
                  <SelectItem value="graduate">Graduate Student</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="major"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Major / Field of Study *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Search for your major..."
                    value={majorSearchQuery}
                    onChange={(e) => {
                      setMajorSearchQuery(e.target.value);
                      field.onChange(e.target.value);
                      if (e.target.value.length >= 1) {
                        setShowMajors(true);
                      } else {
                        setShowMajors(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      // if user clicks enter the first major in the list should be selected
                      if (e.key === "Enter" && filteredMajors.length > 0) {
                        setMajorSearchQuery(filteredMajors[0]);
                        form.setValue("major", filteredMajors[0]);
                        setShowMajors(false);
                      }
                    }}
                    onFocus={() =>
                      majorSearchQuery.length >= 1 && setShowMajors(true)
                    }
                  />
                  {showMajors && filteredMajors.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white p-1 dark:bg-sidebar border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredMajors.map((major, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 hover:bg-accent rounded-sm cursor-pointer text-sm"
                          onClick={() => {
                            setMajorSearchQuery(major);
                            form.setValue("major", major);
                            setShowMajors(false);
                          }}
                        >
                          {major}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
