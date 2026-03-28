import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CardLayout } from "../components/auth/CardLayout";
import { MailIcon } from "../components/icons";
import { Button } from "../components/ui/AuthButton";
import { useAuth } from "../contexts";

interface EmailVerificationProps {
  onNavigate: (page: string) => void;
}

export const EmailVerification = ({ onNavigate }: EmailVerificationProps) => {
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const savedEmail = sessionStorage.getItem("munar_verify_email") || "";
  const savedMessage =
    sessionStorage.getItem("munar_verify_message") ||
    "Registration successful. Please verify your email before logging in.";

  const [isVerifying, setIsVerifying] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [infoMessage, setInfoMessage] = useState(savedMessage);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;
    setIsVerifying(true);
    setError("");
    setInfoMessage("Verifying your email address...");

    verifyEmail(token)
      .then((response) => {
        if (!isActive) return;
        setHasVerified(true);
        setInfoMessage(response.message);
      })
      .catch((err: unknown) => {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Email verification failed.");
        setInfoMessage("");
      })
      .finally(() => {
        if (!isActive) return;
        setIsVerifying(false);
      });

    return () => {
      isActive = false;
    };
  }, [token, verifyEmail]);

  const title = useMemo(() => {
    if (isVerifying) return "Verifying Your Email";
    if (hasVerified) return "Email Verified";
    return "Check Your Email";
  }, [hasVerified, isVerifying]);

  const handleResend = async () => {
    if (!savedEmail) {
      setError("No email address is available to resend verification.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const response = await resendVerificationEmail(savedEmail);
      setInfoMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <CardLayout>
      <div className="flex flex-col items-center text-center max-w-[420px]">
        <div className="mb-6">
          <div className="p-1 rounded-[14px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="bg-[#8b5cf6] p-3 rounded-[10px] shadow-[0px_4px_4px_rgba(89,89,89,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 shadow-[inset_2px_4px_4px_rgba(255,255,255,0.25)] rounded-[10px] pointer-events-none" />
              <MailIcon className="text-white size-7" />
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h1>

        {savedEmail && !hasVerified && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{savedEmail}</span>.
          </p>
        )}

        {infoMessage && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {infoMessage}
          </p>
        )}

        {error && (
          <div className="w-full rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {isVerifying && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-6" />
        )}

        {!isVerifying && (
          <div className="w-full flex flex-col gap-3">
            <Button onClick={() => onNavigate("login")} className="bg-[#6342e9] w-full">
              Back to Login
            </Button>

            {!hasVerified && savedEmail && (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-[#6342e9] hover:underline disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}
      </div>
    </CardLayout>
  );
};
