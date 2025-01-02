"use client";

import React from "react";
import { UpdateSettingsSchema } from "src/app/settings/schemas";
import type { z } from "zod";
import { Form, type FormProps } from "~/app/core/components/Form";
import LabeledCheckboxField from "~/app/core/components/LabeledCheckboxField";
import LabeledTextField from "~/app/core/components/LabeledTextField";
import { CountryDropdown } from "./CountryDropdown";
import { USStateDropdown } from "./USStateDropdown";

export { FORM_ERROR } from "~/app/core/components/Form";

type SettingsFormProps = {
  initialValues: z.infer<typeof UpdateSettingsSchema>;
  onSubmit: FormProps<typeof UpdateSettingsSchema>["onSubmit"];
};

export function SettingsForm({ initialValues, onSubmit }: SettingsFormProps) {
  return (
    <Form
      schema={UpdateSettingsSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      <section>
        <h3 className="mt-8 text-xl">Authentication Data</h3>
        <LabeledTextField
          name="email"
          label="Primary Email"
          outerProps={{ className: "mt-2" }}
          placeholder="Primary Email"
        />
        <LabeledTextField
          name="emailBackup"
          label="Backup Email"
          outerProps={{ className: "mt-2" }}
          placeholder="Backup Email"
        />
        <LabeledTextField
          name="emailStripe"
          label="Stripe Email"
          outerProps={{ className: "mt-2" }}
          placeholder="Stripe Email"
        />
      </section>
      <section>
        <h3 className="mt-8 text-xl">Public Profile</h3>
        <LabeledTextField
          name="nameFirst"
          label="First Name"
          outerProps={{ className: "mt-2" }}
          placeholder="First Name"
        />
        <LabeledTextField
          name="nameLast"
          label="Last Name"
          outerProps={{ className: "mt-2" }}
          placeholder="Last Name"
        />

        <LabeledCheckboxField name="hasOpenToWork" label="Open To Work" />
        <LabeledCheckboxField
          label="Enable Shout Outs"
          name="hasShoutOutsEnabled"
        />

        <LabeledTextField
          name="profileBlurb"
          label="Profile Blurb"
          outerProps={{ className: "mt-2" }}
          placeholder="Profile Blurb"
        />
        <LabeledTextField
          name="profileContactEmail"
          label="Public Contact Email"
          outerProps={{ className: "mt-2" }}
          placeholder="Public Contact Email"
        />
        <LabeledTextField
          name="profileGitHubUri"
          label="GitHub URL"
          outerProps={{ className: "mt-2" }}
          placeholder="GitHub URL"
        />
        <LabeledTextField
          name="profileHomepageUri"
          label="Homepage URL"
          outerProps={{ className: "mt-2" }}
          placeholder="Homepage URL"
        />
        <LabeledTextField
          name="profileLinkedInUri"
          label="LinkedIn URL"
          outerProps={{ className: "mt-2" }}
          placeholder="LinkedIn URL"
        />

        <CountryDropdown outerProps={{ className: "mt-2 items-baseline" }} />
        <USStateDropdown outerProps={{ className: "mt-2 items-baseline" }} />
      </section>
      <section>
        <h3 className="mt-8 text-xl">Features and Interests</h3>
        <LabeledCheckboxField
          label="Enable Public Profile"
          name="hasPublicProfileEnabled"
          outerProps={{ className: "mt-2 items-baseline" }}
        />
        <LabeledCheckboxField
          name="hasSmallGroupInterest"
          label="Interested in an Expert-Led Small Group"
        />
        <LabeledCheckboxField
          name="hasLiveStreamInterest"
          label="Interested in Joining a Live Stream"
        />
        <LabeledCheckboxField
          name="hasOnlineEventInterest"
          label="Interested in Online Hackathons and Events"
        />
        <LabeledCheckboxField
          name="hasInPersonEventInterest"
          label="Interested in In-Person Hackathons and Events"
        />
      </section>

      <button
        type="submit"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Submit
      </button>
    </Form>
  );
}
