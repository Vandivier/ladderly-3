'use client'

import React from 'react'
import { UpdateSettingsFormSchema } from 'src/app/settings/schemas'
import type { z } from 'zod'
import { Form, type FormProps } from '~/app/core/components/Form'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledChipCollection from '~/app/core/components/LabeledChipCollection'
import { CountryDropdown } from './CountryDropdown'
import { USStateDropdown } from './USStateDropdown'

export { FORM_ERROR } from '~/app/core/components/Form'

type SettingsFormProps = {
  initialValues: z.infer<typeof UpdateSettingsFormSchema>
  onSubmit: FormProps<typeof UpdateSettingsFormSchema>['onSubmit']
}

export function SettingsForm({ initialValues, onSubmit }: SettingsFormProps) {
  return (
    <Form
      schema={UpdateSettingsFormSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      <section>
        <h3 className="mt-8 text-xl">Authentication Data</h3>
        <LabeledTextField
          name="email"
          label="Primary Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Primary Email"
          type="email"
        />
        <LabeledTextField
          name="emailBackup"
          label="Backup Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Backup Email"
          type="email"
        />
        <LabeledTextField
          name="emailStripe"
          label="Stripe Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Stripe Email"
          type="email"
        />
      </section>
      <section>
        <h3 className="mt-8 text-xl">Public Profile</h3>
        <LabeledTextField
          name="nameFirst"
          label="First Name"
          outerProps={{ className: 'mt-2' }}
          placeholder="First Name"
          type="text"
        />
        <LabeledTextField
          name="nameLast"
          label="Last Name"
          outerProps={{ className: 'mt-2' }}
          placeholder="Last Name"
          type="text"
        />

        <LabeledCheckboxField name="hasOpenToWork" label="Open To Work" />
        <LabeledCheckboxField
          label="Enable Shout Outs"
          name="hasShoutOutsEnabled"
        />

        <LabeledTextField
          name="profileBlurb"
          label="Profile Blurb"
          outerProps={{ className: 'mt-2' }}
          placeholder="Profile Blurb"
          type="text"
        />
        <LabeledTextField
          name="profileContactEmail"
          label="Public Contact Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Public Contact Email"
          type="email"
        />
        <LabeledTextField
          name="profileGitHubUri"
          label="GitHub URL"
          outerProps={{ className: 'mt-2' }}
          placeholder="GitHub URL"
          type="text"
        />
        <LabeledTextField
          name="profileHomepageUri"
          label="Homepage URL"
          outerProps={{ className: 'mt-2' }}
          placeholder="Homepage URL"
          type="text"
        />
        <LabeledTextField
          name="profileLinkedInUri"
          label="LinkedIn URL"
          outerProps={{ className: 'mt-2' }}
          placeholder="LinkedIn URL"
          type="text"
        />

        <LabeledTextField
          name="profileYearsOfExperience"
          label="Years of Experience"
          outerProps={{ className: 'mt-2' }}
          placeholder="Years of Experience"
          type="number"
        />

        <LabeledChipCollection
          name="profileTopNetworkingReasons"
          label="Top Networking Reasons"
          outerProps={{ className: 'mt-2' }}
        />

        <LabeledChipCollection
          name="profileTopServices"
          label="Top Services"
          outerProps={{ className: 'mt-2' }}
        />

        <LabeledChipCollection
          name="profileTopSkills"
          label="Top Skills"
          outerProps={{ className: 'mt-2' }}
        />

        <CountryDropdown outerProps={{ className: 'mt-2 items-baseline' }} />
        <USStateDropdown outerProps={{ className: 'mt-2 items-baseline' }} />
      </section>
      <section>
        <h3 className="mt-8 text-xl">Features and Interests</h3>
        <LabeledCheckboxField
          label="Enable Public Profile"
          name="hasPublicProfileEnabled"
          outerProps={{ className: 'mt-2 items-baseline' }}
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
  )
}
