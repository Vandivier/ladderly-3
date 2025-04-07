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
import type { Root as MdastRoot, Node as MdastNode, Parent } from 'mdast'
import type {
  Root as HastRoot,
  Element as HastElement,
  Properties as HastProperties,
} from 'hast'
import { visit } from 'unist-util-visit'

// Interface for nodes created by remark-directive
interface DirectiveNode extends Parent {
  type: 'textDirective' | 'leafDirective' | 'containerDirective'
  name: string
  attributes?: Record<string, string>
  // Ensure data property and its sub-properties are properly typed/optional
  data?: {
    hName?: string
    hProperties?: HastProperties // Use HastProperties type
    hChildren?: Array<HastNode> // Use a more specific HAST node type if available
    [key: string]: unknown // Allow other potential data properties
  }
}
// Define a simple HastNode type for children if needed, or use any for now if complex
type HastNode = any

// Helper function to set HAST properties for the :a directive
function handleAnchorDirectiveHast(directive: DirectiveNode) {
  const attributes = directive.attributes ?? {}
  const href = attributes.href ?? '#'
  const id = attributes.id
  // Don't delete id from original attributes, create new properties object
  const hProperties: HastProperties = { ...attributes, id }

  // Set hName and hProperties on the directive node's data
  // remark-rehype will use these when converting the node
  const data = directive.data ?? (directive.data = {})
  data.hName = 'a' // Tell rehype to create an <a> tag
  data.hProperties = hProperties // Pass the attributes
  // DO NOT set data.hChildren - let rehype handle child conversion

  // Add target/rel to the hProperties directly
  if (typeof href === 'string' && href.startsWith('http')) {
    hProperties.target = '_blank'
    hProperties.rel = 'noopener noreferrer'
  }

  // Add data-premium-link to hProperties
  if (href === 'PREMIUM_SIGNUP_LINK') {
    hProperties['data-premium-link'] = 'true'
  }
}

// Custom plugin for Remark directives
const transformDirectivesPlugin: Plugin<[], MdastRoot> = () => {
  // List of directive types we are interested in
  const directiveTypes = [
    'textDirective',
    'leafDirective',
    'containerDirective',
  ]

  return (tree: MdastRoot) => {
    visit(tree, (node: MdastNode) => {
      // Check if the node type is one of the directive types using .includes()
      if (directiveTypes.includes(node.type)) {
        // Cast to DirectiveNode is safe here because we checked the type
        const directive = node as DirectiveNode
        if (directive.name === 'a') {
          handleAnchorDirectiveHast(directive)
        }
      }
    })
  }
}

// Custom Rehype plugin to add classes to the hero image
const addHeroImageClasses: Plugin<[], HastRoot> = () => {
  return (tree: HastRoot) => {
    // Visit HAST Elements
    visit(tree, 'element', (node: HastElement) => {
      // Use HastElement type
      if (node.tagName === 'img') {
        // Properties should now be accessible on HastElement
        const props = node.properties ?? {}
        const existingClasses = props.className ?? []
        const classList = (
          Array.isArray(existingClasses) ? existingClasses : [existingClasses]
        ).filter((c) => typeof c !== 'boolean')

        if (!classList.includes('not-prose')) classList.push('not-prose')
        if (!classList.includes('rounded-lg')) classList.push('rounded-lg')

        const marginIndex = classList.indexOf('m-0')
        if (marginIndex > -1) {
          classList.splice(marginIndex, 1)
        }

        props.className = classList
        // Assign properties back (safe due to HastElement type)
        node.properties = props
      }
    })
  }
}

// Function to extract the first image URL from markdown content
function findFirstImageUrl(content: string): string | null {
  // Correct Regex for standard markdown image: ![alt text](URL)
  const markdownMatch = content.match(/!\[([^\]]*)\]\(([^\)"\s]+)[^\)]*\)/)
  if (markdownMatch?.[2]) {
    return markdownMatch[2]
  }

  // Regex for directive image (assuming :img[alt]{src="url" ...})
  const directiveMatch = content.match(/:img\[.*?\]\{.*?src="([^"]+)".*?\}/)
  if (directiveMatch?.[1]) {
    return directiveMatch[1]
  }

  return null // No image found
}

interface BlogPostData {
  title: string
  author: string
  contentHtml: string
  toc: any[]
  premium: boolean
  excerpt: string
  ogImageUrlRelative?: string | null
}

export async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  const markdownFile = path.join(process.cwd(), 'src/app/blog', `${slug}.md`)

  if (!fs.existsSync(markdownFile)) {
    return null
  }

  const markdownWithMetadata = fs.readFileSync(markdownFile).toString()
  const { data, content } = matter(markdownWithMetadata)

  // Prioritize ogImage from front matter, then find first image
  const ogImageUrlRelative = data.ogImage || findFirstImageUrl(content)

  const toc: any[] = []
  const excerpt = content.split('\n\n')[0] ?? ''

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(transformDirectivesPlugin)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(addHeroImageClasses)
      .use(rehypeStringify)

    const file = await processor.process(content)
    const contentHtml = file.toString()

    return {
      title: data.title ?? 'Untitled',
      author: data.author ?? 'Unknown',
      contentHtml,
      toc,
      premium: data.premium === true,
      excerpt,
      ogImageUrlRelative: ogImageUrlRelative, // Use the determined URL
    }
  } catch (error) {
    console.error(`Error processing markdown for ${slug}:`, error)
    return {
      title: data.title ?? 'Untitled',
      author: data.author ?? 'Unknown',
      contentHtml: '<p>Error processing content.</p>',
      toc: [],
      premium: data.premium === true,
      excerpt,
      ogImageUrlRelative: data.ogImage || null, // Use front matter if available, else null
    }
  }
}
