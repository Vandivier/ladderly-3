import Link from "next/link";
import { Suspense } from "react";
import { api } from "~/trpc/server";
import { LargeCard } from "~/app/core/components/LargeCard";
import { LadderlyPageWrapper } from "~/app/core/components/page-wrapper/LadderlyPageWrapper";
import { SettingsFormWrapper } from "./components/SettingsFormWrapper";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  try {
    const settings = await api.user.getSettings();

    return (
      <LadderlyPageWrapper>
        <div className="flex items-center justify-center">
          <LargeCard>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit User Settings
            </h1>
            <p className="mt-4">
              Please email john@ladderly.io to update your subscription tier.
            </p>

            <Link
              className="mt-4 block text-ladderly-violet-700 underline"
              href={`/blog/2024-02-16-user-settings` as any}
            >
              Learn More About User Settings
            </Link>

            <Suspense fallback={<div>Loading form...</div>}>
              <SettingsFormWrapper initialSettings={settings} />
            </Suspense>
          </LargeCard>
        </div>
      </LadderlyPageWrapper>
    );
  } catch (error) {
    redirect("/");
  }
}
