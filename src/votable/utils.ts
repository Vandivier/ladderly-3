import { VotableType } from 'db'

export function slugToType(slug: string): string {
  return slug.toUpperCase().replace(/-/g, '_')
}

export function typeToSlug(type: string): string {
  return type.toLowerCase().replace(/_/g, '-')
}

export function isValidVotableType(type: string): boolean {
  return Object.values(VotableType).includes(type as VotableType)
}
