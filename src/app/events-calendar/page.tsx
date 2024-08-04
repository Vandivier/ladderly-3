'use client'

import { BlitzPage } from '@blitzjs/next'
import React from 'react'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

const EventsCalendarPage: BlitzPage = () => {
  return (
    <LadderlyPageWrapper slug="/events-calendar" title="Events Calendar">
      <LargeCard>
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Events Calendar
        </h1>
        <p className="mb-4">
          Subscribe to the Ladderly Community Events calendar{' '}
          <a
            className="underline"
            href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MnJwdWwzbmFmazhtcW5wanNsaXE0czZubHJfMjAyNDA1MDZUMTkwMDAwWiBjXzllNWY0YzliOTI5NWQ1ZDZkNzdhNjUxNTU3NTQxMmYyOWY3ZmM0ODJiYmI1NjA0NGNlYzA5NjUwMGQ2OTk0NzlAZw&tmsrc=c_9e5f4c9b9295d5d6d77a6515575412f29f7fc482bbb56044cec096500d699479%40group.calendar.google.com&scp=ALL"
            target="_blank"
          >
            here
          </a>{' '}
          to receive reminders about upcoming streams, meetups, and other
          events.
        </p>
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          Current Recurring Events
        </h3>
        <p className="mb-4">
          Currently, there are three main recurring events in the Ladderly
          community. Watch the calendar for more, and join the Discord if you
          have questions!
        </p>
        <p className="mb-4">
          The Discord link is under the Community tab in the top navigation
          area.
        </p>
        <ol className="list-inside list-decimal space-y-2">
          <li>M-F 3 PM ET coding streams</li>
          <li>
            Tuesday, Thursday, and Saturday 9 PM ET coding and tech podcast
            content streams
          </li>
          <li>Small groups for learning to code on Saturdays at 11:30 AM ET</li>
        </ol>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default EventsCalendarPage
