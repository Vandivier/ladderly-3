import { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import BlogPostContent from './BlogPostContent'
import { getBlogPost } from './getBlogPost'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { title, content } = await getBlogPost(params.slug)

  return {
    title: `${title} | Ladderly.io`,
    description: content.substring(0, 160),
    openGraph: {
      title: `${title} | Ladderly.io`,
      description: content.substring(0, 160),
      url: `https://ladderly.io/blog/${params.slug}`,
      type: 'article',
      images: [
        {
          url: 'https://www.ladderly.io/logo.png',
          width: 270,
          height: 270,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Ladderly.io`,
      description: content.substring(0, 160),
      images: ['https://www.ladderly.io/logo.png'],
    },
  }
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), 'src/app/blog'))
  return files
    .filter((filename) => path.extname(filename) === '.md')
    .map((filename) => ({
      slug: filename.replace('.md', ''),
    }))
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const { title, content, toc } = await getBlogPost(params.slug)

  return <BlogPostContent title={title} content={content} toc={toc} />
}
