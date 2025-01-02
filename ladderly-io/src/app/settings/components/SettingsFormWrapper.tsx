// app/settings/SettingsForm.tsx

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { SettingsForm } from "./SettingsForm";
import { PaymentTierEnum } from "@prisma/client";
import { type z } from "zod";
import { UpdateSettingsSchema } from "src/app/settings/schemas";

// Base form values from schema
type FormValues = z.infer<typeof UpdateSettingsSchema>;

// Settings type that matches the API response
export type UserSettings = FormValues & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  adminNotes: string;
  emailVerified: Date | null;
  hashedPassword: string | null;
  uuid: string;
  subscription: {
    type: string;
    tier: PaymentTierEnum;
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
      setSettings((prev) => ({ ...prev, ...updatedSettings } as UserSettings));
      alert("Updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
      alert("Update failed: " + error.message);
    },
  });

  const handleSubmit = async (values: FormValues) => {
    const sanitizedValues = {
      ...values,
      emailBackup: values.emailBackup ?? null,
      emailStripe: values.emailStripe ?? null,
      nameFirst: values.nameFirst ?? null,
      nameLast: values.nameLast ?? null,
      profileBlurb: values.profileBlurb ?? null,
      profileContactEmail: values.profileContactEmail ?? null,
      profileGitHubUri: values.profileGitHubUri ?? null,
      profileHomepageUri: values.profileHomepageUri ?? null,
      profileLinkedInUri: values.profileLinkedInUri ?? null,
    };

    updateSettings(sanitizedValues);
  };

  return <SettingsForm 
    initialValues={settings as unknown as FormValues} 
    onSubmit={handleSubmit} 
  />;
}
