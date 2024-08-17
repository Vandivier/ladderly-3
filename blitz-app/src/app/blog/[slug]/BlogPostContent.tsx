'use client'

import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

interface BlogPostContentProps {
  title: string
  content: string
  toc: TableOfContentsItem[]
}

export default function BlogPostContent({
  title,
  content,
  toc,
}: BlogPostContentProps) {
  return (
    <LadderlyPageWrapper title={title}>
      <main className="m-auto w-full md:w-1/2">
        <h1 className="p-4 text-3xl font-bold text-ladderly-violet-600">
          {title}
        </h1>
        <nav className="mb-8 rounded-lg bg-gray-100 p-4 shadow-lg">
          <h2 className="mb-2 text-xl font-bold">Table of Contents</h2>
          <ul>
            {toc.map((item) => (
              <li
                key={item.id}
                style={{ marginLeft: `${(item.level - 1) * 20}px` }}
              >
                <a
                  href={`#${item.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <article
          className="prose prose-lg max-w-none px-4 text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>
    </LadderlyPageWrapper>
  )
}
