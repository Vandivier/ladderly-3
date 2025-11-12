import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LabeledCheckboxField } from '~/app/core/components/LabeledCheckboxField'

// Mock react-final-form
const mockUseField = vi.fn()
vi.mock('react-final-form', () => ({
  useField: (...args: unknown[]) => mockUseField(...args),
}))

describe('LabeledCheckboxField', () => {
  const defaultFieldReturn = {
    input: {
      name: 'testCheckbox',
      value: false,
      checked: false,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      onFocus: vi.fn(),
    },
    meta: {
      touched: false,
      error: undefined,
      submitError: undefined,
      submitting: false,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseField.mockReturnValue(defaultFieldReturn)
  })

  it('renders with label and checkbox', () => {
    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    expect(screen.getByLabelText('Checkbox Label')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders checkbox with correct type', () => {
    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('type', 'checkbox')
  })

  it('displays error when touched and error exists', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      meta: {
        ...defaultFieldReturn.meta,
        touched: true,
        error: 'This field is required',
      },
    })

    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('disables checkbox when submitting', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      meta: {
        ...defaultFieldReturn.meta,
        submitting: true,
      },
    })

    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('uses default label props when not provided', () => {
    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    const label = screen.getByText('Checkbox Label').closest('label')
    expect(label).toHaveClass('flex', 'items-baseline', 'my-1')
  })

  it('allows custom label props', () => {
    render(
      <LabeledCheckboxField
        name="testCheckbox"
        label="Checkbox Label"
        labelProps={{ 'data-testid': 'custom-label' }}
      />,
    )

    expect(screen.getByTestId('custom-label')).toBeInTheDocument()
  })

  it('passes through outerProps to div', () => {
    render(
      <LabeledCheckboxField
        name="testCheckbox"
        label="Checkbox Label"
        outerProps={{ 'data-testid': 'outer-div' }}
      />,
    )

    expect(screen.getByTestId('outer-div')).toBeInTheDocument()
  })

  it('calls useField with checkbox type', () => {
    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    expect(mockUseField).toHaveBeenCalledWith(
      'testCheckbox',
      expect.objectContaining({
        type: 'checkbox',
      }),
    )
  })

  it('renders checkbox before label text', () => {
    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    const label = screen.getByText('Checkbox Label').closest('label')
    const checkbox = screen.getByRole('checkbox')
    expect(label?.firstChild).toBe(checkbox)
  })

  it('handles checked state', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      input: {
        ...defaultFieldReturn.input,
        checked: true,
        value: true,
      },
    })

    render(<LabeledCheckboxField name="testCheckbox" label="Checkbox Label" />)

    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
