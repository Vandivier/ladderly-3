import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LabeledTextField } from '~/app/core/components/LabeledTextField'

// Mock react-final-form
const mockUseField = vi.fn()
vi.mock('react-final-form', () => ({
  useField: (...args: unknown[]) => mockUseField(...args),
}))

describe('LabeledTextField', () => {
  const defaultFieldReturn = {
    input: {
      name: 'testField',
      value: '',
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

  it('renders with label and input', () => {
    render(<LabeledTextField name="testField" label="Test Label" />)

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with custom type', () => {
    render(<LabeledTextField name="email" label="Email" type="email" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
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

    render(<LabeledTextField name="testField" label="Test Label" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('displays submitError when touched and submitError exists', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      meta: {
        ...defaultFieldReturn.meta,
        touched: true,
        submitError: 'Submit error occurred',
      },
    })

    render(<LabeledTextField name="testField" label="Test Label" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Submit error occurred')).toBeInTheDocument()
  })

  it('displays array errors joined with comma', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      meta: {
        ...defaultFieldReturn.meta,
        touched: true,
        error: ['Error 1', 'Error 2'],
      },
    })

    render(<LabeledTextField name="testField" label="Test Label" />)

    expect(screen.getByText('Error 1, Error 2')).toBeInTheDocument()
  })

  it('disables input when submitting', () => {
    mockUseField.mockReturnValue({
      ...defaultFieldReturn,
      meta: {
        ...defaultFieldReturn.meta,
        submitting: true,
      },
    })

    render(<LabeledTextField name="testField" label="Test Label" />)

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('passes through outerProps to div', () => {
    render(
      <LabeledTextField
        name="testField"
        label="Test Label"
        outerProps={{ 'data-testid': 'outer-div' }}
      />,
    )

    expect(screen.getByTestId('outer-div')).toBeInTheDocument()
  })

  it('passes through labelProps to label', () => {
    render(
      <LabeledTextField
        name="testField"
        label="Test Label"
        labelProps={{ 'data-testid': 'custom-label' }}
      />,
    )

    expect(screen.getByTestId('custom-label')).toBeInTheDocument()
  })

  it('calls useField with correct name and parse function', () => {
    render(<LabeledTextField name="testField" label="Test Label" />)

    expect(mockUseField).toHaveBeenCalledWith(
      'testField',
      expect.objectContaining({
        parse: expect.any(Function),
      }),
    )
  })

  it('parses values to string', () => {
    let parseFn: ((val: unknown) => string) | undefined

    mockUseField.mockImplementation((name, config) => {
      parseFn = config.parse
      return defaultFieldReturn
    })

    render(<LabeledTextField name="testField" label="Test Label" />)

    expect(parseFn?.(123)).toBe('123')
    expect(parseFn?.(null)).toBe('null')
  })
})
