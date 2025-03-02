import fs from 'fs'
import matter from 'gray-matter'
import { LockIcon } from 'lucide-react'
import type { Heading, Text } from 'mdast'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import { calculateReadingTime } from '~/app/blog/blog-utils'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { getServerAuthSession } from '~/server/auth'
import { BlogPostContent } from './BlogPostContent'

// This generates static params for all blog posts at build time
export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), 'src/app/blog'))
  const paths = files
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => ({
      slug: filename.replace('.md', ''),
    }))

  return paths
}

// This generates metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      authors: [post.author],
    },
  }
}

interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

async function getTableOfContents(
  content: string,
): Promise<TableOfContentsItem[]> {
  const toc: TableOfContentsItem[] = []

  const tree = remark().parse(content)

  visit(tree, 'heading', (node: Heading) => {
    const text = node.children
      .filter((child): child is Text => child.type === 'text')
      .map((child) => child.value)
      .join('')

    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    toc.push({
      id,
      text,
      level: node.depth,
    })
  })

  return toc
}

async function getBlogPost(slug: string) {
  const markdownFile = path.join(process.cwd(), 'src/app/blog', `${slug}.md`)

  if (!fs.existsSync(markdownFile)) {
    return null
  }

  const fileContents = fs.readFileSync(markdownFile, 'utf8')
  const { data, content } = matter(fileContents)

  // Get first paragraph as excerpt
  const excerpt = content.split('\n\n')[0]
  const toc = await getTableOfContents(content)

  return {
    slug,
    title: data.title,
    author: data.author,
    content,
    excerpt,
    toc,
    premium: data.premium === 'true',
  }
}

const PremiumCard = ({ isAuthenticated = false }) => (
  <div className="my-8 rounded-lg border border-ladderly-violet-100 bg-ladderly-violet-100 p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <LockIcon className="size-6 text-ladderly-violet-500" />
      <h3 className="my-1 mr-auto text-lg font-semibold text-ladderly-violet-700">
        Ladderly Premium Content
      </h3>
    </div>
    <p className="mt-2 text-ladderly-violet-600">
      Unlock this full article and all premium content with Ladderly Premium for
      only one latte per month! ☕
    </p>
    <p className="mt-2 text-ladderly-violet-600">
      In addition to premium blog articles, Ladderly Premium includes 2 AI tools
      to supercharge your learning and job search journey, all for 6 dollars per
      month!
    </p>
    <a
      href={
        isAuthenticated
          ? (process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '#')
          : '/signup'
      }
      className="inline-block rounded-md bg-ladderly-violet-600 px-4 py-2 text-white hover:bg-ladderly-violet-700"
      {...(!isAuthenticated
        ? {}
        : { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {isAuthenticated ? 'Upgrade to Premium' : 'Sign Up Now'}
    </a>
  </div>
)

const TableOfContents = ({ items }: { items: TableOfContentsItem[] }) => (
  <section className="mb-8 rounded-lg bg-ladderly-light-purple-1 p-4 shadow-lg">
    <h2 className="my-2 text-xl font-bold text-ladderly-violet-600">
      Table of Contents
    </h2>
    <ol className="mb-2 list-decimal pl-5">
      {items.map((item) => (
        <li
          key={item.id}
          style={{ marginLeft: `${(item.level - 2) * 20}px` }}
          className={`my-1 ${item.level === 1 ? '-ml-5 list-none' : ''}`}
        >
          <a
            href={`#${item.id}`}
            className="text-ladderly-violet-500 hover:text-ladderly-violet-600"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  </section>
)

const PreviewBlogContent = ({
  post,
  isAuthenticated,
}: {
  post: NonNullable<Awaited<ReturnType<typeof getBlogPost>>>
  isAuthenticated: boolean
}) => (
  <article className="prose prose-lg prose-violet mx-auto w-full max-w-3xl overflow-hidden px-4">
    <header className="pb-4">
      <h1 className="mb-0 mt-4 text-3xl font-bold text-ladderly-violet-600">
        {post.title}
      </h1>
      <div className="mt-2 text-sm text-gray-600">
        Estimated read time: {calculateReadingTime(post.content)} minutes
      </div>
    </header>

    {post.toc.length > 0 && <TableOfContents items={post.toc} />}

    <BlogPostContent content={post.content.split('\n\n')[0] ?? ''} />
    <PremiumCard isAuthenticated={isAuthenticated} />
  </article>
)

const BlogPostLayout = ({
  children,
  post,
  requireAuth = false,
  isAuthenticated = false,
}: {
  children: React.ReactNode
  post: NonNullable<Awaited<ReturnType<typeof getBlogPost>>>
  requireAuth?: boolean
  isAuthenticated?: boolean
}) => {
  return (
    <LadderlyPageWrapper
      authenticate={requireAuth}
      requirePremium={requireAuth}
      unauthenticatedView={
        post.premium ? (
          <PreviewBlogContent post={post} isAuthenticated={isAuthenticated} />
        ) : undefined
      }
      previewView={
        post.premium ? (
          <PreviewBlogContent post={post} isAuthenticated={isAuthenticated} />
        ) : undefined
      }
    >
      <article className="prose prose-lg prose-violet mx-auto w-full max-w-3xl overflow-hidden px-4">
        <header className="pb-4">
          <h1 className="mb-0 mt-4 text-3xl font-bold text-ladderly-violet-600">
            {post.title}
          </h1>
          <div className="mt-2 text-sm text-gray-600">
            Estimated read time: {calculateReadingTime(post.content)} minutes
          </div>
        </header>

        {post.toc.length > 0 && <TableOfContents items={post.toc} />}
        {children}
      </article>
    </LadderlyPageWrapper>
  )
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)
  const session = await getServerAuthSession()

  if (!post) {
    notFound()
  }

  return (
    <BlogPostLayout
      post={post}
      requireAuth={post.premium}
      isAuthenticated={!!session}
    >
      <BlogPostContent content={post.content} />
    </BlogPostLayout>
  )
}
