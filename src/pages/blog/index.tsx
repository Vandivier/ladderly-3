import fs from "fs"
import path from "path"
import Link from "next/link"

const BlogIndex = ({ slugs }: { slugs: string[] }) => {
  return (
    <div>
      {slugs.map((slug) => (
        <div key={slug}>
          <Link href={`/blog/${slug}`}>{slug}</Link>
        </div>
      ))}
    </div>
  )
}

export const getStaticProps = async () => {
  const files = fs.readdirSync(path.join("src/pages/blog"))
  const slugs = files.map((filename) => filename.replace(".md", ""))

  return {
    props: {
      slugs,
    },
  }
}

export default BlogIndex
