import Document, { Html, Main, NextScript, Head } from "next/document"
import { GoogleAnalytics } from "nextjs-google-analytics"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <GoogleAnalytics trackPageViews />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
