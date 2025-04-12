export const JobSearchActiveSpan = ({ isActive }: { isActive: boolean }) => (
  <span className={`font-bold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
)
