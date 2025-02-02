'use client'

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type PropsWithoutRef,
} from 'react'
import { useField, type UseFieldConfig } from 'react-final-form'

export interface LabeledTextFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements['input']> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: 'text' | 'password' | 'email' | 'number'
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>
  labelProps?: ComponentPropsWithoutRef<'label'>
  fieldProps?: UseFieldConfig<string>
}

export const LabeledTextField = forwardRef<
  HTMLInputElement,
  LabeledTextFieldProps
>(({ name, label, outerProps, fieldProps = {}, labelProps, ...props }, ref) => {
  const {
    input,
    meta: { touched, error, submitError, submitting },
  } = useField(String(name), {
    parse: (val) => String(val),
    ...fieldProps,
  })

  const normalizedError = Array.isArray(error)
    ? error.join(', ')
    : error || submitError

  return (
    <div {...outerProps}>
      <label {...labelProps}>
        {label}
        <input {...input} disabled={submitting} {...props} ref={ref} />
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

LabeledTextField.displayName = 'LabeledTextField'
export default LabeledTextField
