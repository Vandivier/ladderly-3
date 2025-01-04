import type { ReactNode, PropsWithoutRef } from 'react'
import {
  Form as FinalForm,
  type FormProps as FinalFormProps,
} from 'react-final-form'
import { z } from 'zod'
import { FORM_ERROR } from 'final-form'

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements['form']>, 'onSubmit'> {
  children?: ReactNode
  submitText?: string
  schema?: S
  onSubmit: FinalFormProps<z.infer<S>>['onSubmit']
  initialValues?: FinalFormProps<z.infer<S>>['initialValues']
}

export const validateZodSchema = <T extends z.ZodType<any, any>>(
  schema: T | undefined,
) => {
  return (values: z.infer<T>) => {
    if (!schema) return {}
    try {
      schema.parse(values)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.formErrors.fieldErrors
      }
      return { [FORM_ERROR]: 'Form validation failed' }
    }
  }
}

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  schema,
  initialValues,
  onSubmit,
  ...props
}: FormProps<S>) {
  return (
    <FinalForm
      initialValues={initialValues}
      validate={validateZodSchema(schema)}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, submitError }) => (
        <form onSubmit={handleSubmit} className="form" {...props}>
          {children}

          {submitError && (
            <div role="alert" style={{ color: 'red' }}>
              {submitError}
            </div>
          )}

          {submitText && (
            <button
              className="mt-4 rounded-md border border-ladderly-light-purple-1 bg-ladderly-violet-700 p-2 px-4 text-white"
              disabled={submitting}
              type="submit"
            >
              {submitText}
            </button>
          )}
        </form>
      )}
    />
  )
}

export { FORM_ERROR }
