import React, { useState } from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthCard } from "../components/auth/AuthCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/AuthButton";
import { Divider } from "../components/ui/divider";
import { useAuth } from "../contexts";

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login = ({ onNavigate }: LoginProps) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email || !password) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
      // Auth guard (RedirectIfAuth) will handle navigation to /events
      onNavigate("my-events");
    } catch (err: any) {
      setLocalError(err?.message || "Login failed. Please check your credentials.");
    }
  };

  const displayError = localError || error;

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Log into your account"
        footerLink={{
          text: "Don't have an account?",
          linkText: "Sign Up",
          onClick: () => onNavigate("signup"),
        }}
      >
        <div className="flex flex-col gap-6">
          <Button variant="google" onClick={() => console.log("Google Login")}>
            Sign up with Google
          </Button>

          <Divider text="Or Continue with" />

          {displayError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {displayError}
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input 
              label="Email*" 
              placeholder="Email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            <div className="flex flex-col gap-1">
              <Input 
                label="Password*" 
                placeholder="Enter your password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <div className="flex justify-end">
                <button 
                    type="button"
                    onClick={() => onNavigate("forgot-password")}
                    className="text-[13px] text-[#8b5cf6] font-medium hover:underline"
                >
                    Forgot Password?
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};
