/**
 * Shared utility functions and types for job search graph components
 */

import type { JobPostForCandidate } from '@prisma/client'

/**
 * Gets a valid application date from a job post, handling possible undefined values
 */
export function getApplicationDate(post: JobPostForCandidate): Date | null {
  try {
    // First try initialApplicationDate
    if (post.initialApplicationDate) {
      return new Date(post.initialApplicationDate)
    }
    // Then try lastActionDate
    else if (post.lastActionDate) {
      return new Date(post.lastActionDate)
    }
    // Then fallback to createdAt which should always exist
    else if (post.createdAt) {
      return new Date(post.createdAt)
    }

    console.log(
      'Warning: No valid date found for job post:',
      post.id,
      post.company,
    )
    return null
  } catch (error) {
    console.error('Error parsing date:', error, 'for post:', post.id)
    return null
  }
}

/**
 * Gets the start of the week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay() // 0 = Sunday, 1 = Monday, etc.
  result.setDate(result.getDate() - day) // Set to Sunday
  result.setHours(0, 0, 0, 0) // Start of day
  return result
}

/**
 * Formats a date string or Date object for display in graphs
 */
export function formatDateLabel(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Formats a number as a percentage
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Safely gets a Map value with string key, handling undefined
 */
export function safeMapGet<T>(
  map: Map<string, T>,
  key: string | undefined,
  defaultValue?: T,
): T | undefined {
  if (!key) return defaultValue
  return map.get(key) ?? defaultValue
}

/**
 * Safely sets a Map value with string key
 */
export function safeMapSet<T>(
  map: Map<string, T>,
  key: string | undefined,
  value: T,
): void {
  if (key) {
    map.set(key, value)
  }
}

/**
 * Type for weekly application data
 */
export type WeeklyApplicationData = {
  weekStart: string
  count: number
}

/**
 * Type for resume version effectiveness data
 */
export type ResumeVersionData = {
  version: string
  applications: number
  interviews: number
  offers: number
  rejections: number
  ratio: number
  formattedRatio?: string
  countDisplay?: string
}
