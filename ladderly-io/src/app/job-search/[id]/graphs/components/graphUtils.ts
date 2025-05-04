/**
 * Shared utility functions and types for job search graph components
 */

import type { JobPostForCandidate } from '@prisma/client'

/**
 * Gets a valid application date from a job post, handling possible undefined values
 */
export function getApplicationDate(post: JobPostForCandidate): Date {
  if (post.initialApplicationDate) {
    return new Date(post.initialApplicationDate)
  } else if (post.createdAt) {
    return new Date(post.createdAt)
  }
  // Fallback to current date if no date is available
  return new Date()
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
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
}
