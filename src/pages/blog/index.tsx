import fs from "fs"
import matter from "gray-matter"
import Link from "next/link"
import path from "path"

import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"

const BlogIndex = ({
  posts,
}: {
  posts: { slug: string; title: string; date: string; author: string }[]
}) => {
  return (
    <LadderlyPageWrapper title="Ladderly | Blog">
      <main>
        {posts.map((post) => (
          <div key={post.slug} className="border-ladderly-light-purple border-b p-4">
            <Link
              className="text-2xl text-ladderly-violet-600 hover:underline"
              href={`/blog/${post.slug}`}
            >
              {post.title}
            </Link>
            <p className="text-ladderly-violet-500">
              Published on {post.date} by {post.author}
            </p>
          </div>
        ))}
      </main>
    </LadderlyPageWrapper>
  )
}

export const getStaticProps = async () => {
  const files = fs.readdirSync(path.join("src/pages/blog"))
  const posts = files
    .filter((filename) => path.extname(filename) === ".md")
    .map((filename) => {
      const slug = filename.replace(".md", "")
      const markdownWithMetadata = fs.readFileSync(path.join("src/pages/blog", filename)).toString()
      const { data } = matter(markdownWithMetadata)
      return {
        slug,
        title: data.title,
        date: data.date,
        author: data.author,
      }
    })

  return {
    props: {
      posts,
    },
  }
}

export default BlogIndex
