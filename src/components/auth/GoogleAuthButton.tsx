import React, { useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Button } from "../ui/AuthButton";

interface GoogleAuthButtonProps {
  disabled?: boolean;
  onCredential: (credential: string) => Promise<void>;
  onError: (message: string) => void;
}

const fallbackMessage = "Google sign-in failed. Please try again.";

export function GoogleAuthButton({
  disabled,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError("Google did not return a sign-in credential.");
      return;
    }

    setIsLoading(true);

    try {
      await onCredential(credentialResponse.credential);
    } catch (err) {
      onError(err instanceof Error ? err.message : fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!googleClientId) {
    return (
      <Button
        type="button"
        variant="google"
        disabled={disabled || isLoading}
        onClick={() => onError("Google sign-in is not configured yet.")}
      >
        Continue with Google
      </Button>
    );
  }

  return (
    <div className={disabled || isLoading ? "pointer-events-none opacity-60" : undefined}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError(fallbackMessage)}
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}
