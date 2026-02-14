"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { COMMON_HOBBIES } from "@/lib/constants";

// Lifestyle Step - Compatibility preferences
export function LifestyleStep() {
  const { data, updateData } = useOnboardingStore();

  const form = useForm({
    defaultValues: {
      sleep_schedule: data.sleep_schedule || "flexible",
      cleanliness: data.cleanliness || 3,
      noise_level: data.noise_level || "moderate",
      guests_frequency: data.guests_frequency || "sometimes",
      study_location: data.study_location || "both",
    },
  });

  useEffect(() => {
    // Seed store with the form's default values so defaults count as "filled"
    updateData(form.getValues());

    const subscription = form.watch((value) => {
      //learn about .watch() in react-hook-form
      updateData(value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateData]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="sleep_schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sleep Schedule</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sleep schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="early_bird">
                    Early Bird (sleep before 10 PM)
                  </SelectItem>
                  <SelectItem value="night_owl">
                    Night Owl (sleep after 12 AM)
                  </SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cleanliness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Cleanliness Level (1 = Messy, 5 = Very Clean)
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="How clean do you keep your space?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 - Very Messy</SelectItem>
                  <SelectItem value="2">2 - Somewhat Messy</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - Clean</SelectItem>
                  <SelectItem value="5">5 - Very Clean</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noise_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Noise Level Preference</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="How much noise can you tolerate?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="quiet">Quiet - Prefer silence</SelectItem>
                  <SelectItem value="moderate">
                    Moderate - Some noise is okay
                  </SelectItem>
                  <SelectItem value="social">
                    Social - Enjoy lively environment
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guests_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How Often Do You Have Guests?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="sometimes">Sometimes</SelectItem>
                  <SelectItem value="often">Often</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="study_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where Do You Prefer to Study?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select study location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="room">In my room</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

// Preferences Step - Additional preferences
export function PreferencesStep() {
  const { data, updateData } = useOnboardingStore();

  const form = useForm({
    defaultValues: {
      smoking: data.smoking || false,
      pets: data.pets || false,
      diet_preference: data.diet_preference || "no_preference",
    },
  });

  useEffect(() => {
    // Seed store with the form's default values so defaults count as "filled"
    updateData(form.getValues());

    const subscription = form.watch((value) => {
      updateData(value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateData]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="smoking"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you smoke?</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have or want pets?</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diet_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Preference</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your dietary preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no_preference">No Preference</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This helps match you with compatible roommates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

// Bio Step - About you and hobbies
export function BioStep() {
  const { data, updateData } = useOnboardingStore();
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(
    data.hobbies || [],
  );

  const form = useForm({
    defaultValues: {
      bio: data.bio || "",
      hobbies: data.hobbies || [],
    },
  });

  useEffect(() => {
    // Seed store with the form's default values
    const initial = form.getValues();
    updateData({
      bio: initial.bio,
      hobbies:
        initial.hobbies?.filter((h): h is string => h !== undefined) || [],
    });

    const subscription = form.watch((value) => {
      updateData({
        // get first 100 words of the bio
        bio: value.bio?.split(" ").slice(0, 100).join(" ") || "",
        hobbies:
          value.hobbies?.filter((h): h is string => h !== undefined) || [],
      });
    });
    return () => subscription.unsubscribe();
  }, [form, updateData]);

  const addHobby = (hobby: string) => {
    if (!selectedHobbies.includes(hobby)) {
      const newHobbies = [...selectedHobbies, hobby];
      setSelectedHobbies(newHobbies);
      form.setValue("hobbies", newHobbies);
      updateData({ hobbies: newHobbies });
    }
  };

  const removeHobby = (hobby: string) => {
    const newHobbies = selectedHobbies.filter((h) => h !== hobby);
    setSelectedHobbies(newHobbies);
    form.setValue("hobbies", newHobbies);
    updateData({ hobbies: newHobbies });
  };

  // Filter out already selected hobbies from available list
  const availableHobbies = COMMON_HOBBIES.filter(
    (hobby) => !selectedHobbies.includes(hobby),
  );

  return (
    <Form {...form}>
      <form className="space-y-5 ">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About You (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell potential roommates about yourself... your interests, what you're looking for in a roommate, etc."
                  className="min-h-24 resize-none max-w-152.5"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A good bio helps you find more compatible matches (max 100
                words)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 w-full">
          <Label>Hobbies & Interests (Optional)</Label>

          {/* Your Selected Hobbies */}
          {selectedHobbies.length > 0 && (
            <div className="space-y-2 max-w-152.5">
              <p className="text-sm font-medium">Your Hobbies:</p>
              <div className="flex flex-wrap gap-2 w-full">
                {selectedHobbies.map((hobby) => (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => removeHobby(hobby)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary text-primary-foreground border border-primary hover:bg-primary/90 transition-colors shrink-0"
                  >
                    {hobby}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Hobbies */}
          {availableHobbies.length > 0 && (
            <div className="space-y-2 max-w-152.5">
              <p className="text-sm text-muted-foreground">
                Select hobbies that interest you ({selectedHobbies.length}{" "}
                selected)
              </p>
              <div className="flex flex-wrap gap-2 w-full">
                {availableHobbies.map((hobby) => (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => addHobby(hobby)}
                    className="px-3 py-1 rounded-full text-sm bg-background hover:bg-accent border border-input transition-colors shrink-0"
                  >
                    {hobby}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
