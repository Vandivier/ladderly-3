import { ErrorComponent } from '@blitzjs/next'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

// ------------------------------------------------------
// This page is rendered if a route match is not found
// ------------------------------------------------------
export default function Page404() {
  const statusCode = 404
  const title = 'This page could not be found'
  return (
    <LadderlyPageWrapper title="404 - Not Found">
      <ErrorComponent statusCode={statusCode} title={title} />
    </LadderlyPageWrapper>
  )
}
