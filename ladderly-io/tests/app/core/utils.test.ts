import { describe, expect, it } from 'vitest'
import { getUserDisplayName, type UserLike } from '~/app/core/utils'

describe('getUserDisplayName', () => {
  it('returns first and last name when both are provided', () => {
    const user: UserLike = {
      id: 1,
      nameFirst: 'John',
      nameLast: 'Doe',
    }

    expect(getUserDisplayName(user)).toBe('John Doe')
  })

  it('returns only first name when last name is null', () => {
    const user: UserLike = {
      id: 1,
      nameFirst: 'John',
      nameLast: null,
    }

    expect(getUserDisplayName(user)).toBe('John')
  })

  it('returns only last name when first name is null', () => {
    const user: UserLike = {
      id: 1,
      nameFirst: null,
      nameLast: 'Doe',
    }

    expect(getUserDisplayName(user)).toBe('Doe')
  })

  it('returns "User {id}" when both names are null', () => {
    const user: UserLike = {
      id: 123,
      nameFirst: null,
      nameLast: null,
    }

    expect(getUserDisplayName(user)).toBe('User 123')
  })

  it('returns only first name when last name is empty string', () => {
    const user: UserLike = {
      id: 1,
      nameFirst: 'John',
      nameLast: '',
    }

    // Empty string is falsy, so it won't be concatenated
    expect(getUserDisplayName(user)).toBe('John')
  })

  it('handles user with id 0', () => {
    const user: UserLike = {
      id: 0,
      nameFirst: null,
      nameLast: null,
    }

    expect(getUserDisplayName(user)).toBe('User 0')
  })

  it('handles names with special characters', () => {
    const user: UserLike = {
      id: 1,
      nameFirst: "O'Brien",
      nameLast: 'Smith-Jones',
    }

    expect(getUserDisplayName(user)).toBe("O'Brien Smith-Jones")
  })

  it('handles names with extra whitespace', () => {
    const user: UserLike = {
      id: 1,
      nameFirst: '  John  ',
      nameLast: '  Doe  ',
    }

    // Function adds a space between first and last name: '  John  ' + '  Doe  ' = '  John     Doe  '
    expect(getUserDisplayName(user)).toBe('  John     Doe  ')
  })
})
