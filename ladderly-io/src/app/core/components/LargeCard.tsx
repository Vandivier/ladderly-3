// It's large bc only one intended per row
export const LargeCard = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
    <div className="m-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
      {children}
    </div>
  </div>
)
