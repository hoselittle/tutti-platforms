"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { USER_ROLES } from "@/lib/constants";
import { Music, UserSearch } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role");

  const [step, setStep] = useState(preselectedRole ? 2 : 1);
  const [role, setRole] = useState(preselectedRole || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Registration failed. Please try again.");
      }

      // Small delay to let the trigger create user_profiles row
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 2. Update user profile with role flags
      const updateData = {
        role: role, // keep legacy field for now
        active_role: role,
        is_pianist: role === USER_ROLES.PIANIST,
        is_client: role === USER_ROLES.CLIENT,
      };

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", authData.user.id);

      if (profileError) throw profileError;

      // 3. Create role-specific profile
      if (role === USER_ROLES.PIANIST) {
        const { error: pianistError } = await supabase
          .from("pianist_profiles")
          .insert({
            user_id: authData.user.id,
            name: "",
            postcode: "",
          });

        if (pianistError) throw pianistError;

        router.push("/pianist/profile/edit?new=true");
      } else {
        const { error: clientError } = await supabase
          .from("client_profiles")
          .insert({
            user_id: authData.user.id,
            name: "",
            email: email,
          });

        if (clientError) throw clientError;

        router.push("/client/profile/edit?new=true");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            Join Tutti Platforms
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            How would you like to use the platform?
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect(USER_ROLES.PIANIST)}
              className="w-full p-6 border-2 border-zinc-200 rounded-lg hover:border-zinc-900 transition-colors text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                  <Music className="h-5 w-5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    I&apos;m a Pianist
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    I want to offer accompaniment services and find work.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect(USER_ROLES.CLIENT)}
              className="w-full p-6 border-2 border-zinc-200 rounded-lg hover:border-zinc-900 transition-colors text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                  <UserSearch className="h-5 w-5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    I need a Pianist
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    I&apos;m a student, parent, or teacher looking for an
                    accompanist.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-sm text-zinc-500 text-center mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-zinc-900 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: Email & Password */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              {role === USER_ROLES.PIANIST
                ? "Sign up as a pianist"
                : "Sign up to find a pianist"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setRole("");
                    setError("");
                  }}
                  className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                  ← Back to role selection
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-zinc-200">
              <p className="text-sm text-zinc-500 text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-zinc-900 font-medium hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
