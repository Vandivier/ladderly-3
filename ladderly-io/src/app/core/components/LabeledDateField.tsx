'use client'

import React from 'react'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type PropsWithoutRef,
} from 'react'
import { useField, type UseFieldConfig } from 'react-final-form'

export interface LabeledDateFieldProps
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements['input']>, 'type'> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>
  labelProps?: ComponentPropsWithoutRef<'label'>
  fieldProps?: UseFieldConfig<string | null>
}

export const LabeledDateField = forwardRef<
  HTMLInputElement,
  LabeledDateFieldProps
>(({ name, label, outerProps, fieldProps = {}, labelProps, ...props }, ref) => {
  const {
    input,
    meta: { touched, error, submitError, submitting },
  } = useField(String(name), {
    parse: (val) => (val === '' ? null : String(val)),
    format: (val) => (val ? String(val) : ''),
    ...fieldProps,
  })

  const normalizedError = Array.isArray(error)
    ? error.join(', ')
    : (error ?? submitError)

  return (
    <div {...outerProps}>
      <label {...labelProps}>
        {label}
        <input
          {...input}
          value={input.value!}
          type="date"
          disabled={submitting}
          {...props}
          ref={ref}
        />
      </label>

      {touched && normalizedError && (
        <div role="alert" style={{ color: 'red' }}>
          {normalizedError}
        </div>
      )}

      <style jsx>{`
        label {
          display: flex;
          flex-direction: column;
          align-items: start;
          font-size: 1rem;
        }
        input {
          font-size: 1rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid purple;
          appearance: none;
          margin-top: 4px;
        }
      `}</style>
    </div>
  )
})

LabeledDateField.displayName = 'LabeledDateField'
export default LabeledDateField
