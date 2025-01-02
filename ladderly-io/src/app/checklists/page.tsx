import Link from "next/link";
import { Suspense } from "react";
import { LadderlyPageWrapper } from "~/app/core/components/page-wrapper/LadderlyPageWrapper";
import { ChecklistsList } from "./ChecklistsList";

export const metadata = {
  title: "Checklists",
  description: "View and manage checklists",
};

export default function ChecklistsPage() {
  return (
    <LadderlyPageWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Checklists</h1>

        {/* <div className="mb-8">
          <Link
            href="/checklists/new"
            className="rounded bg-ladderly-pink px-4 py-2 text-white hover:bg-ladderly-pink/90"
          >
            Create Checklist
          </Link>
        </div> */}

        <Suspense fallback={<div>Loading...</div>}>
          <ChecklistsList />
        </Suspense>
      </div>
    </LadderlyPageWrapper>
  );
}
