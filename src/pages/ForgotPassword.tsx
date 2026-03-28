import React, { useState } from "react";
import { CardLayout } from "../components/auth/CardLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/AuthButton";
import { useAuth } from "../contexts";

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword = ({ onNavigate }: ForgotPasswordProps) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordReset(email.trim());
      setSuccessMessage(response.message);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardLayout>
      <div className="w-full text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Forgot Password</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8">
          Enter your email address and we&apos;ll send a password reset link if the account exists.
        </p>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-sm text-emerald-700 dark:text-emerald-300 mb-4">
            {successMessage}
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <Button type="submit" disabled={isLoading} className="bg-[#6342e9]">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="text-[13px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mt-2"
          >
            Back to Login
          </button>
        </form>
      </div>
    </CardLayout>
  );
};
