"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  signupSchema,
  type SignupFormValues,
} from "@/lib/schemas/signup-schema";
import { useSignupMutation } from "@/hooks/use-signup-mutation";

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SignupModal() {
  const showSignup = useAuthStore((s) => s.showSignup);
  const setShowSignup = useAuthStore((s) => s.setShowSignup);
  const setShowLogin = useAuthStore((s) => s.setShowLogin);
  const signupSuccess = useAuthStore((s) => s.signupSuccess);
  const [signupTab, setSignupTab] = useState<"student" | "lister">("student");
  const [isListerLoading, setIsListerLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const { mutate: signup, isPending } = useSignupMutation();

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowSignup(false);
      setSignupTab("student");
      form.reset();
    }
  };

  const handleListerGoogleSignUp = async () => {
    setIsListerLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?user_type=lister`,
        },
      });

      if (error) throw error;
      // Redirect handled by provider
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start sign-up",
      );
      setIsListerLoading(false);
    }
  };

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
    <Dialog open={showSignup} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Create Account
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign up to continue with Dormr
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={signupTab}
          onValueChange={(v) => setSignupTab(v as "student" | "lister")}
          className="w-full"
        >
          <TabsList className="w-full mb-2">
            <TabsTrigger value="student" className="flex-1">
              Student
            </TabsTrigger>
            <TabsTrigger value="lister" className="flex-1">
              Lister
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-2"
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

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignup(false);
                      setShowLogin(true, "student");
                    }}
                    className="text-primary hover:underline font-medium"
                    disabled={isPending}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="lister" className="mt-4">
            <div className="space-y-5 py-2">
              <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Lister accounts use Google sign-up
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Whether you&apos;re a new or returning lister, continue with
                  Google to create or resume your account.
                </p>
              </div>

              <Button
                onClick={handleListerGoogleSignUp}
                disabled={isListerLoading}
                variant="outline"
                size="lg"
                className="w-full gap-3"
              >
                {isListerLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {isListerLoading ? "Redirecting…" : "Continue with Google"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have a lister account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowSignup(false);
                    setShowLogin(true, "lister");
                  }}
                  className="text-primary hover:underline font-medium"
                  disabled={isListerLoading}
                >
                  Sign in
                </button>
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
