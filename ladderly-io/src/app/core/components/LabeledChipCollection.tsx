import React, { useState, useRef, type PropsWithoutRef } from 'react'
import { Field } from 'react-final-form'

interface LabeledChipCollectionProps {
  label: string
  name: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>
}

const LabeledChipCollection: React.FC<LabeledChipCollectionProps> = ({
  label,
  name,
  outerProps,
}) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: { value: string[]; onChange: (value: string[]) => void },
  ) => {
    if (
      (e.key === 'Enter' || e.key === 'Tab') &&
      inputValue.trim() !== '' &&
      !e.shiftKey
    ) {
      e.preventDefault()
      const newValue = [...input.value, inputValue.trim()]
      input.onChange(newValue)
      setInputValue('')
    }
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    input: { value: string[]; onChange: (value: string[]) => void },
  ) => {
    if (inputValue.trim() !== '') {
      const newValue = [...input.value, inputValue.trim()]
      input.onChange(newValue)
      setInputValue('')
    }
  }

  const removeChip = (
    index: number,
    input: { value: string[]; onChange: (value: string[]) => void },
  ) => {
    const newValue = input.value.filter((_, i) => i !== index)
    input.onChange(newValue)
  }

  return (
    <div {...outerProps}>
      <label>
        {label}
        <Field name={name} initialValue={[]}>
          {({ input }) => (
            <div className="mt-1">
              <div className="flex flex-wrap gap-2 rounded-md border border-purple-500 p-2">
                {input.value.map((chip: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1"
                  >
                    <span>{chip}</span>
                    <button
                      type="button"
                      onClick={() => removeChip(index, input)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, input)}
                  onBlur={(e) => handleBlur(e, input)}
                  className="flex-1 border-none outline-none"
                  placeholder="Type and press Enter, Tab, or blur to add"
                />
              </div>
            </div>
          )}
        </Field>
      </label>

      <style jsx>{`
        label {
          display: flex;
          flex-direction: column;
          align-items: start;
          font-size: 1rem;
        }
      `}</style>
    </div>
  )
}

export default LabeledChipCollection
