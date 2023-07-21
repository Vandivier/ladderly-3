import fs from "fs"
import path from "path"
import Link from "next/link"
import matter from "gray-matter"
import { Suspense } from "react"
import styles from "src/styles/Home.module.css"
import { TopNavContent } from "../index"

const BlogIndex = ({
  posts,
}: {
  posts: { slug: string; title: string; date: string; author: string }[]
}) => {
  return (
    <div className={styles.container}>
      <div className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
        <Suspense fallback="">
          <TopNavContent />
        </Suspense>
      </div>

      <main className={styles.main}>
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

      <footer className={styles.footer}>
        <a
          href="https://discord.gg/fAg6Xa4uxc"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          Discord
        </a>
        <a
          href="https://github.com/Vandivier/ladderly-3#about"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          GitHub
        </a>
        <p>Copyright © 2023 John Vandivier</p>
      </footer>
    </div>
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
