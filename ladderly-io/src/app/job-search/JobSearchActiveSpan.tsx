interface JobSearchActiveSpanProps {
  isActive: boolean
}

export const JobSearchActiveSpan = ({ isActive }: JobSearchActiveSpanProps) => {
  return (
    <span
      className={`font-medium ${
        isActive
          ? 'text-green-500 dark:text-green-400'
          : 'text-red-500 dark:text-red-400'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
