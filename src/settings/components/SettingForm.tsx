import { Routes } from "@blitzjs/next"
import Link from "next/link"
import React from "react"
import { Form, FormProps } from "src/core/components/Form"
import LabeledCheckboxField from "src/core/components/LabeledCheckboxField"
import LabeledTextField from "src/core/components/LabeledTextField"
import { z } from "zod"
import { CountryDropdown } from "./CountryDropdown"
import { USStateDropdown } from "./USStateDropdown"

export { FORM_ERROR } from "src/core/components/Form"

export function SettingForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      {/* TODO: make this link visually pop */}
      <Link href={Routes.BlogPost({ slug: "2024-02-16-user-settings" })}>
        Learn More About User Setting Fields
      </Link>
      <LabeledTextField name="nameFirst" label="First Name" placeholder="First Name" />
      <LabeledTextField name="nameLast" label="Last Name" placeholder="Last Name" />
      <LabeledTextField name="email" label="Email" placeholder="Email" />
      <LabeledTextField name="emailBackup" label="Backup Email" placeholder="Backup Email" />
      <LabeledTextField name="emailStripe" label="Stripe Email" placeholder="Stripe Email" />
      <LabeledTextField name="profileBlurb" label="Profile Blurb" placeholder="Profile Blurb" />
      <LabeledTextField
        name="profileContactEmail"
        label="Contact Email"
        placeholder="Contact Email"
      />
      <LabeledTextField name="profileGitHubUri" label="GitHub URL" placeholder="GitHub URL" />
      <LabeledTextField name="profileHomepageUri" label="Homepage URL" placeholder="Homepage URL" />
      <LabeledTextField name="profileLinkedInUri" label="LinkedIn URL" placeholder="LinkedIn URL" />

      <CountryDropdown />
      <USStateDropdown />

      <LabeledCheckboxField
        outerProps={{ className: "mt-2" }}
        name="hasPublicProfileEnabled"
        label="Enable Public Profile"
      />
      <LabeledCheckboxField name="hasShoutOutsEnabled" label="Enable Shout Outs" />
      <LabeledCheckboxField name="hasOpenToWork" label="Open To Work" />
      <LabeledCheckboxField
        name="hasSmallGroupInterest"
        label="Interested in a Guided Small Group"
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
    </Form>
  )
}
