export const SmallCard = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
      {children}
    </div>
  </div>
)
