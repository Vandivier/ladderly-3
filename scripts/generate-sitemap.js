const fs = require('fs')
const path = require('path')
const beautify = require('xml-beautifier')

// Replace this with your site's actual base URL
const baseURL = 'https://ladderly.io'

const pagesDirectory = path.join(__dirname, '..', 'src', 'pages')
const publicDirectory = path.join(__dirname, '..', 'public')

function checkAuthenticationRequired(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  return fileContents.includes('authenticate = true')
}

// Function to recursively get all paths from a directory
function getPathsFromDirectory(directory) {
  let paths = []

  // Read items in the directory
  const items = fs.readdirSync(directory)

  for (const item of items) {
    // Full path of the item
    const fullPath = path.join(directory, item)
    // Get stats of the item
    const stat = fs.statSync(fullPath)

    // If the item is a directory, recursively get its paths, else add it to the paths array
    if (stat.isDirectory()) {
      paths = [...paths, ...getPathsFromDirectory(fullPath)]
    } else if (stat.isFile()) {
      paths.push(fullPath)
    }
  }

  return paths
}

// Get all page paths
const allPagePaths = getPathsFromDirectory(pagesDirectory)

// Filter and map paths to URLs
const urls = allPagePaths
  .filter((filePath) => {
    // Exclude dynamic routes, specific files, and authenticated pages
    return (
      !filePath.includes('[') &&
      !filePath.includes(']') &&
      !['_app.tsx', '_document.tsx', '.DS_Store', '.css'].some((exclude) =>
        filePath.endsWith(exclude)
      ) &&
      !checkAuthenticationRequired(filePath)
    )
  })
  .map((filePath) => {
    // Convert file path to URL path
    const relativePath = path.relative(pagesDirectory, filePath)
    const urlPath = relativePath
      .replace(/\\/g, '/') // Replace backslashes with forward slashes for URL
      .replace(/\.tsx$/, '') // Remove file extension
      .replace(/\.md$/, '') // Remove file extension for markdown
      .replace(/index$/, '') // Remove 'index' from path for root pages

    return `${baseURL}/${urlPath}`
  })
  .sort()

// Wrap URLs in XML
const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>`

// Beautify and Write sitemap to public directory
fs.writeFileSync(path.join(publicDirectory, 'sitemap.xml'), beautify(sitemap))
