// app/settings/SettingsForm.tsx

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { SettingsForm } from "./SettingsForm";

// Define the settings type based on the schema
type UserSettings = {
  id: number;
  email: string;
  emailBackup: string;
  emailStripe: string;
  nameFirst: string;
  nameLast: string;
  hasOpenToWork: boolean;
  hasShoutOutsEnabled: boolean;
  profileBlurb: string | null;
  profileContactEmail: string | null;
  profileGitHubUri: string | null;
  profileHomepageUri: string | null;
  profileLinkedInUri: string | null;
  residenceCountry: string;
  residenceUSState: string;
  hasPublicProfileEnabled: boolean;
  hasSmallGroupInterest: boolean;
  hasLiveStreamInterest: boolean;
  hasOnlineEventInterest: boolean;
  hasInPersonEventInterest: boolean;
  subscription: {
    tier: string;
    type: string;
  };
};

interface SettingsFormWrapperProps {
  initialSettings: UserSettings;
}

export function SettingsFormWrapper({
  initialSettings,
}: SettingsFormWrapperProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const { mutate: updateSettings } = api.user.updateSettings.useMutation({
    onSuccess: (updatedSettings) => {
      setSettings((prev: UserSettings) => ({ ...prev, ...updatedSettings }));
      alert("Updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
      alert("Update failed: " + error.message);
    },
  });

  const handleSubmit = async (values: UserSettings) => {
    updateSettings(values);
  };

  return <SettingsForm initialValues={settings} onSubmit={handleSubmit} />;
}
