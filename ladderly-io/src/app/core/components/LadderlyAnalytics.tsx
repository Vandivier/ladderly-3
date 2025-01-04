"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "nextjs-google-analytics";

export const LadderlyAnalytics = () => {
  return (
    <>
      <GoogleAnalytics trackPageViews />
      <Analytics />
      <SpeedInsights />
    </>
  );
};
