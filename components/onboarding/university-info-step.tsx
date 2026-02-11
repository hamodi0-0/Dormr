"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
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

const universityInfoSchema = z.object({
  university_name: z.string().min(2, "University name is required"),
  year_of_study: z.enum([
    "1st_year",
    "2nd_year",
    "3rd_year",
    "4th_year",
    "graduate",
  ]),
  major: z.string().min(2, "Major is required"),
});

type UniversityInfoForm = z.infer<typeof universityInfoSchema>;

export function UniversityInfoStep() {
  const { data, updateData } = useOnboardingStore();
  const { universities, isLoading, searchUniversities } = useUniversitySearch();
  const [showUniversities, setShowUniversities] = useState(false);
  const [searchQuery, setSearchQuery] = useState(data.university_name || "");

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
    searchUniversities(value);
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
                    onFocus={() =>
                      searchQuery.length >= 2 && setShowUniversities(true)
                    }
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {showUniversities && universities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {universities.map((uni, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
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
                <Input placeholder="e.g., Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
