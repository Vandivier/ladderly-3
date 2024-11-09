// src/app/HomePageContent.tsx

import { PaymentTierEnum } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import React from "react";
import useSubscriptionLevel from "src/app/users/hooks/useSubscriptionLevel";
import { LadderlyPageWrapper } from "~/app/core/components/page-wrapper/LadderlyPageWrapper";
import PricingGrid from "~/app/core/components/pricing-grid/PricingGrid";
import { DARK_MODE_STANDARD_CLASSES } from "~/app/core/theme/ThemeUtils";
import styles from "~/styles/Home.module.css";
import { AuthButtons } from "../_components/AuthButtons";
import { LadderlyHelpsBlock } from "./LadderlyHelpsBlock";
import { TestimonialBlock } from "./TestimonialBlock";

const HomePageCardSubheading = ({
  children,
}: {
  children: React.ReactNode;
}) => <h2 className="mb-2 text-xl font-bold">{children}</h2>;

const AdvancedChecklistContentBlock = () => {
  // const { tier } = useSubscriptionLevel();
  // TODO: get subscription tier from user router
  // const isPaid = tier != PaymentTierEnum.FREE;
  const isPaid = true;

  return isPaid ? (
    <div
      className={`m-2 w-[300px] rounded-lg bg-white p-2 shadow-lg lg:w-auto`}
    >
      <p className="text-gray-800">
        As a paid member, you can access the{" "}
        <Link
          className="text-m font-bold text-ladderly-pink hover:underline"
          href={"/checklists/my-premium-checklist"}
        >
          Advanced Checklist
        </Link>
        !
      </p>
    </div>
  ) : null;
};

const HomePageContent = ({ hello, session }: { hello: any; session: any }) => (
  <LadderlyPageWrapper title="Home">
    <main style={{ padding: "0rem 1rem" }}>
      <div className={styles.wrapper}>
        <div
          className={`mx-auto flex flex-wrap gap-0 rounded-lg bg-frost p-2 sm:flex-nowrap sm:gap-16`}
        >
          <Image
            alt="Ladderly Logo"
            className="m-auto block rounded-lg shadow-lg sm:hidden"
            height={270}
            priority={true}
            src="/logo.png"
            style={{ alignSelf: "center", maxHeight: "160px" }}
            width={270}
          />

          <Image
            alt="Ladderly Logo"
            height={330}
            className="m-6 hidden rounded-lg shadow-lg sm:block"
            priority={true}
            src="/logo.png"
            style={{ alignSelf: "center", maxHeight: "200px" }}
            width={330}
          />

          <LadderlyHelpsBlock />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-col justify-center sm:mt-4 sm:flex-row">
            <section id="testimonials">
              <div
                className={`text-gray-800 ${DARK_MODE_STANDARD_CLASSES} ${styles["next-steps-card"]} rounded-lg bg-white p-6 shadow-lg`}
              >
                <HomePageCardSubheading>
                  Why Users Love Us:
                </HomePageCardSubheading>
                <TestimonialBlock />
              </div>
            </section>

            <section id="recommended-next-steps" className="flex flex-col">
              <div
                className={`text-gray-800 ${DARK_MODE_STANDARD_CLASSES} ${styles["next-steps-card"]} rounded-lg bg-white p-6 shadow-lg`}
              >
                <HomePageCardSubheading>
                  Recommended Next Steps:
                </HomePageCardSubheading>
                <p className="text-l font-bold">
                  Complete the{" "}
                  <Link
                    className="text-ladderly-pink hover:underline"
                    href={"/checklists/my-basic-checklist"}
                  >
                    Standard Checklist
                  </Link>
                  , consider one of the paid plans below, and{" "}
                  <Link
                    className="text-ladderly-pink hover:underline"
                    href={"https://buy.stripe.com/cN2bMfbOQ2CX5dC7su"}
                    target="_blank"
                  >
                    Book an Expert Session
                  </Link>
                  !
                </p>
              </div>

              <div
                className={`text-gray-800 ${DARK_MODE_STANDARD_CLASSES} ${styles["next-steps-card"]} rounded-lg bg-white p-2 shadow-lg`}
              >
                <p>
                  To support Ladderly{"'"}s mission to provide low-cost
                  education in STEM, consider{" "}
                  <Link
                    className="text-m font-bold text-ladderly-pink hover:underline"
                    href={"https://buy.stripe.com/eVa9E72egelFfSgfYZ"}
                    target="_blank"
                  >
                    leaving a tip
                  </Link>
                  .
                </p>
              </div>
            </section>
          </div>

          <section id="deleteme">
            <div className="flex flex-col items-center gap-2">
              <p className="text-2xl text-white">
                {hello ? hello.greeting : "Loading tRPC query..."}
              </p>

              <AuthButtons initialSession={session} />
            </div>
          </section>

          <Suspense>
            <AdvancedChecklistContentBlock />
          </Suspense>

          <PricingGrid />
        </div>
      </div>
    </main>
  </LadderlyPageWrapper>
);

export default HomePageContent;
