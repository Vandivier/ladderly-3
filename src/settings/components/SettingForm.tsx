import React from "react"
import { Form, FormProps } from "src/core/components/Form"
import LabeledSelectField from "src/core/components/LabeledSelectField"

import { z } from "zod"
import { tierValidator } from "../mutations/updateSettingMutation"
import { PaymentTierEnum } from "@prisma/client"
export { FORM_ERROR } from "src/core/components/Form"

export const SettingFormSchema = z.object({
  tier: tierValidator,
})

export function SettingForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledSelectField name="tier" label="Subscription Tier">
        <option value={PaymentTierEnum.FREE}>Free</option>
        <option value={PaymentTierEnum.PAY_WHAT_YOU_CAN}>Pay What You Can</option>
        <option value={PaymentTierEnum.PREMIUM}>Premium</option>
      </LabeledSelectField>
    </Form>
  )
}
