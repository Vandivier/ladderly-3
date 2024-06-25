import React from 'react';
import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next";
import { Analytics } from "@vercel/analytics/react";
import { AuthenticationError, AuthorizationError } from "blitz";
import Link from "next/link";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { withBlitz } from "src/app/blitz-client";

import { LargeCard } from "src/core/components/LargeCard";
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper";

import "src/app/styles/globals.css";
import TableOfContents from '../components/TableOfContents'; // Adjust the path as necessary

const UserExceptionWrapper = ({ error }: { error: Error & Record<any, any> }) => (
  <LadderlyPageWrapper title="Error">
    <LargeCard>
      <div>
        <h1 className="text-center text-3xl text-ladderly-violet-600">Error</h1>
        <h2 className="mb-3 mt-5 text-xl">
          {error instanceof AuthenticationError
            ? "You are not logged in."
            : "You are not authorized to access this."}
        </h2>

        <div>
          {error instanceof AuthenticationError ? (
            <div>
              <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href="/login">
                Log In
              </Link>
              <p>
                <span>Not a member yet?</span>{" "}
                <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href="/signup">
                  Create an account for free!
                </Link>
              </p>
            </div>
          ) : (
            <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href="/">
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </LargeCard>
  </LadderlyPageWrapper>
);

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    return <UserExceptionWrapper error={error} />;
  }

  return (
    <ErrorComponent statusCode={(error as any)?.statusCode || 400} title={error.message || error.name} />
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page);

  const showTOC = (Component.showTOC !== false); // Add a static property to disable TOC for specific pages

  return (
    <>
      <GoogleAnalytics trackPageViews />
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        {getLayout(
          <>
            {showTOC && <TableOfContents />}
            <Component {...pageProps} />
          </>
        )}
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default withBlitz(MyApp);
