import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LabeledDateField } from '~/app/core/components/LabeledDateField'

// Mock react-final-form
const mockUseField = vi.fn()
vi.mock('react-final-form', () => ({
  useField: (...args: unknown[]) => mockUseField(...args),
}))

describe('LabeledDateField', () => {
  const defaultFieldReturn = {
    input: {
      name: 'testDate',
      value: null as string | null,
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

  it('renders with label and date input', () => {
    render(<LabeledDateField name="testDate" label="Date Label" />)

    expect(screen.getByLabelText('Date Label')).toBeInTheDocument()
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  it('renders date input with correct type', () => {
    render(<LabeledDateField name="testDate" label="Date Label" />)

    const input = screen.getByLabelText('Date Label')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('displays error when touched and error exists', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      meta: {
        ...defaultFieldReturn.meta,
        touched: true,
        error: 'Invalid date',
      },
    })

    render(<LabeledDateField name="testDate" label="Date Label" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
  })

  it('disables input when submitting', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      meta: {
        ...defaultFieldReturn.meta,
        submitting: true,
      },
    })

    render(<LabeledDateField name="testDate" label="Date Label" />)

    expect(screen.getByLabelText('Date Label')).toBeDisabled()
  })

  it('calls useField with parse and format functions', () => {
    render(<LabeledDateField name="testDate" label="Date Label" />)

    expect(mockUseField).toHaveBeenCalledWith(
      'testDate',
      expect.objectContaining({
        parse: expect.any(Function),
        format: expect.any(Function),
      }),
    )
  })

  it('parses empty string to null', () => {
    let parseFn: ((val: string) => string | null) | undefined

    mockUseField.mockImplementation((name, config) => {
      parseFn = config.parse
      return defaultFieldReturn
    })

    render(<LabeledDateField name="testDate" label="Date Label" />)

    expect(parseFn?.('')).toBeNull()
    expect(parseFn?.('2024-01-01')).toBe('2024-01-01')
  })

  it('formats null to empty string', () => {
    let formatFn: ((val: string | null) => string) | undefined

    mockUseField.mockImplementation((name, config) => {
      formatFn = config.format
      return defaultFieldReturn
    })

    render(<LabeledDateField name="testDate" label="Date Label" />)

    expect(formatFn?.(null)).toBe('')
    expect(formatFn?.('2024-01-01')).toBe('2024-01-01')
  })

  it('handles date value correctly', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      input: {
        ...defaultFieldReturn.input,
        value: '2024-01-01',
      },
    })

    render(<LabeledDateField name="testDate" label="Date Label" />)

    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument()
  })
})
