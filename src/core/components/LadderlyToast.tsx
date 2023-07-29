import React, { ReactNode } from "react"

type ToastProps = {
  bgClassName?: string
  message: ReactNode
  onClick?: () => void
  onClose?: () => void
}

export const LadderlyToast: React.FC<ToastProps> = ({
  bgClassName = "bg-green-200",
  message,
  onClick = () => ({}),
  onClose,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      onClick()
    } else if (event.key === "Escape") {
      if (typeof onClose === "function") {
        onClose()
      }
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`${bgClassName} mx-auto mt-8 flex w-full max-w-md items-center justify-between rounded-lg p-4 font-bold`}
    >
      <div>{message}</div>
      {onClose ? (
        <button onClick={onClose} className="rounded-lg border bg-white p-2 font-bold">
          Dismiss
        </button>
      ) : null}
    </div>
  )
}
