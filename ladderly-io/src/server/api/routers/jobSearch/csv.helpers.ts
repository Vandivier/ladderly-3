import { JobApplicationStatus } from '@prisma/client'

// Helper function to safely map CSV status strings to the enum
// Allows for flexibility in CSV values (e.g., case-insensitivity, synonyms)
export function mapCsvStatusToEnum(
  statusString: string | null | undefined,
): JobApplicationStatus | undefined {
  if (!statusString) return undefined
  const upperCaseStatus = statusString.toUpperCase().trim()

  // Direct mapping first
  if (upperCaseStatus in JobApplicationStatus) {
    return JobApplicationStatus[
      upperCaseStatus as keyof typeof JobApplicationStatus
    ]
  }

  // Handle potential variations or synonyms if needed
  switch (upperCaseStatus) {
    case 'IN OUTREACH': // Example synonym
      return JobApplicationStatus.IN_OUTREACH
    // Add more cases if your CSV uses different terms
    default:
      console.warn(`Unrecognized job status in CSV: "${statusString}"`)
      return undefined // Or return a default like APPLIED if preferred
  }
}
