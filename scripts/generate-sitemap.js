const fs = require("fs")
const path = require("path")
const beautify = require("xml-beautifier")

// Replace this with your site's actual base URL
const baseURL = "https://ladderly.io"

const pagesDirectory = path.join(__dirname, "..", "src", "pages")
const blogDirectory = path.join(pagesDirectory, "blog")
const publicDirectory = path.join(__dirname, "..", "public")

const pages = fs.readdirSync(pagesDirectory)
const blogPosts = fs.readdirSync(blogDirectory)

// Filter out non-page files and convert page files to URLs
const pageUrls = pages
  .filter((page) => !["_app.tsx", "_document.tsx", "api", "blog"].includes(page))
  .map((page) => `${baseURL}/${page.replace(".tsx", "")}`)

// Convert blog post files to URLs
const blogUrls = blogPosts
  .filter((post) => post.endsWith(".md"))
  .map((post) => `${baseURL}/blog/${post.replace(".md", "")}`)

const urls = [...pageUrls, ...blogUrls]

// Wrap URLs in XML
const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join("\n  ")}
</urlset>`

// Beautify and Write sitemap to public directory
fs.writeFileSync(path.join(publicDirectory, "sitemap.xml"), beautify(sitemap))
