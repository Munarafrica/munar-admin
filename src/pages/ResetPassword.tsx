import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CardLayout } from "../components/auth/CardLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/AuthButton";
import { useAuth } from "../contexts";

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export const ResetPassword = ({ onNavigate }: ResetPasswordProps) => {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or missing a token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Password reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <CardLayout>
        <div className="flex flex-col items-center text-center max-w-[400px]">
          <div className="mb-6">
            <div className="p-1 rounded-[14px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="bg-emerald-500 p-3 rounded-[10px] shadow-[0px_4px_4px_rgba(89,89,89,0.15)] relative overflow-hidden">
                <div className="absolute inset-0 shadow-[inset_2px_4px_4px_rgba(255,255,255,0.25)] rounded-[10px] pointer-events-none" />
                <svg className="text-white size-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Password Reset</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your password has been updated successfully. You can now sign in with the new password.
          </p>

          <Button onClick={() => onNavigate("login")} className="bg-[#6342e9] w-full">
            Go to Login
          </Button>
        </div>
      </CardLayout>
    );
  }

  return (
    <CardLayout>
      <div className="w-full text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Reset Password</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8">
          Set a new password for your account.
        </p>

        {!token && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300 mb-4">
            This link is missing a reset token. Request a new password reset email to continue.
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1 text-left">
            <Input
              label="New Password"
              placeholder="Create a new password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Must be at least 8 characters</p>
          </div>

          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={isLoading || !token} className="bg-[#6342e9]">
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>

          <button
            type="button"
            onClick={() => onNavigate("forgot-password")}
            className="text-[13px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Request a new link
          </button>
        </form>
      </div>
    </CardLayout>
  );
};
