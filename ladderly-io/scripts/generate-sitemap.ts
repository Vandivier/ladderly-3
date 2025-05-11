import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { join, relative, dirname } from 'node:path'
import beautify from 'xml-beautifier'
import { fileURLToPath } from 'node:url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Replace this with your site's actual base URL
const baseURL = 'https://www.ladderly.io'

const pagesDirectory = join(__dirname, '..', 'src', 'pages')
const appDirectory = join(__dirname, '..', 'src', 'app')
const publicDirectory = join(__dirname, '..', 'public')

function checkAuthenticationRequired(filePath: string): boolean {
  const fileContents = readFileSync(filePath, 'utf8')
  return (
    fileContents.includes('authenticate = true') ||
    fileContents.includes('requireAuth()')
  )
}

function getPathsFromDirectory(directory: string): string[] {
  let paths: string[] = []

  if (!existsSync(directory)) {
    return paths
  }

  const items = readdirSync(directory)

  for (const item of items) {
    const fullPath = join(directory, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      paths = [...paths, ...getPathsFromDirectory(fullPath)]
    } else if (stat.isFile()) {
      paths.push(fullPath)
    }
  }

  return paths
}

const allPagePaths = getPathsFromDirectory(pagesDirectory)
const allAppPaths = getPathsFromDirectory(appDirectory)

function filePathToUrlPath(filePath: string, baseDir: string): string {
  const relativePath = relative(baseDir, filePath)
  return relativePath
    .replace(/\\/g, '/') // Replace backslashes with forward slashes for URL
    .replace(/\.(tsx|ts|js|jsx|md)$/, '') // Remove file extensions
    .replace(/(^|\/)index$/, '') // Remove 'index' from path for root pages
    .replace(/\/page$/, '') // Remove 'page' for App Router pages
    .replace(/\(auth\),?/, '')
}

function isValidPagePath(urlPath: string): boolean {
  const excludePatterns = [
    'api',
    'components',
    '_',
    'layout',
    'error',
    'loading',
    'not-found',
  ]
  return !excludePatterns.some((pattern) => urlPath.includes(pattern))
}

function getUrlsFromPaths(
  paths: string[],
  baseDir: string,
  isAppRouter = false,
): string[] {
  return paths
    .filter((filePath) => {
      if (
        isAppRouter &&
        !filePath.endsWith('.md') &&
        !filePath.endsWith('page.tsx') &&
        !filePath.endsWith('page.ts') &&
        !filePath.endsWith('page.js') &&
        !filePath.endsWith('page.jsx')
      ) {
        return false
      }

      const urlPath = filePathToUrlPath(filePath, baseDir)
      return (
        !filePath.includes('[') &&
        !filePath.includes(']') &&
        !['_app', '_document', '.DS_Store', '.css'].some((exclude) =>
          filePath.includes(exclude),
        ) &&
        !checkAuthenticationRequired(filePath) &&
        isValidPagePath(urlPath)
      )
    })
    .map((filePath) => {
      const urlPath = filePathToUrlPath(filePath, baseDir)

      // Special handling for root page.tsx
      if (isAppRouter && (urlPath === 'page' || urlPath === '')) {
        return baseURL
      }

      return new URL(urlPath, baseURL).href
    })
}

const pageUrls = getUrlsFromPaths(allPagePaths, pagesDirectory)
const appUrls = getUrlsFromPaths(allAppPaths, appDirectory, true)

// Combine and sort all URLs
const urls = [...new Set([...pageUrls, ...appUrls])].sort()

// Wrap URLs in XML
const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>`

// Generate HTML sitemap
const htmlSitemap = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ladderly Sitemap</title>
</head>
<body>
    <h1>Ladderly Sitemap</h1>
    <ul>
        ${urls.map((url) => `<li><a href="${url}">${url}</a></li>`).join('\n        ')}
    </ul>
</body>
</html>`

// Beautify and Write sitemap to public directory
writeFileSync(join(publicDirectory, 'sitemap.xml'), beautify(sitemap))
writeFileSync(join(publicDirectory, 'sitemap.html'), htmlSitemap)

console.log(`Sitemap generated with ${urls.length} URLs`)
