import "./styles/globals.css"
import { BlitzProvider } from "./blitz-client"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ladderly.io",
  description:
    "Ladderly is a coding bootcamp alternative" +
    " and career accelerator." +
    " Land your next programming role in as little as three months!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BlitzProvider>
          <>{children}</>
        </BlitzProvider>
      </body>
    </html>
  )
}
