import { BlitzPage } from "@blitzjs/next"
import React, { Suspense } from "react"
import { LargeCard } from "src/core/components/LargeCard"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"

const EventsCalendarPage: BlitzPage = () => {
  return (
    <LadderlyPageWrapper title="Events Calendar">
      <LargeCard>
        <h1 className="text-2xl font-bold text-gray-800">Events Calendar</h1>
        <p>
          Subscribe to the Ladderly Community Events calendar to receive
          reminders about upcoming streams, meetups, and other events.
        </p>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default EventsCalendarPage
