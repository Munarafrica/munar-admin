import React, { useState } from "react";
import { CardLayout } from "../components/auth/CardLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/AuthButton";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";

export const ChangePassword = () => {
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to change password");
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

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Password Changed!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your password has been updated successfully.
          </p>

          <Button onClick={() => navigate("/events")} className="bg-[#6342e9] w-full">
            Back to Dashboard
          </Button>
        </div>
      </CardLayout>
    );
  }

  return (
    <CardLayout>
      <div className="w-full text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Change Password</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8">
          Update your account password.
        </p>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="Current Password"
            placeholder="Enter current password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1 text-left">
            <Input
              label="New Password"
              placeholder="Create a new password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Must be at least 8 characters</p>
          </div>

          <Input
            label="Confirm New Password"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-3 mt-2">
            <Button type="submit" disabled={isLoading} className="bg-[#6342e9]">
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[13px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </CardLayout>
  );
};
