import { PaymentTierEnum } from '@prisma/client'
import fs from 'fs'
import matter from 'gray-matter'
import { LockIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import path from 'path'

import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'

export const metadata: Metadata = {
  title: 'Blog | Ladderly',
  description: 'Articles about programming and career development',
}

interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  premium: boolean
  preview?: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(path.join(process.cwd(), 'src/app/blog'))
  const posts = files
    .filter((filename) => path.extname(filename) === '.md')
    .map((filename) => {
      const slug = filename.replace('.md', '')
      const markdownWithMetadata = fs
        .readFileSync(path.join(process.cwd(), 'src/app/blog', filename))
        .toString()
      const { data, content } = matter(markdownWithMetadata)

      // Get first paragraph for premium content
      const firstParagraph = content.split('\n\n')[0]?.trim() ?? ''

      return {
        slug,
        title: data.title,
        date: data.date,
        author: data.author,
        premium: data.premium || false,
        preview: data.premium ? firstParagraph : undefined,
      }
    })
    .reverse()

  return posts
}

const PremiumCard = () => (
  <div className="border-ladderly-violet-200 bg-ladderly-violet-50 mt-4 rounded-lg border p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <LockIcon className="h-6 w-6 text-ladderly-violet-500" />
      <h3 className="text-lg font-semibold text-ladderly-violet-700">
        Ladderly Premium Content
      </h3>
    </div>
    <p className="mt-2 text-ladderly-violet-600">
      Unlock this full article and all premium content with Ladderly Premium.
    </p>
    <a
      href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '#'}
      className="mt-4 inline-block rounded-md bg-ladderly-violet-600 px-4 py-2 text-white hover:bg-ladderly-violet-700"
      target="_blank"
      rel="noopener noreferrer"
    >
      Upgrade to Premium
    </a>
  </div>
)

export default async function BlogIndex() {
  const posts = await getBlogPosts()
  const userTier = PaymentTierEnum.FREE

  return (
    <LadderlyPageWrapper>
      <main className="m-auto w-full md:w-1/2">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="border-ladderly-light-purple border-b p-4"
          >
            <Link
              className="text-2xl text-ladderly-violet-600 hover:underline"
              href={`/blog/${post.slug}`}
            >
              {post.title}
            </Link>
            <p className="text-ladderly-violet-500">
              Published on {post.date} by {post.author}
              {post.premium && (
                <span className="bg-ladderly-violet-100 ml-2 inline-flex items-center rounded px-2 py-1 text-sm text-ladderly-violet-700">
                  <LockIcon className="mr-1 h-3 w-3" /> Premium
                </span>
              )}
            </p>
            {post.premium &&
              userTier === PaymentTierEnum.FREE &&
              post.preview && (
                <>
                  <div className="mt-3 text-gray-600">{post.preview}</div>
                  <PremiumCard />
                </>
              )}
          </div>
        ))}
      </main>
    </LadderlyPageWrapper>
  )
}
