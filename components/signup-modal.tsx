"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  signupSchema,
  type SignupFormValues,
} from "@/lib/schemas/signup-schema";
import { useSignupMutation } from "@/hooks/use-signup-mutation";

export function SignupModal() {
  const showSignup = useAuthStore((s) => s.showSignup);
  const setShowSignup = useAuthStore((s) => s.setShowSignup);
  const setShowLogin = useAuthStore((s) => s.setShowLogin);
  const signupSuccess = useAuthStore((s) => s.signupSuccess);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const { mutate: signup, isPending } = useSignupMutation();

  const onSubmit = (values: SignupFormValues) => {
    signup(values, {
      onSuccess: async ({ requiresConfirmation }) => {
        toast.success(
          requiresConfirmation
            ? "Account created! Please check your university email to verify your account."
            : "Account created successfully!",
          { duration: 6000 },
        );

        form.reset();
        await signupSuccess();

        document
          .getElementById("how-it-works")
          ?.scrollIntoView({ behavior: "smooth" });
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
        );
      },
    });
  };

  return (
    <Dialog open={showSignup} onOpenChange={setShowSignup}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Create Student Account
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign up with your university email
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@university.edu"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Use your university email
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setShowSignup(false);
                setShowLogin(true);
              }}
              className="text-primary hover:underline font-medium"
              disabled={isPending}
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
