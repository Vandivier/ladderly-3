import React from "react"
import { Form, FormProps } from "src/core/components/Form"
import LabeledTextField from "src/core/components/LabeledTextField"
import { z } from "zod"

export { FORM_ERROR } from "src/core/components/Form"

export function SettingForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="nameFirst" label="First Name" placeholder="First Name" />
      <LabeledTextField name="nameLast" label="Last Name" placeholder="Last Name" />
      <LabeledTextField name="email" label="Email" placeholder="Email" />
      <LabeledTextField name="emailBackup" label="Backup Email" placeholder="Backup Email" />
      <LabeledTextField name="emailStripe" label="Stripe Email" placeholder="Stripe Email" />
    </Form>
  )
}
