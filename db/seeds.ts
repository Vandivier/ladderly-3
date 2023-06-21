import db from "./index"

const prisma = db

const seed = async () => {
  const checklistItems = [
    "Joined the Discord, participating regularly and socially",
    "Watched the Trial by Fire and reproduced it; I have a GitHub with a vanilla JS+HTML single-page blog hosted on GitHub pages",
    "I executed a substantive web dev program (coursera, codecademy pro front end, a reputable bootcamp, or a Ladderly mentorship)",
    "I have a portfolio with 4 projects including: vanilla js blog, next blog, a capstone that reflects my personal interests, and a portfolio site. All projects are publicly deployed and visible with public README files that describe them",
    "I have used the rect tool for flash card study and passed at least one quiz. I created at least one GitHub issue or PR on the repo to improve it. I reached out to the maintainers using Discord or other means if I didn't hear back on my PR or issue within a few days. I am an Open Source contributor!",
    "I have attempted LinkedIn skill certs for HTML, CSS, JavaScript, TypeScript, React, and Git, and passed at least half of them. (There might be a separate responsive design one or also tailwind, bootstrap, material design, scss, or some others that should count)",
    "I have optimized my LinkedIn",
    "I have optimized my resume",
    "I am continually applying to 70+ places each week with social follow-up as prescribed in ladderly-slides",
    "I have been following the 5 to 23 patterns article for at least two weeks",
    "After continuing the job search process for 2+ weeks (apply, follow up, keep coding, practicing for interviews) I have gotten at least one phone screening or I have reached out to a mentor to help investigate the lack of phone screening progress",
    "I have had a few interviews, obtained feedback, and incorporated that feedback to improve my job search going forward",
    "I have participated in Ladderly endorsed communities as recommended",
    "I have reached out for help whenever needed in the Ladderly community, endorsed communities, and through independent outreach using social media and my personal social network",
    "I have landed a full time role involving coding!",
  ]

  // Create a new checklist
  const checklist = await prisma.checklist.create({
    data: {
      name: "Programming Job Checklist",
    },
  })

  // Create the checklist items for the new checklist
  for (const item of checklistItems) {
    await prisma.checklistItem.create({
      data: {
        displayText: item,
        checklistId: checklist.id,
      },
    })
  }
}

export default seed
