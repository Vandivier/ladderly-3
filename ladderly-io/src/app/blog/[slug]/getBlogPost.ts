import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { unified, type Plugin } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import type { Root as MdastRoot, Node as MdastNode } from 'mdast'
import type { Root as HastRoot } from 'hast'
import { visit } from 'unist-util-visit'
import { h } from 'hastscript'

// Helper function to generate HAST for the :a directive (no userId needed)
function handleAnchorDirectiveHast(directive: any) {
  const attributes = directive.attributes || {}
  let href = attributes.href || '#' // Use let for potential modification
  const id = attributes.id
  delete attributes.id

  const hastProperties: Record<string, any> = { ...attributes, id }

  // Check for premium link placeholder and add data attribute
  if (href === 'PREMIUM_SIGNUP_LINK') {
    hastProperties['data-premium-link'] = 'true'
    // Keep href as the placeholder for client-side replacement
  }

  // Add target/rel for external links
  if (typeof href === 'string' && href.startsWith('http')) {
    hastProperties.target = '_blank'
    hastProperties.rel = 'noopener noreferrer'
  }

  const hastNode = h('a', hastProperties, directive.children)

  const data = directive.data || (directive.data = {})
  data.hName = hastNode.tagName
  data.hProperties = hastNode.properties
  data.hChildren = hastNode.children
}

// Custom plugin (no userId needed)
const transformDirectivesPlugin: Plugin<[], MdastRoot> = () => {
  return (tree: MdastRoot) => {
    visit(tree, (node: MdastNode) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        if ((node as any).name === 'a') {
          handleAnchorDirectiveHast(node)
        }
      }
    })
  }
}

interface BlogPostData {
  title: string
  author: string
  contentHtml: string
  toc: any[]
  premium: boolean
  excerpt: string
}

export async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  const markdownFile = path.join(process.cwd(), 'src/app/blog', `${slug}.md`)

  if (!fs.existsSync(markdownFile)) {
    return null
  }

  const markdownWithMetadata = fs.readFileSync(markdownFile).toString()
  const { data, content } = matter(markdownWithMetadata)

  const toc: any[] = []
  const excerpt = content.split('\n\n')[0] ?? ''

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      // Use the simpler plugin without options
      .use(transformDirectivesPlugin)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)

    const file = await processor.process(content)
    const contentHtml = file.toString()

    return {
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      contentHtml,
      toc,
      premium: data.premium === true,
      excerpt,
    }
  } catch (error) {
    console.error(`Error processing markdown for ${slug}:`, error)
    return {
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      contentHtml: '<p>Error processing content.</p>',
      toc: [],
      premium: data.premium === true,
      excerpt,
    }
  }
}
