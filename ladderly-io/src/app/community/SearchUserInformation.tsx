import { Info, X } from 'lucide-react'
import { useState } from 'react'

export const SearchUserInformation = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="mb-4 flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
      <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <p className="flex-1">
        Search results may match based on profile data outside of the preview
        card. For example, these cards show the top three skills, but other
        skills may result in a match for the search. Click the member name to
        see their full profile.
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="mt-0.5 rounded-full p-0.5 hover:bg-blue-100"
        aria-label="Close search information"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
