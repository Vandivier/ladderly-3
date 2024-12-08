// run this from the root dir, `ladderly-3/`
// optionally pass the autofix flag, like so:
//  `node scripts/ci/custom-blog-lint.js --autofix`

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const BLOG_DIR = path.join(process.cwd(), 'src', 'app', 'blog')
const VOTABLES_PATH = path.join(
  process.cwd(),
  'db',
  'seed-utils',
  'votables.json'
)

/**
 * @typedef {Object} BlogInfo
 * @property {string} filename
 * @property {string} title
 */

/**
 * @typedef {Object} Votable
 * @property {string} type
 * @property {string} name
 * @property {string} website
 * @property {string[]} tags
 */

/**
 * @returns {BlogInfo[]}
 */
function getBlogInfo() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
      const { data } = matter(content)
      return {
        filename: file.replace('.md', ''),
        title: data.title || '',
      }
    })
}

/**
 * @returns {Votable[]}
 */
function getVotables() {
  const votablesContent = fs.readFileSync(VOTABLES_PATH, 'utf-8')
  return JSON.parse(votablesContent)
}

/**
 * @param {Votable[]} votables
 */
function saveVotables(votables) {
  fs.writeFileSync(VOTABLES_PATH, JSON.stringify(votables, null, 2))
}

/**
 * @param {boolean} autofix
 */
function checkBlogArticlesInVotables(autofix) {
  const blogInfo = getBlogInfo()
  const votables = getVotables()

  /** @type {BlogInfo[]} */
  const missingArticles = []

  for (const info of blogInfo) {
    const isInVotables = votables.some(
      (votable) =>
        votable.type === 'CONTENT' &&
        votable.website === `https://www.ladderly.io/blog/${info.filename}`
    )

    if (!isInVotables) {
      missingArticles.push(info)
    }
  }

  if (missingArticles.length > 0) {
    console.error('The following blog articles are missing from votables.json:')
    missingArticles.forEach((article) => {
      console.error(`- ${article.filename}`)
      const newVotable = {
        type: 'CONTENT',
        name: article.title,
        website: `https://www.ladderly.io/blog/${article.filename}`,
        tags: ['Ladderly.io Article'],
      }

      if (autofix) {
        votables.push(newVotable)
        console.log(`Added ${article.filename} to votables.json`)
      } else {
        console.error('Suggested JSON snippet to add:')
        console.error(JSON.stringify(newVotable, null, 2))
        console.error('\n')
      }
    })

    if (autofix) {
      saveVotables(votables)
      console.log('votables.json has been updated.')
    } else {
      console.error(
        'Run with --autofix to automatically add missing articles to votables.json'
      )
      process.exit(1) // Exit with an error code
    }
  } else {
    console.log('All blog articles are included in votables.json')
  }
}

// Check if --autofix flag is provided
const autofix = process.argv.includes('--autofix')

checkBlogArticlesInVotables(autofix)
