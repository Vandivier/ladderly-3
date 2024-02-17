import React, { PropsWithoutRef } from "react"
import { Field } from "react-final-form"
import Select from "react-select"

interface LabeledAutocompleteFieldProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
}

const LabeledAutocompleteField: React.FC<LabeledAutocompleteFieldProps> = ({
  label,
  name,
  options,
  outerProps,
}) => {
  return (
    <div {...outerProps}>
      <label htmlFor={name}>{label}</label>
      <Field name={name}>
        {({ input }) => (
          <Select
            {...input}
            className="mt-1"
            options={options}
            onChange={(value) => input.onChange(value)}
            onBlur={() => input.onBlur(input.value)}
            placeholder={`Select ${label}`}
          />
        )}
      </Field>
    </div>
  )
}

export default LabeledAutocompleteField
