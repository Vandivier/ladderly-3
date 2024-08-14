const fs = require('fs')
const path = require('path')
const beautify = require('xml-beautifier')

// Replace this with your site's actual base URL
const baseURL = 'https://ladderly.io'

const pagesDirectory = path.join(__dirname, '..', 'src', 'pages')
const appDirectory = path.join(__dirname, '..', 'src', 'app')
const publicDirectory = path.join(__dirname, '..', 'public')

function checkAuthenticationRequired(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  return (
    fileContents.includes('authenticate = true') ||
    fileContents.includes('requireAuth()')
  )
}

function getPathsFromDirectory(directory) {
  let paths = []

  if (!fs.existsSync(directory)) {
    return paths
  }

  const items = fs.readdirSync(directory)

  for (const item of items) {
    const fullPath = path.join(directory, item)
    const stat = fs.statSync(fullPath)

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

function filePathToUrlPath(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath)
  return relativePath
    .replace(/\\/g, '/') // Replace backslashes with forward slashes for URL
    .replace(/\.(tsx|ts|js|jsx|md)$/, '') // Remove file extensions
    .replace(/(^|\/)index$/, '') // Remove 'index' from path for root pages
    .replace(/\/page$/, '') // Remove 'page' for App Router pages
    .replace(/\(auth\),?/, '')
}

function isValidPagePath(urlPath) {
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

function getUrlsFromPaths(paths, baseDir, isAppRouter = false) {
  return paths
    .filter((filePath) => {
      if (
        isAppRouter &&
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
          filePath.includes(exclude)
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

// Beautify and Write sitemap to public directory
fs.writeFileSync(path.join(publicDirectory, 'sitemap.xml'), beautify(sitemap))

console.log(`Sitemap generated with ${urls.length} URLs`)
