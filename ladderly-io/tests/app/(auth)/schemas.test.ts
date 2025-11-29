import { describe, expect, it } from 'vitest'
import { password, PASSWORD_REQUIREMENTS } from '~/app/(auth)/schemas'

describe('password schema', () => {
  describe('validation', () => {
    it('accepts a valid complex password', () => {
      const validPassword = 'MySecure1!Pass'
      const result = password.safeParse(validPassword)
      expect(result.success).toBe(true)
    })

    it('rejects password shorter than 10 characters', () => {
      const shortPassword = 'Short1!A'
      const result = password.safeParse(shortPassword)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 10')
      }
    })

    it('rejects password without uppercase letter', () => {
      const noUppercase = 'mysecure123!'
      const result = password.safeParse(noUppercase)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('uppercase')
      }
    })

    it('rejects password without lowercase letter', () => {
      const noLowercase = 'MYSECURE123!'
      const result = password.safeParse(noLowercase)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('lowercase')
      }
    })

    it('rejects password without number', () => {
      const noNumber = 'MySecurePass!'
      const result = password.safeParse(noNumber)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('number')
      }
    })

    it('rejects password without special character', () => {
      const noSpecial = 'MySecure1234'
      const result = password.safeParse(noSpecial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('special character')
      }
    })

    it('trims whitespace from password', () => {
      const paddedPassword = '  MySecure1!Pass  '
      const result = password.safeParse(paddedPassword)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('MySecure1!Pass')
      }
    })
  })

  describe('PASSWORD_REQUIREMENTS', () => {
    it('contains all required password rules', () => {
      expect(PASSWORD_REQUIREMENTS).toContain('At least 10 characters')
      expect(PASSWORD_REQUIREMENTS).toContain(
        'At least one uppercase letter (A-Z)',
      )
      expect(PASSWORD_REQUIREMENTS).toContain(
        'At least one lowercase letter (a-z)',
      )
      expect(PASSWORD_REQUIREMENTS).toContain('At least one number (0-9)')
      expect(PASSWORD_REQUIREMENTS).toContain(
        'At least one special character (!@#$%^&*...)',
      )
    })

    it('has exactly 5 requirements', () => {
      expect(PASSWORD_REQUIREMENTS).toHaveLength(5)
    })
  })
})
