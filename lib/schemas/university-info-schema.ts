import z from "zod";

export const universityInfoSchema = z.object({
  university_name: z.string().min(2, "University name is required"),
  year_of_study: z.string().min(1, "Year of study is required"),
  major: z.string().min(2, "Major is required"),
});

export type UniversityInfoForm = z.infer<typeof universityInfoSchema>;
