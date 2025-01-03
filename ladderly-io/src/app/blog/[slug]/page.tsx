import fs from 'fs'
import matter from 'gray-matter'
import type { Heading, Text } from 'mdast'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import path from 'path'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
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
      publishedTime: post.date,
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
    date: data.date,
    author: data.author,
    content,
    excerpt,
    toc,
  }
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <LadderlyPageWrapper>
      <article className="prose prose-lg prose-violet mx-auto w-full max-w-3xl overflow-hidden px-4">
        <header className="pb-4">
          <h1 className="mb-0 mt-4 text-3xl font-bold text-ladderly-violet-600">
            {post.title}
          </h1>
          <p className="my-0 text-gray-600">
            Published on {post.date} by {post.author}
          </p>
        </header>

        {post.toc.length > 0 && (
          <section className="mb-8 rounded-lg bg-ladderly-light-purple-1 p-4 shadow-lg">
            <h2 className="mb-2 text-xl font-bold text-ladderly-violet-600">
              Table of Contents
            </h2>
            <ol className="list-decimal pl-5">
              {post.toc.map((item) => (
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
        )}

        <BlogPostContent content={post.content} />
      </article>
    </LadderlyPageWrapper>
  )
}
