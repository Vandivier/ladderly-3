import React from "react"
import { Field } from "react-final-form"
import Select from "react-select"

interface LabeledAutocompleteFieldProps {
  label: string
  name: string
  options: { value: string; label: string }[]
}

const LabeledAutocompleteField: React.FC<LabeledAutocompleteFieldProps> = ({
  label,
  name,
  options,
}) => {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <Field name={name}>
        {({ input }) => (
          <Select
            {...input}
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
