import React, { useState } from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthCard } from "../components/auth/AuthCard";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/AuthButton";
import { Checkbox } from "../components/ui/checkbox";
import { Divider } from "../components/ui/divider";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import { useAuth } from "../contexts";
import { saveTwoFactorChallenge } from "./TwoFactorVerification";
import {
  PHONE_COUNTRIES,
  PHONE_COUNTRY_OPTIONS,
  ensurePhoneHasDialCode,
  extractNationalPhoneDigits,
  findPhoneCountryByDialCode,
  formatInternationalPhone,
  getPhoneCountryByIso2,
  isValidInternationalPhone,
} from "../lib/phone-countries";

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp = ({ onNavigate }: SignUpProps) => {
  const { signUp, loginWithGoogle, isLoading, error, clearError } = useAuth();
  const defaultCountry = getPhoneCountryByIso2("NG") ?? PHONE_COUNTRIES[0];
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountryIso2, setSelectedCountryIso2] = useState("NG");
  const [phone, setPhone] = useState(defaultCountry.dialCode);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [localError, setLocalError] = useState("");
  const selectedCountry = getPhoneCountryByIso2(selectedCountryIso2) ?? defaultCountry;

  const handleCountryChange = (countryIso2: string) => {
    const nextCountry = getPhoneCountryByIso2(countryIso2);

    if (!nextCountry) {
      return;
    }

    const nationalDigits = extractNationalPhoneDigits(phone, selectedCountry);

    setSelectedCountryIso2(nextCountry.iso2);
    setPhone(nationalDigits ? `${nextCountry.dialCode}${nationalDigits}` : nextCountry.dialCode);
  };

  const handlePhoneChange = (value: string) => {
    const detectedCountry = findPhoneCountryByDialCode(value, selectedCountryIso2);
    const countryForPhone = detectedCountry ?? selectedCountry;

    if (detectedCountry && detectedCountry.iso2 !== selectedCountryIso2) {
      setSelectedCountryIso2(detectedCountry.iso2);
    }

    setPhone(ensurePhoneHasDialCode(value, countryForPhone));
  };

  const handleGoogleCredential = async (credential: string) => {
    setLocalError("");
    clearError();

    const result = await loginWithGoogle(credential, "ORGANISER");

    if ("requiresTwoFactor" in result) {
      saveTwoFactorChallenge(result);
      onNavigate("two-factor");
      return;
    }

    onNavigate("my-events");
  };

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
    const formattedPhone = formatInternationalPhone(phone, selectedCountry);
    if (!formattedPhone) {
      setLocalError("Please enter your phone number");
      return;
    }
    if (!isValidInternationalPhone(formattedPhone)) {
      setLocalError("Please enter a valid phone number with the selected country code");
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
        phone: formattedPhone,
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
          <GoogleAuthButton
            disabled={isLoading}
            onCredential={handleGoogleCredential}
            onError={setLocalError}
          />

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

            <div className="flex flex-col gap-2">
              <div className="flex flex-col md:flex-row gap-6">
                <Select
                  label="Country*"
                  value={selectedCountryIso2}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  options={PHONE_COUNTRY_OPTIONS}
                  required
                />

                <Input
                  label="Phone Number*"
                  placeholder={`${selectedCountry.dialCode}8000000000`}
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                We'll save this as {formatInternationalPhone(phone, selectedCountry) || `${selectedCountry.dialCode}...`}.
              </p>
            </div>
            
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
