import React from 'react'
import { Form, FormProps } from 'src/core/components/Form'
import LabeledCheckboxField from 'src/core/components/LabeledCheckboxField'
import LabeledTextField from 'src/core/components/LabeledTextField'
import { z } from 'zod'
import { CountryDropdown } from './CountryDropdown'
import { USStateDropdown } from './USStateDropdown'

export { FORM_ERROR } from 'src/core/components/Form'

export function SettingForm<S extends z.ZodType<any, any>>(
  props: FormProps<S>
) {
  return (
    <Form<S> {...props}>
      <section>
        <h3 className="mt-8 text-xl">Authentication Data</h3>
        <LabeledTextField
          name="email"
          label="Primary Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Primary Email"
        />
        <LabeledTextField
          name="emailBackup"
          label="Backup Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Backup Email"
        />
        <LabeledTextField
          name="emailStripe"
          label="Stripe Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Stripe Email"
        />
      </section>

      <section>
        <h3 className="mt-8 text-xl">Public Profile</h3>
        <LabeledTextField
          name="nameFirst"
          label="First Name"
          outerProps={{ className: 'mt-2' }}
          placeholder="First Name"
        />
        <LabeledTextField
          name="nameLast"
          label="Last Name"
          outerProps={{ className: 'mt-2' }}
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
          outerProps={{ className: 'mt-2' }}
          placeholder="Profile Blurb"
        />
        <LabeledTextField
          name="profileContactEmail"
          label="Public Contact Email"
          outerProps={{ className: 'mt-2' }}
          placeholder="Public Contact Email"
        />
        <LabeledTextField
          name="profileGitHubUri"
          label="GitHub URL"
          outerProps={{ className: 'mt-2' }}
          placeholder="GitHub URL"
        />
        <LabeledTextField
          name="profileHomepageUri"
          label="Homepage URL"
          outerProps={{ className: 'mt-2' }}
          placeholder="Homepage URL"
        />
        <LabeledTextField
          name="profileLinkedInUri"
          label="LinkedIn URL"
          outerProps={{ className: 'mt-2' }}
          placeholder="LinkedIn URL"
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
    </Form>
  )
}
