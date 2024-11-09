import { Field } from 'react-final-form'

interface LabeledSelectFieldProps {
  name: string
  label: string
  children: React.ReactNode
}

const LabeledSelectField: React.FC<LabeledSelectFieldProps> = ({
  label,
  children,
  ...props
}) => {
  const { name: fieldName, ...otherProps } = props

  return (
    <div>
      <label htmlFor={fieldName}>{label}</label>
      <Field name={fieldName} component="select" {...otherProps}>
        {children}
      </Field>
    </div>
  )
}

export default LabeledSelectField
