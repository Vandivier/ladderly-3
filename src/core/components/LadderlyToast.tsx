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
    if (event.key === "Enter") {
      onClick()
    } else if (event.key === "Escape") {
      if (typeof onClose === "function") {
        onClose()
      }
    }
  }

  const handleDismissClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (typeof onClose === "function") {
      onClose()
    }
  }

  const handleDismissKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation()
    if (typeof onClose === "function" && event.key === "Enter") {
      onClose()
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
        <button
          onClick={handleDismissClick}
          onKeyDown={handleDismissKeyDown}
          className="rounded-lg border bg-white p-2 font-bold"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  )
}
