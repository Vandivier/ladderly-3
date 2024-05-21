import { BlitzPage } from "@blitzjs/next"
import Link from "next/link"
import { LargeCard } from "src/core/components/LargeCard"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"

import styles from "src/app/styles/Home.module.css"

const AboutPage: BlitzPage = () => {
  return (
    <LadderlyPageWrapper title="About">
      <LargeCard>
        <h1 className="text-2xl font-bold text-gray-800">
          Discover the Ladderly Difference
        </h1>

        <p className="mt-4">
          Ladderly is an ecosystem of passionate learners and innovators.
          Ladderly provides a set of tools and educational programs dedicated to
          accelerating your journey in tech.
        </p>
        <p className="mt-4">
          Learn to code, climb your career ladder, and join the revolution.
        </p>

        <section className="mt-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Our Core Values
          </h2>
          <ol className="mt-4 list-decimal pl-5">
            <li>
              <strong>Generosity & Community</strong>: Ladderly thrives on
              mutual support. Members help each other learn, grow, and succeed.
              Our strength lies in our community.
            </li>
            <li>
              <strong>Freedom</strong>: We value freedom. We champion free
              services to uplift all, especially those less privileged. We value
              open source and open science.
            </li>
            <li>
              <strong>Open Source</strong>: We advocate for open-source
              technology. The curriculum we teach, the research we produce, and
              this website are all open source!
            </li>
            <li>
              <strong>Science</strong>: At Ladderly, we emphasize data-driven
              and evidence-based strategies for our students. We continuously
              experiment, learn, share back with the community, and improve our
              tools based on what we find.
            </li>
            <li>
              <strong>Diversity</strong>: Our community thrives on diverse minds
              coming together. Multiple perspectives, united by a shared vision,
              lead us to truth and innovation.
            </li>
            <li>
              <strong>Personalized & Intelligent Defaults</strong>: We are
              literally immune to analysis paralysis! Instead of overwhelming
              choices, we present intelligent defaults, with prioritized
              alternatives and fallback strategies if the primary approach doesn
              {`'`}t work for you.
            </li>
            <li>
              <strong>Curation & Humility</strong>: We celebrate the expertise
              of others. If someone else does it better, we happily refer you to
              external resources, instead of trying to be the best at
              everything. Partnership, honesty, and continuous improvement are
              our cornerstones. Curation is a major part of our value
              proposition.
            </li>
            <li>
              <strong>Quality of Life</strong>: We endorse a high-performance
              lifestyle, underpinned by health, rest, and joy. Celebrate
              achievements, big or small, and advance your skills and career,
              without encouraging workaholism or other unhealthy habits.
            </li>
          </ol>
        </section>

        <h2 className="my-4 text-xl font-semibold text-gray-700">
          Start Now for Free!
        </h2>
        <p className="mt-4">
          Sign up{" "}
          <Link className={styles.textLink} href="auth/signup">
            here
          </Link>{" "}
          and check out the{" "}
          <a
            href="https://discord.gg/fAg6Xa4uxc"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            Discord community
          </a>
          .
        </p>
        <p>Welcome to the future of learning and growth!</p>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default AboutPage
