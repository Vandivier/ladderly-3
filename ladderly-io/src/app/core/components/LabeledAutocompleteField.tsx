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
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('click detected')
    setIsOpen(true)
  }

  const handleTouch = () => {
    console.log('touch detected')
    // Force menu to open in next tick
    setTimeout(() => {
      setIsOpen(true)
    }, 0)
  }

  return (
    <div {...outerProps}>
      <label htmlFor={name}>{label}</label>
      <input
        type="text"
        name={`${name}-autocomplete-killer`}
        style={{ display: 'none' }}
        autoComplete="chrome-off"
      />
      <Field name={name}>
        {({ input }) => (
          <div role="button" tabIndex={0} className="relative mt-1">
            <Select
              {...input}
              menuIsOpen={isOpen}
              onMenuClose={() => setIsOpen(false)}
              classNamePrefix="react-select"
              options={options}
              value={
                options.find((option) => option.value === input.value) || null
              }
              onChange={(option) => {
                input.onChange(option?.value ?? '')
                setIsOpen(false)
              }}
              placeholder={`Select ${label}`}
              isClearable={false}
              isSearchable={true}
              openMenuOnFocus={true}
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
                Control: ({ children, ...props }) => (
                  <components.Control {...props}>
                    <div
                      className="w-full"
                      onClick={handleClick}
                      onTouchStart={handleTouch}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsOpen(true)
                        }
                      }}
                    >
                      {children}
                    </div>
                  </components.Control>
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
                  padding: '0',
                  '&:hover': {
                    borderColor: 'purple',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 10,
                }),
                input: (base) => ({
                  ...base,
                  cursor: 'pointer',
                  padding: '8px',
                }),
                singleValue: (base) => ({
                  ...base,
                  cursor: 'pointer',
                  padding: '8px',
                }),
                placeholder: (base) => ({
                  ...base,
                  cursor: 'pointer',
                  padding: '8px',
                }),
              }}
            />
          </div>
        )}
      </Field>
    </div>
  )
}

export default LabeledAutocompleteField
