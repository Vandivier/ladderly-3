interface JobSearchActiveSpanProps {
  isActive: boolean
}

export const JobSearchActiveSpan = ({ isActive }: JobSearchActiveSpanProps) => {
  return (
    <span
      className={`font-medium ${isActive ? 'text-green-500' : 'text-red-500'}`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
