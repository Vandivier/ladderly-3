import React, { type PropsWithoutRef } from 'react'
import { Field } from 'react-final-form'
import Select, { components } from 'react-select'

interface LabeledAutocompleteFieldProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>
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
            classNamePrefix="react-select"
            options={options}
            value={
              options.find((option) => option.value === input.value) || null
            }
            onChange={(option) => input.onChange(option?.value ?? '')}
            placeholder={`Select ${label}`}
            isClearable={false}
            isSearchable={true}
            components={{
              Input: (props) => (
                <components.Input
                  {...props}
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck="false"
                  aria-autocomplete="none"
                  data-lpignore="true"
                  data-form-type="other"
                />
              ),
            }}
            styles={{
              control: (base) => ({
                ...base,
                borderColor: 'purple',
                borderRadius: '4px',
                minHeight: '38px',
                boxShadow: 'none',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'purple',
                },
              }),
            }}
          />
        )}
      </Field>
    </div>
  )
}

export default LabeledAutocompleteField
