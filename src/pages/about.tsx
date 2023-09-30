import { BlitzPage } from "@blitzjs/next"
import { LargeCard } from "src/core/components/LargeCard"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"

const AboutPage: BlitzPage = () => {
  return (
    <LadderlyPageWrapper title="Ladderly | About">
      <LargeCard>
        <h1 className="text-2xl font-bold text-gray-800">About Ladderly</h1>

        <p>TODO</p>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default AboutPage
