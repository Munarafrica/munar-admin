import React, { useMemo, useState } from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthCard } from "../components/auth/AuthCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/AuthButton";
import { useAuth } from "../contexts";
import { TwoFactorResponse } from "../types/api";

interface TwoFactorVerificationProps {
  onNavigate: (page: string) => void;
}

const challengeStorageKey = "munar_2fa_challenge";

export function saveTwoFactorChallenge(challenge: TwoFactorResponse) {
  sessionStorage.setItem(challengeStorageKey, JSON.stringify(challenge));
}

function getStoredChallenge(): TwoFactorResponse | null {
  const storedChallenge = sessionStorage.getItem(challengeStorageKey);

  if (!storedChallenge) {
    return null;
  }

  try {
    return JSON.parse(storedChallenge) as TwoFactorResponse;
  } catch {
    sessionStorage.removeItem(challengeStorageKey);
    return null;
  }
}

export const TwoFactorVerification = ({ onNavigate }: TwoFactorVerificationProps) => {
  const { verifyTwoFactor, isLoading, error, clearError } = useAuth();
  const challenge = useMemo(() => getStoredChallenge(), []);
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!challenge) {
      setLocalError("Your verification session has expired. Please sign in again.");
      return;
    }

    const verificationCode = code.replace(/\D/g, "");

    if (verificationCode.length < 6) {
      setLocalError("Enter the 6-digit verification code.");
      return;
    }

    try {
      await verifyTwoFactor(challenge.challengeToken, verificationCode);
      sessionStorage.removeItem(challengeStorageKey);
      onNavigate("my-events");
    } catch (err: any) {
      setLocalError(err?.message || "Verification failed. Please try again.");
    }
  };

  const displayError = localError || error || (!challenge ? "Your verification session has expired. Please sign in again." : "");

  return (
    <AuthLayout>
      <AuthCard
        title="Verify Your Sign In"
        subtitle={challenge?.message || "Enter the verification code sent to your account"}
        footerLink={{
          text: "Need to try again?",
          linkText: "Back to login",
          onClick: () => onNavigate("login"),
        }}
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {challenge?.destination && (
            <p className="text-center text-[13px] text-slate-500 dark:text-slate-400">
              Code sent to {challenge.destination}
            </p>
          )}

          {displayError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {displayError}
            </div>
          )}

          <Input
            label="Verification Code*"
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Button type="submit" disabled={isLoading || !challenge}>
            {isLoading ? "Verifying..." : "Verify and continue"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};
