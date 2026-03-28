import React, { useMemo, useState } from "react";
import { ProfileSetupLayout } from "../components/auth/CardLayout";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/AuthButton";
import { useAuth } from "../contexts";
import { CurrencyCode, TenantType } from "../types/api";

interface ProfileSetupProps {
  onNavigate: (page: string) => void;
}

const currencyOptions = [
  { label: "NGN (Nigerian Naira)", value: "NGN" },
  { label: "USD (US Dollar)", value: "USD" },
  { label: "EUR (Euro)", value: "EUR" },
  { label: "GBP (British Pound)", value: "GBP" },
  { label: "GHS (Ghanaian Cedi)", value: "GHS" },
  { label: "KES (Kenyan Shilling)", value: "KES" },
  { label: "ZAR (South African Rand)", value: "ZAR" },
];

export const ProfileSetup = ({ onNavigate }: ProfileSetupProps) => {
  const { user, createTenant, isLoading, error, clearError } = useAuth();
  const storedTenantType = sessionStorage.getItem("munar_onboarding_tenant_type") as TenantType | null;
  const tenantType = storedTenantType || "INDIVIDUAL";
  const [workspaceName, setWorkspaceName] = useState(
    tenantType === "INDIVIDUAL"
      ? [user?.firstName, user?.lastName].filter(Boolean).join(" ") || ""
      : ""
  );
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [localError, setLocalError] = useState("");

  const heading = useMemo(() => {
    return tenantType === "INDIVIDUAL" ? "Create your workspace" : "Set up your organisation";
  }, [tenantType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!workspaceName.trim()) {
      setLocalError("Workspace name is required");
      return;
    }

    try {
      await createTenant({
        name: workspaceName.trim(),
        tenantType,
        defaultCurrency: currency,
        timezone: timezone.trim() || "Africa/Lagos",
      });
      sessionStorage.removeItem("munar_onboarding_tenant_type");
      onNavigate("my-events");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to create workspace. Please try again.");
    }
  };

  const displayError = localError || error;

  return (
    <ProfileSetupLayout>
      <div className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{heading}</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            This creates your first tenant so you can access the dashboard and manage events.
          </p>
        </div>

        {displayError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 mb-4">
            {displayError}
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Input
            label={tenantType === "INDIVIDUAL" ? "Workspace Name*" : "Organisation Name*"}
            placeholder={tenantType === "INDIVIDUAL" ? "e.g. Jane Doe Events" : "e.g. Munar Demo Events"}
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            required
          />

          <Select
            label="Default Currency"
            value={currency}
            onChange={e => setCurrency(e.target.value as CurrencyCode)}
            options={currencyOptions}
          />

          <Input
            label="Timezone"
            placeholder="Africa/Lagos"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          />

          <Button type="submit" disabled={isLoading} className="bg-[#6342e9] hover:bg-[#5232d9] mt-2">
            {isLoading ? "Creating workspace..." : "Finish Setup"}
          </Button>
        </form>
      </div>
    </ProfileSetupLayout>
  );
};
