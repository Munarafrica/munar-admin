import React, { useState } from "react";
import { ProfileSetupLayout } from "../components/auth/CardLayout";
import { Button } from "../components/ui/AuthButton";
import { IndividualIcon, OrganizationIcon } from "../components/icons";
import { TenantType } from "../types/api";

interface AccountTypeProps {
  onNavigate: (page: string) => void;
}

type AccountTypeOption = "INDIVIDUAL" | "ORGANISATION";

export const AccountType = ({ onNavigate }: AccountTypeProps) => {
  const [selectedType, setSelectedType] = useState<AccountTypeOption>("INDIVIDUAL");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ProfileSetupLayout>
      <div className="w-full flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-[21px] font-bold text-slate-900 dark:text-slate-100 mb-2">Choose an Account Type</h2>
          <p className="text-[13px] text-slate-500/70 dark:text-slate-400/70">Choose how you want to use the platform.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full mb-8 min-h-[365px]">
          {/* Individual Card */}
          <div 
            onClick={() => setSelectedType("INDIVIDUAL")}
            className={`
              flex-1 relative rounded-[8px] p-6 cursor-pointer transition-all duration-200 flex flex-col justify-center
              ${selectedType === "INDIVIDUAL" 
                ? "bg-[#e7ddff] dark:bg-[#8b5cf6]/20 ring-1 ring-[#8b5cf6]" 
                : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#8b5cf6]/50"}
            `}
          >
            <div className="flex flex-col gap-6">
              <div className={`p-2.5 rounded-[8px] w-fit ${selectedType === "INDIVIDUAL" ? "bg-[#d7c6fe] dark:bg-[#8b5cf6]/40" : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"}`}>
                 <IndividualIcon className={selectedType === "INDIVIDUAL" ? "text-[#8b5cf6]" : "text-slate-500 dark:text-slate-400"} />
              </div>
              <div className="flex flex-col gap-5">
                <h3 className="text-[18px] font-bold text-[#262626] dark:text-slate-100">Individual Organiser</h3>
                <div className="text-[16px] text-[#737373] dark:text-slate-400 leading-normal space-y-1">
                  <p>Perfect for freelancers, creators, and solo event hosts managing personal brands.</p>
                  <p>This creates a personal workspace for your events.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Card */}
          <div 
            onClick={() => setSelectedType("ORGANISATION")}
            className={`
              flex-1 relative rounded-[8px] p-6 cursor-pointer transition-all duration-200 flex flex-col justify-center
              ${selectedType === "ORGANISATION" 
                ? "bg-[#e7ddff] dark:bg-[#8b5cf6]/20 ring-1 ring-[#8b5cf6]" 
                : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#8b5cf6]/50"}
            `}
          >
             <div className="flex flex-col gap-6">
              <div className={`p-2.5 rounded-[8px] w-fit ${selectedType === "ORGANISATION" ? "bg-[#d7c6fe] dark:bg-[#8b5cf6]/40" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"}`}>
                 <OrganizationIcon className={selectedType === "ORGANISATION" ? "text-[#8b5cf6]" : "text-[#525252] dark:text-slate-400"} />
              </div>
              <div className="flex flex-col gap-5">
                <h3 className="text-[18px] font-bold text-[#262626] dark:text-slate-100">Organisation/ Agency</h3>
                <p className="text-[16px] text-[#737373] dark:text-slate-400 leading-normal">
                  Best for agencies, companies, and teams needing multi-user access and advanced tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={async () => {
            setIsLoading(true);
            const tenantType: TenantType = selectedType;
            sessionStorage.setItem("munar_onboarding_tenant_type", tenantType);
            setIsLoading(false);
            onNavigate("profile-setup");
          }}
          disabled={isLoading}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-4 rounded-[12px]"
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </ProfileSetupLayout>
  );
};
