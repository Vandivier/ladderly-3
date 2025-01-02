"use client";

import React from "react";
import { api } from "~/trpc/react";

const ITEMS_PER_PAGE = 100;

export function ChecklistsList() {
  const [page, setPage] = React.useState(0);
  const { data, isLoading } = api.checklist.list.useQuery({
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No checklists found</div>;

  const { checklists, hasMore } = data;

  const goToPreviousPage = () => setPage((p) => Math.max(0, p - 1));
  const goToNextPage = () => setPage((p) => (hasMore ? p + 1 : p));

  return (
    <div>
      <ul className="space-y-2">
        {checklists.map((checklist) => (
          <li
            key={checklist.id}
            className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >{checklist.name}</li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <button
          disabled={page === 0}
          onClick={goToPreviousPage}
          className="rounded bg-ladderly-violet-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={!hasMore}
          onClick={goToNextPage}
          className="rounded bg-ladderly-violet-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
} 