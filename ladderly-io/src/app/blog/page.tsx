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
  alternates: {
    canonical: '/blog',
  },
}

interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  premium: boolean
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
      const { data } = matter(markdownWithMetadata)

      return {
        slug,
        title: data.title,
        date: data.date,
        author: data.author,
        premium: data.premium === true,
      }
    })
    .reverse()

  return posts
}

const PremiumBadge = () => (
  <div className="group relative">
    <span className="inline-flex items-center justify-center rounded bg-ladderly-violet-100 p-1.5 text-ladderly-violet-500 transition-all hover:bg-ladderly-violet-500 hover:text-white">
      <LockIcon className="size-4" />
    </span>
    <div className="invisible absolute left-0 top-full z-10 mt-2 w-64 rounded-lg bg-ladderly-violet-500 p-2 text-sm text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
      <a
        href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Premium Article. Click here to sign up for Ladderly.io Premium for only
        $6 per month!
      </a>
      <div className="absolute -top-1 left-3 size-2 rotate-45 bg-ladderly-violet-500"></div>
    </div>
  </div>
)

export default async function BlogIndex() {
  const posts = await getBlogPosts()

  return (
    <LadderlyPageWrapper>
      <main className="m-auto w-full md:w-1/2">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="border-ladderly-light-purple border-b p-4"
          >
            <div className="flex items-center gap-2">
              {post.premium && <PremiumBadge />}
              <Link
                className="text-2xl text-ladderly-violet-600 hover:underline"
                href={`/blog/${post.slug}`}
              >
                {post.title}
              </Link>
            </div>
          </div>
        ))}
      </main>
    </LadderlyPageWrapper>
  )
}
