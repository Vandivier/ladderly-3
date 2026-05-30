'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'

type TaskMeta = { isCompleted?: boolean } & Record<string, unknown>

const getIsCompleted = (meta: unknown): boolean =>
  (meta as TaskMeta)?.isCompleted === true

export const MyTasksWidget = () => {
  const [showCompleted, setShowCompleted] = useState(false)
  const utils = api.useUtils()

  const { data: tasks, isLoading } = api.journal.getUserTasks.useQuery(
    undefined,
    { refetchOnWindowFocus: false, staleTime: 30_000 },
  )

  const { mutate: updateEntry } = api.journal.updateEntry.useMutation({
    onSuccess: () => utils.journal.getUserTasks.invalidate(),
  })

  const { mutate: deleteEntry } = api.journal.deleteEntry.useMutation({
    onSuccess: () => utils.journal.getUserTasks.invalidate(),
  })

  const toggleComplete = (
    id: number,
    currentMeta: unknown,
    current: boolean,
  ) => {
    const merged: TaskMeta = {
      ...((currentMeta as TaskMeta) ?? {}),
      isCompleted: !current,
    }
    updateEntry({ id, taskMetadata: merged })
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this task?')) deleteEntry({ id })
  }

  const open = tasks?.filter((t) => !getIsCompleted(t.taskMetadata)) ?? []
  const completed = tasks?.filter((t) => getIsCompleted(t.taskMetadata)) ?? []

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-lg font-semibold dark:text-gray-100">
        My Tasks
      </h3>

      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}

      {!isLoading && open.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No open tasks. Create one by selecting &ldquo;Task&rdquo; in the entry
          type dropdown above.
        </p>
      )}

      <ul className="space-y-2">
        {open.map((task) => (
          <li key={task.id} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={false}
              onChange={() =>
                toggleComplete(task.id, task.taskMetadata, false)
              }
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <div className="min-w-0 flex-1">
              {task.taskName && (
                <p className="text-sm font-medium dark:text-gray-100">
                  {task.taskName}
                </p>
              )}
              {task.content && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {task.content}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              className="shrink-0 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
              aria-label="Delete task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {completed.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {showCompleted ? '▲' : '▼'} {completed.length} completed
          </button>

          {showCompleted && (
            <ul className="mt-2 space-y-2">
              {completed.map((task) => (
                <li key={task.id} className="flex items-start gap-2 opacity-60">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() =>
                      toggleComplete(task.id, task.taskMetadata, true)
                    }
                    className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                  />
                  <div className="min-w-0 flex-1">
                    {task.taskName && (
                      <p className="text-sm line-through dark:text-gray-400">
                        {task.taskName}
                      </p>
                    )}
                    {task.content && (
                      <p className="truncate text-xs text-gray-400 line-through dark:text-gray-500">
                        {task.content}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="shrink-0 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                    aria-label="Delete task"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
