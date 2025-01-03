import { ComponentPropsWithoutRef, PropsWithoutRef, forwardRef } from 'react'
import { UseFieldConfig, useField } from 'react-final-form'

export const defaultCheckboxFieldLabelProps = {
  className: 'flex items-baseline my-1',
}

export interface LabeledCheckboxFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements['input']> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>
  labelProps?: ComponentPropsWithoutRef<'label'>
  fieldProps?: UseFieldConfig<boolean>
}

export const LabeledCheckboxField = forwardRef<
  HTMLInputElement,
  LabeledCheckboxFieldProps
>(
  (
    {
      name,
      label,
      outerProps,
      fieldProps,
      labelProps = defaultCheckboxFieldLabelProps,
      ...props
    },
    ref
  ) => {
    const {
      input,
      meta: { touched, error, submitError, submitting },
    } = useField(name, {
      type: 'checkbox',
      ...fieldProps,
    })

    const normalizedError = Array.isArray(error)
      ? error.join(', ')
      : error || submitError

    return (
      <div {...outerProps}>
        <label {...labelProps}>
          <input
            {...input}
            type="checkbox"
            disabled={submitting}
            {...props}
            ref={ref}
          />
          {label}
        </label>

        {touched && normalizedError && (
          <div role="alert" style={{ color: 'red' }}>
            {normalizedError}
          </div>
        )}

        <style jsx>{`
          input {
            margin-right: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
)

LabeledCheckboxField.displayName = 'LabeledCheckboxField'
export default LabeledCheckboxField
