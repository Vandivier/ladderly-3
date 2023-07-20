const fs = require("fs")
const path = require("path")

// Replace this with your site's actual base URL
const baseURL = "https://www.yoursite.com"

const pagesDirectory = path.join(__dirname, "..", "src", "pages")
const publicDirectory = path.join(__dirname, "..", "public")

const pages = fs.readdirSync(pagesDirectory)

// Filter out non-page files and convert page files to URLs
const urls = pages
  .filter((page) => !["_app.tsx", "_document.tsx", "api"].includes(page))
  .map((page) => `${baseURL}/${page.replace(".tsx", "")}`)

// Wrap URLs in XML
const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}
</urlset>`

// Write sitemap to public directory
fs.writeFileSync(path.join(publicDirectory, "sitemap.xml"), sitemap)
