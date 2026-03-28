import React, { useState } from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthCard } from "../components/auth/AuthCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/AuthButton";
import { Checkbox } from "../components/ui/checkbox";
import { Divider } from "../components/ui/divider";
import { useAuth } from "../contexts";

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp = ({ onNavigate }: SignUpProps) => {
  const { signUp, isLoading, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setLocalError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    try {
      const response = await signUp({
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      sessionStorage.setItem("munar_verify_email", email.trim());
      sessionStorage.setItem("munar_verify_message", response.message);
      onNavigate("verification");
    } catch (err: any) {
      setLocalError(err?.message || "Sign up failed. Please try again.");
    }
  };

  const displayError = localError || error;

  return (
    <AuthLayout>
      <AuthCard
        title="Create an Account"
        subtitle="Enter your details to create your account for free"
        footerLink={{
          text: "Got an account?",
          linkText: "Login",
          onClick: () => onNavigate("login"),
        }}
      >
        <div className="flex flex-col gap-6">
          <Button variant="google" onClick={() => console.log("Google Sign Up")}>
            Sign up with Google
          </Button>

          <Divider text="Or Continue with" />

          {displayError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {displayError}
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6">
              <Input
                label="First Name*"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />

              <Input
                label="Last Name*"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input 
              label="Email*" 
              placeholder="Email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />

            <Input
              label="Phone Number"
              placeholder="+2348000000000"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            
            <div className="flex flex-col gap-2">
              <Input 
                label="Password*" 
                placeholder="Create a strong password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <p className="text-[13px] text-slate-500 dark:text-slate-400">Must contain at least 8 characters</p>
            </div>

            <Input 
              label="Confirm Password*" 
              placeholder="Confirm your password" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />

            <Checkbox 
              label={
                <span className="dark:text-slate-300">
                  I accept the <a href="#" className="text-[#4285f4] underline">Terms of Service</a> and <a href="#" className="text-[#4285f4] underline">Privacy Policy</a>.
                </span>
              }
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up for free"}
            </Button>
          </form>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};
