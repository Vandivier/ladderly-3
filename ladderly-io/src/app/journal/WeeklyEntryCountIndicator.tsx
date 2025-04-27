export const WeeklyEntryCountIndicator = ({
  isWeeklyLoadingData,
  weeklyEntryCount,
  weeklyLimit,
}: {
  isWeeklyLoadingData: boolean
  weeklyEntryCount: number
  weeklyLimit: number
}) => (
  <>
    <div className="text-sm text-gray-500 dark:text-gray-400">
      Weekly entries:{' '}
      {isWeeklyLoadingData
        ? 'Loading...'
        : `${weeklyEntryCount} / ${weeklyLimit}`}
    </div>

    {weeklyEntryCount >= weeklyLimit ? (
      <div className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
        Weekly limit reached
      </div>
    ) : weeklyEntryCount >= weeklyLimit - 3 ? (
      <div className="rounded-md bg-yellow-100 px-3 py-1 text-sm text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
        Approaching weekly limit
      </div>
    ) : null}
  </>
)
