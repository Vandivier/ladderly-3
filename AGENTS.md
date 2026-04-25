# AI Assistant Instructions

Act as an expert web developer to help me resolve a concern.
We are working on the Ladderly.io web project and I will describe the dependencies for the project,
the folder structure, and the data model. Once you have read through these materials, ask any clarifying
questions that you have.
If you have no questions, state that you have read through the high-level context
and you are ready to help with the current concern.

Here is the project.json file for this project which describes the dependencies:
Full package.json content:
{
"name": "ladderly-io",
"version": "0.1.2",
"private": false,
"type": "module",
"scripts": {
"build": "node --experimental-strip-types scripts/generate-sitemap.ts && next build",
"better-build": "npm run lint && node --experimental-strip-types scripts/generate-sitemap.ts && next build",
"clean-branches": "git for-each-ref --format '%(refname:short)' refs/heads | grep -v 'main' | xargs git branch -D",
"db:generate": "prisma generate",
"db:migrate": "prisma migrate deploy",
"db:push": "prisma db push",
"db:seed": "prisma db seed",
"db:seed:courses": "tsx prisma/seedCoursesAndFlashcards.ts",
"db:seed:in-place": "prisma db seed -- --update-latest-checklists",
"db:studio": "prisma studio",
"db:clean": "tsx scripts/cleanupUnusedChecklists.ts",
"dev": "next dev",
"install:vercel": "npm install && npm rebuild argon2 --build-from-source && npm run postinstall",
"postinstall": "prisma generate",
"lint": "next lint",
"check-types": "tsc --noEmit",
"start": "next start",
"test": "vitest run --exclude \"tests/integration/**\"",
"test:integration": "vitest run --config vitest.config.integration.ts",
"test:watch": "vitest --watch --exclude \"tests/integration/**\"",
"test:ui": "vitest --ui --exclude \"tests/integration/**\"",
"test:cov": "vitest run --coverage --exclude \"tests/integration/**\""
},
"dependencies": {
"@auth/prisma-adapter": "^1.6.0",
"@google/generative-ai": "^0.21.0",
"@prisma/client": "^6.2.1",
"@stripe/stripe-js": "^5.4.0",
"@t3-oss/env-nextjs": "^0.10.1",
"@tailwindcss/typography": "^0.5.15",
"@tanstack/react-query": "^5.50.0",
"@trpc/client": "^11.7.2",
"@trpc/react-query": "^11.7.2",
"@trpc/server": "^11.7.2",
"@vercel/analytics": "^1.4.1",
"@vercel/speed-insights": "^1.1.0",
"ai": "^4.1.40",
"argon2": "0.31.2",
"better-auth": "^1.4.1",
"eslint-plugin-tailwindcss": "^3.17.5",
"final-form": "^4.20.10",
"geist": "^1.3.0",
"gray-matter": "^4.0.3",
"katex": "^0.16.25",
"lucide-react": "^0.469.0",
"next": "^14.2.4",
"nextjs-google-analytics": "^2.3.7",
"papaparse": "^5.5.2",
"postmark": "^4.0.5",
"react": "^18.3.1",
"react-dom": "^18.3.1",
"react-final-form": "^6.5.9",
"react-google-charts": "^5.2.1",
"react-markdown": "^9.0.1",
"react-select": "^5.8.3",
"recharts": "^2.15.3",
"rehype-autolink-headings": "^7.1.0",
"rehype-external-links": "^3.0.0",
"rehype-highlight": "^7.0.1",
"rehype-katex": "^7.0.1",
"rehype-slug": "^6.0.0",
"rehype-stringify": "^10.0.1",
"remark": "^15.0.1",
"remark-directive": "^4.0.0",
"remark-gfm": "^4.0.0",
"remark-math": "^6.0.0",
"server-only": "^0.0.1",
"stripe": "^14.18.0",
"superjson": "^2.2.1",
"xml-beautifier": "^0.5.0",
"zod": "^3.23.3"
},
"devDependencies": {
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/react": "^16.2.0",
"@types/eslint": "^8.56.10",
"@types/fs-extra": "^11.0.4",
"@types/hast": "^3.0.4",
"@types/mdast": "^4.0.4",
"@types/node": "^22.0.0",
"@types/papaparse": "^5.3.15",
"@types/react": "^18.3.3",
"@types/react-dom": "^18.3.0",
"@typescript-eslint/eslint-plugin": "^8.46.3",
"@typescript-eslint/parser": "^8.46.3",
"@vitejs/plugin-react": "^4.3.4",
"@vitest/coverage-v8": "^3.0.6",
"@vitest/ui": "^3.0.6",
"dotenv": "^16.4.7",
"eslint": "^8.57.1",
"eslint-config-next": "^14.2.4",
"fs-extra": "^11.2.0",
"hastscript": "^9.0.1",
"jsdom": "^26.0.0",
"postcss": "^8.4.39",
"prettier": "^3.3.2",
"prettier-plugin-tailwindcss": "^0.6.5",
"prisma": "^6.13.0",
"rehype-raw": "^7.0.0",
"tailwindcss": "^3.4.3",
"tsx": "^4.19.3",
"typescript": "^5.7.3",
"vitest": "^3.0.6"
},
"engines": {
"node": ">=22.0.0"
},
"ct3aMetadata": {
"initVersion": "7.36.2"
},
"packageManager": "npm@10.8.2",
"overrides": {
"react": "^18.3.1",
"react-dom": "^18.3.1",
"next": "^14.2.4"
},
"prisma": {
"seed": "tsx prisma/seeds.ts"
}
}

Here is the folder structure of the project:
.gitignore
.npmrc
AGENTS.md
CLAUDE.md
CONTRIBUTING.md
Makefile
README.md
package-lock.json
package.json
prettier.config.js
prettier.config.mjs
prettier.config.ts
vercel.json
.claude/
.claude/skills/
.claude/skills/deny-default-git-writes/
SKILL.md
.claude/skills/match-or-create-github-issue/
SKILL.md
.cursor/
.cursor/rules/
.github/
.github/workflows/
ci.yml
integration-tests.yml
lint.yml
stale.yml
tests.yml
.husky/
pre-commit
.husky/_/
.gitignore
applypatch-msg
commit-msg
h
husky.sh
post-applypatch
post-checkout
post-commit
post-merge
post-rewrite
pre-applypatch
pre-auto-gc
pre-commit
pre-push
pre-rebase
prepare-commit-msg
.vscode/
extensions.json
docs/
RUNBOOK.md
SETUP.md
ladderly-io/
.dockerignore
.env.template
.eslintrc.cjs
.gitignore
Dockerfile.integration_tests
README.md
next.config.js
package-lock.json
package.json
postcss.config.cjs
prettier.config.ts
start-database.sh
tailwind.config.ts
tsconfig.json
vitest.config.integration.ts
vitest.config.ts
ladderly-io/.github/
ladderly-io/.github/workflows/
lint.yml
test.yml
ladderly-io/.next/
ladderly-io/docker/
docker-compose.integration.yml
integration-entrypoint.sh
ladderly-io/node_modules/
ladderly-io/prisma/
schema.prisma
seedCoursesAndFlashcards.ts
seeds.ts
ladderly-io/prisma/migrations/
migration_lock.toml
ladderly-io/prisma/migrations/20230619184405_/
migration.sql
ladderly-io/prisma/migrations/20230619223016*optional_user_uuid/
migration.sql
ladderly-io/prisma/migrations/20230619223254_required_uuid_user/
migration.sql
ladderly-io/prisma/migrations/20230621003315_checklist_items/
migration.sql
ladderly-io/prisma/migrations/20230621003453_init_checklist/
migration.sql
ladderly-io/prisma/migrations/20230621004105_fix_checklistitem_relation/
migration.sql
ladderly-io/prisma/migrations/20230621005853*/
migration.sql
ladderly-io/prisma/migrations/20230622023703*init_payment_tiers/
migration.sql
ladderly-io/prisma/migrations/20230622041136_default_subscription_free/
migration.sql
ladderly-io/prisma/migrations/20230717002647_nullable_versioned_checklists/
migration.sql
ladderly-io/prisma/migrations/20230717003130_required_version_checklist/
migration.sql
ladderly-io/prisma/migrations/20230717010104_temp_optional_display_idx/
migration.sql
ladderly-io/prisma/migrations/20230717225747_non_nullable_checklist_item_display_index/
migration.sql
ladderly-io/prisma/migrations/20230719034635_checklist_item_detail_text/
migration.sql
ladderly-io/prisma/migrations/20230719035112_links_for_checklist_items/
migration.sql
ladderly-io/prisma/migrations/20230719052022_versioned_checklist_items/
migration.sql
ladderly-io/prisma/migrations/20230719190420_more_email_fields_and_subscription_type/
migration.sql
ladderly-io/prisma/migrations/20230721204837_init_user_checklist_item/
migration.sql
ladderly-io/prisma/migrations/20230721205221_no_generic_checklist_item_completestate/
migration.sql
ladderly-io/prisma/migrations/20230721210438_formalize_role_enum_w_admin/
migration.sql
ladderly-io/prisma/migrations/20230802011425_public_profile_opt_in/
migration.sql
ladderly-io/prisma/migrations/20230802012631_open_to_work_bool/
migration.sql
ladderly-io/prisma/migrations/20230802013857_profile_data/
migration.sql
ladderly-io/prisma/migrations/20230806184729_init_contributions/
migration.sql
ladderly-io/prisma/migrations/20240111015249_init_total_contributions/
migration.sql
ladderly-io/prisma/migrations/20240111022632_unique_subscription_by_type/
migration.sql
ladderly-io/prisma/migrations/20240111030957_rm_unique_contrib_per_subs/
migration.sql
ladderly-io/prisma/migrations/20240128051442_small_group_interest/
migration.sql
ladderly-io/prisma/migrations/20240217162209_user_residence_location/
migration.sql
ladderly-io/prisma/migrations/20240814022244_votables/
migration.sql
ladderly-io/prisma/migrations/20240814033017_nullable_miscinfo/
migration.sql
ladderly-io/prisma/migrations/20240814042534_guest_votes/
migration.sql
ladderly-io/prisma/migrations/20240814175726_constraint_name_and_type_jointly_on_votable/
migration.sql
ladderly-io/prisma/migrations/20240815011358_content_votable_type/
migration.sql
ladderly-io/prisma/migrations/20240816201444_user_pfps/
migration.sql
ladderly-io/prisma/migrations/20240817173146*/
migration.sql
ladderly-io/prisma/migrations/20240817173340_optional_sessiontoken/
migration.sql
ladderly-io/prisma/migrations/20240817173916_cascade_delete_sessions_on_user_delete/
migration.sql
ladderly-io/prisma/migrations/20241125000000_migrate_to_better_auth/
migration.sql
ladderly-io/prisma/seed-utils/
seedCourses.ts
seedFlashcards.ts
seedLeetcodeChecklist.ts
seedPractices.ts
seedVotables.ts
updateChecklists.ts
ladderly-io/prisma/seeds/
checklists.json
courses.json
practices.json
premium-checklists.json
votables.json
ladderly-io/public/
android-chrome-192x192.png
android-chrome-512x512.png
apple-touch-icon.png
cute-type-ham.png
favicon-16x16.png
favicon-32x32.png
favicon.ico
logo.png
logo.webp
robots.txt
site.webmanifest
sitemap.html
sitemap.xml
ladderly-io/public/blog/
ladderly-io/public/blog/images/
cover-letters-poll.png
ladderly-io/scripts/
backupChecklists.ts
backupUsers.ts
cascadeDeleteChecklist.ts
cleanupUnusedChecklists.ts
createLeadsFromTextList.ts
createLeadsFromUsers.ts
deleteUser.ts
ensureSubscriptions.js
generate-sitemap.ts
migrateAccountIdToInt.ts
migrateCredentialAccounts.ts
restoreUsers.js
seedIntegrationTestUser.ts
ladderly-io/scripts/backup-data/
accounts-backup-1764443167248.json
accounts-backup-1764443258167.json
accounts-backup-1764443309520.json
ladderly-io/scripts/ci/
custom-blog-lint.js
ladderly-io/scripts/data/
.gitkeep
ladderly-io/scripts/one-offs/
2023-07-21-ensureUserSubscriptions.js
2023-07-22-nuke-user-checklists.js
ladderly-io/scripts/python/
.python-version
README.md
create-copilot-instructions.py
create-unified-leetcode-list.py
enrich_leetcode_difficulty.py
pyproject.toml
uv.lock
ladderly-io/scripts/python/analytical/
README.md
blog-15-job-search-regression.csv
blog-15-job-search-regression.py
blog-16-game-based-evaluation-ai-risk-analysis.csv
requirements.txt
ladderly-io/scripts/python/leetcode-problems/
leetcode-grind-75.json
leetcode-ladderly-expanded-kata.json
leetcode-neetcode-250.json
leetcode-sean-prashad-leetcode-patterns.json
leetcode-swe-65-hard.json
leetcode-swe-75-hard.json
leetcode-taro-75.json
unified-leetcode-problems.json
ladderly-io/scripts/python/youtube-transcriber/
.env.template
README.md
consolidate.py
consolidated_transcript.txt
main.py
manage_playlist.py
report.py
requirements.txt
tasks.py
urls_high_value_automated.json
urls_high_value_manual.json
urls_low_value_automated.json
urls_low_value_manual.json
ladderly-io/src/
env.js
middleware.ts
ladderly-io/src/app/
layout.tsx
page.tsx
ladderly-io/src/app/(auth)/
schemas.ts
ladderly-io/src/app/(auth)/components/
LoginForm.tsx
SignupForm.tsx
ladderly-io/src/app/(auth)/forgot-password/
page.tsx
ladderly-io/src/app/(auth)/login/
page.tsx
ladderly-io/src/app/(auth)/reset-password/
ResetPasswordClientPageClient.tsx
page.tsx
ladderly-io/src/app/(auth)/signup/
page.tsx
ladderly-io/src/app/(auth)/signup/interview-prep/
page.tsx
ladderly-io/src/app/(auth)/signup/research-backed/
page.tsx
ladderly-io/src/app/(auth)/signup/technical-prep/
page.tsx
ladderly-io/src/app/(auth)/signup/wellness/
page.tsx
ladderly-io/src/app/about/
page.tsx
ladderly-io/src/app/api/
ladderly-io/src/app/api/auth/
ladderly-io/src/app/api/auth/[...all]/
route.ts
ladderly-io/src/app/api/chat/
ladderly-io/src/app/api/create-checkout-session/
ladderly-io/src/app/api/trpc/
ladderly-io/src/app/api/trpc/[trpc]/
route.ts
ladderly-io/src/app/api/webhooks/
ladderly-io/src/app/api/webhooks/stripe/
route.ts
ladderly-io/src/app/blog/
2023-10-01-quality-course-and-projects.md
2023-11-25-leetcode-kata.md
2023-12-01-top-job-boards.md
2023-12-25-arias-tale.md
2024-01-20-hardware.md
2024-01-23-leetcode-solutions.md
2024-02-11-essentials-of-html.md
2024-02-12-resume-optimization.md
2024-02-16-user-settings.md
2024-04-20-hook-fundamentals.md
2024-05-31-networking-tips.md
2024-06-12-selecting-your-next-skill.md
2024-07-31-impact-accounting.md
2024-08-04-no-cover-letters.md
2025-01-20-social-networking-scripts.md
2025-01-21-ai-first-curriculum.md
2025-01-22-endorsed-communities.md
2025-02-07-ladderly-chat-ai.md
2025-02-24-behavioral-interviews.md
2025-02-25-ballparking.md
2025-03-16-benefits-of-premium.md
2025-03-30-debugging-tips.md
2025-04-05-benefits-of-mentorship.md
2025-04-06-code-quality-as-ham.md
2025-04-12-offer-negotiation.md
2025-04-13-on-content-creation.md
2025-04-18-time-management.md
2025-04-19-professional-communication.md
2025-04-20-onboarding-guide.md
2025-05-01-lsg2-learnings.md
2025-05-02-benefits-of-free.md
2025-05-03-faq.md
2025-05-10-vibe-coding-genius.md
2025-05-11-design-docs.md
2025-06-03-data-engineering-interview.md
2025-08-31-backtracking.md
blog-utils.ts
page.tsx
ladderly-io/src/app/blog/[slug]/
BlogPostContent.tsx
getBlogPost.ts
page.tsx
types.ts
ladderly-io/src/app/checklists/
ChecklistCard.tsx
ChecklistsList.tsx
PremiumLockIcon.tsx
page.tsx
ladderly-io/src/app/checklists/[idOrPrettyRoute]/
ClientChecklist.tsx
page.tsx
ladderly-io/src/app/checklists/my-premium-checklist/
ladderly-io/src/app/checklists/my-premium-checklist/components/
ladderly-io/src/app/community/
ClientCommunityPage.tsx
CommunityMemberListItem.tsx
SearchProfiles.tsx
SearchUserInformation.tsx
page.tsx
ladderly-io/src/app/community/[userId]/
page.tsx
ladderly-io/src/app/community/[userId]/certificates/
ladderly-io/src/app/community/[userId]/certificates/[certificateId]/
DownloadButton.tsx
page.tsx
print.css
ladderly-io/src/app/copilot/
page.tsx
ladderly-io/src/app/core/
utils.ts
ladderly-io/src/app/core/components/
EmailVerificationChecker.tsx
EmailVerificationModal.tsx
Form.tsx
LabeledAutocompleteField.tsx
LabeledCheckboxField.tsx
LabeledChipCollection.tsx
LabeledDateField.tsx
LabeledSelectField.tsx
LabeledTextField.tsx
LadderlyAnalytics.tsx
LadderlyPitch.tsx
LadderlyToast.tsx
LargeCard.tsx
ProviderProvider.tsx
SmallCard.tsx
VeryLargeCard.tsx
ladderly-io/src/app/core/components/icons/
Home.tsx
VerticalChevron.tsx
ladderly-io/src/app/core/components/page-wrapper/
LadderlyPageWrapper.tsx
MenuProvider.tsx
SignupPageWrapper.tsx
TopNav.tsx
TopNavLeft.tsx
TopNavRight.tsx
TopNavSubmenu.tsx
ladderly-io/src/app/core/components/pricing-grid/
PricingGrid.tsx
ReimbursmentLetterLink.tsx
StripeCheckoutButton.tsx
ladderly-io/src/app/core/theme/
ThemeContext.tsx
ThemeToggle.tsx
ladderly-io/src/app/courses/
CourseListComponent.tsx
page.tsx
ladderly-io/src/app/courses/[courseSlug]/
page.tsx
ladderly-io/src/app/courses/[courseSlug]/flashcards/
FlashcardsContent.tsx
page.tsx
ladderly-io/src/app/courses/[courseSlug]/quiz/
QuizContent.tsx
page.tsx
ladderly-io/src/app/home/
HomePageContent.tsx
HomePageSkeleton.tsx
LadderlyHelpsBlock.tsx
TestimonialBlock.tsx
ladderly-io/src/app/job-tracker/
CreateJobTrackerModal.tsx
JobSearchActiveSpan.tsx
JobSearchList.tsx
page.tsx
ladderly-io/src/app/job-tracker/[id]/
AddJobApplicationModal.tsx
JobTrackerDetails.tsx
page.tsx
ladderly-io/src/app/job-tracker/[id]/components/
AddJobPostModal.tsx
JobPostList.tsx
JobSearchTrackerEditForm.tsx
JobSearchTrackerHeader.tsx
UploadCsvModal.tsx
ladderly-io/src/app/job-tracker/[id]/graphs/
JobSearchGraphs.tsx
page.tsx
ladderly-io/src/app/job-tracker/[id]/graphs/components/
InterviewFunnelSankey.tsx
ResumeEffectivenessGraph.tsx
RoundPerformanceGraph.tsx
TimePeriodSelector.tsx
WeeklyApplicationsGraph.tsx
graphUtils.ts
ladderly-io/src/app/job-tracker/job-post/
ladderly-io/src/app/job-tracker/job-post/[id]/
AddJobSearchStepForm.tsx
EditJobPostForm.tsx
JobPostDetails.tsx
JobStepsSection.tsx
page.tsx
ladderly-io/src/app/journal/
CreateJournalEntryForm.tsx
DeepJournalingWaitlist.tsx
HappinessSlider.tsx
JournalEntryList.tsx
PracticeSection.tsx
RecentChecklists.tsx
ReminderSettings.tsx
StoryGenerator.tsx
WeeklyEntryCountIndicator.tsx
page.tsx
schemas.ts
ladderly-io/src/app/journal/feed/
PublicJournalFeed.tsx
page.tsx
ladderly-io/src/app/journal/happiness-graph/
HappinessChart.tsx
page.tsx
ladderly-io/src/app/leetcode-tool/
CompletionStatusFilter.tsx
DifficultyFilter.tsx
LeetCodeFilterControl.tsx
LeetCodeList.tsx
PatternFilterControl.tsx
PatternNameFilter.tsx
RandomProblemRecommendation.tsx
SearchControl.tsx
page.tsx
ladderly-io/src/app/mobile-menu/
MobileMenuContent.tsx
MobileMenuDropdowns.tsx
page.tsx
ladderly-io/src/app/perks/
page.tsx
ladderly-io/src/app/privacy-policy/
page.tsx
ladderly-io/src/app/settings/
page.tsx
schemas.ts
ladderly-io/src/app/settings/components/
CountryDropdown.tsx
SettingsForm.tsx
SettingsFormWrapper.tsx
USStateDropdown.tsx
ladderly-io/src/app/settings/email-preferences/
page.tsx
ladderly-io/src/app/settings/email-preferences/components/
EmailPreferencesFormWrapper.tsx
ladderly-io/src/app/verify-email/
page.tsx
ladderly-io/src/pages/
ladderly-io/src/pages/api/
send-journal-reminders.ts
ladderly-io/src/server/
auth-client.ts
better-auth.ts
constants.ts
db.ts
schemas.ts
ladderly-io/src/server/actions/
ladderly-io/src/server/api/
root.ts
trpc.ts
ladderly-io/src/server/api/routers/
auth.ts
certificate.ts
chat.ts
checklist.ts
course.ts
journal.ts
quiz.ts
user.ts
ladderly-io/src/server/api/routers/jobSearch/
csv.helpers.ts
csv.router.ts
jobPost.router.ts
jobStep.router.ts
router.ts
schemas.ts
ladderly-io/src/server/mailers/
forgotPasswordMailer.ts
journalReminderMailer.ts
utils.ts
verifyEmailMailer.ts
ladderly-io/src/server/utils/
rateLimit.ts
ladderly-io/src/styles/
Home.module.css
globals.css
ladderly-io/src/trpc/
query-client.ts
react.tsx
server.ts
ladderly-io/src/types/
ladderly-io/tests/
middleware.test.ts
setup.tsx
ladderly-io/tests/app/
page.test.tsx
ladderly-io/tests/app/(auth)/
schemas.test.ts
ladderly-io/tests/app/(auth)/components/
LoginForm.test.tsx
ladderly-io/tests/app/api/
ladderly-io/tests/app/api/webhooks/
ladderly-io/tests/app/api/webhooks/stripe/
route.test.ts
ladderly-io/tests/app/blog/
page.test.tsx
ladderly-io/tests/app/blog/[slug]/
BlogPostContent.test.tsx
page.test.tsx
ladderly-io/tests/app/community/
ClientCommunityPage.test.tsx
ladderly-io/tests/app/core/
utils.test.ts
ladderly-io/tests/app/core/components/
EmailVerificationChecker.test.tsx
EmailVerificationModal.test.tsx
LabeledCheckboxField.test.tsx
LabeledDateField.test.tsx
LabeledTextField.test.tsx
ladderly-io/tests/app/core/components/page-wrapper/
TopNavRight.test.tsx
ladderly-io/tests/app/core/components/pricing-grid/
PricingGrid.test.tsx
ladderly-io/tests/app/courses/
ladderly-io/tests/app/courses/[courseSlug]/
ladderly-io/tests/app/courses/[courseSlug]/quiz/
QuizContent.test.tsx
ladderly-io/tests/app/home/
HomePageContent.test.tsx
ladderly-io/tests/coverage/
base.css
block-navigation.js
coverage-final.json
favicon.png
index.html
prettify.css
prettify.js
sort-arrow-sprite.png
sorter.js
ladderly-io/tests/coverage/ladderly-io/
.eslintrc.cjs.html
index.html
next-env.d.ts.html
next.config.js.html
postcss.config.cjs.html
prettier.config.ts.html
tailwind.config.ts.html
vitest.config.ts.html
ladderly-io/tests/coverage/ladderly-io/prisma/
index.html
seedCoursesAndFlashcards.ts.html
seeds.ts.html
ladderly-io/tests/coverage/ladderly-io/prisma/seed-utils/
index.html
seedCourses.ts.html
seedFlashcards.ts.html
seedLeetcodeChecklist.ts.html
seedPractices.ts.html
seedVotables.ts.html
updateChecklists.ts.html
ladderly-io/tests/coverage/ladderly-io/src/
env.js.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/
index.html
layout.tsx.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/
index.html
schemas.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/components/
LoginForm.tsx.html
SignupForm.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/forgot-password/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/login/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/reset-password/
ResetPasswordClientPageClient.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/signup/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/signup/interview-prep/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/signup/research-backed/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/signup/technical-prep/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/(auth)/signup/wellness/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/about/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/api/
ladderly-io/tests/coverage/ladderly-io/src/app/api/auth/
ladderly-io/tests/coverage/ladderly-io/src/app/api/auth/[...nextauth]/
index.html
route.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/api/trpc/
ladderly-io/tests/coverage/ladderly-io/src/app/api/trpc/[trpc]/
index.html
route.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/api/webhooks/
ladderly-io/tests/coverage/ladderly-io/src/app/api/webhooks/stripe/
index.html
route.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/blog/
blog-utils.ts.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/blog/[slug]/
BlogPostContent.tsx.html
getBlogPost.ts.html
index.html
page.tsx.html
types.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/checklists/
ChecklistCard.tsx.html
ChecklistsList.tsx.html
PremiumLockIcon.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/checklists/[idOrPrettyRoute]/
ClientChecklist.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/community/
ClientCommunityPage.tsx.html
CommunityMemberListItem.tsx.html
SearchProfiles.tsx.html
SearchUserInformation.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/community/[userId]/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/community/[userId]/certificates/
ladderly-io/tests/coverage/ladderly-io/src/app/community/[userId]/certificates/[certificateId]/
DownloadButton.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/copilot/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/core/
index.html
utils.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/core/components/
Form.tsx.html
LabeledAutocompleteField.tsx.html
LabeledCheckboxField.tsx.html
LabeledChipCollection.tsx.html
LabeledDateField.tsx.html
LabeledSelectField.tsx.html
LabeledTextField.tsx.html
LadderlyAnalytics.tsx.html
LadderlyPitch.tsx.html
LadderlyToast.tsx.html
LargeCard.tsx.html
ProviderProvider.tsx.html
SmallCard.tsx.html
VeryLargeCard.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/core/components/icons/
Home.tsx.html
VerticalChevron.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/core/components/page-wrapper/
LadderlyPageWrapper.tsx.html
MenuProvider.tsx.html
SignupPageWrapper.tsx.html
TopNav.tsx.html
TopNavLeft.tsx.html
TopNavRight.tsx.html
TopNavSubmenu.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/core/components/pricing-grid/
PricingGrid.tsx.html
ReimbursmentLetterLink.tsx.html
StripeCheckoutButton.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/core/theme/
ThemeContext.tsx.html
ThemeToggle.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/courses/
CourseListComponent.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/courses/[courseSlug]/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/courses/[courseSlug]/flashcards/
FlashcardsContent.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/courses/[courseSlug]/quiz/
QuizContent.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/home/
HomePageContent.tsx.html
HomePageSkeleton.tsx.html
LadderlyHelpsBlock.tsx.html
TestimonialBlock.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/job-tracker/
CreateJobTrackerModal.tsx.html
JobSearchActiveSpan.tsx.html
JobSearchList.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/job-tracker/[id]/
AddJobApplicationModal.tsx.html
JobTrackerDetails.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/job-tracker/[id]/components/
AddJobPostModal.tsx.html
JobPostList.tsx.html
JobSearchTrackerEditForm.tsx.html
JobSearchTrackerHeader.tsx.html
UploadCsvModal.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/job-tracker/[id]/graphs/
JobSearchGraphs.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/job-tracker/[id]/graphs/components/
InterviewFunnelSankey.tsx.html
ResumeEffectivenessGraph.tsx.html
RoundPerformanceGraph.tsx.html
TimePeriodSelector.tsx.html
WeeklyApplicationsGraph.tsx.html
graphUtils.ts.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/job-tracker/job-post/
ladderly-io/tests/coverage/ladderly-io/src/app/job-tracker/job-post/[id]/
AddJobSearchStepForm.tsx.html
EditJobPostForm.tsx.html
JobPostDetails.tsx.html
JobStepsSection.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/journal/
CreateJournalEntryForm.tsx.html
DeepJournalingWaitlist.tsx.html
HappinessSlider.tsx.html
JournalEntryList.tsx.html
PracticeSection.tsx.html
ReminderSettings.tsx.html
StoryGenerator.tsx.html
WeeklyEntryCountIndicator.tsx.html
index.html
page.tsx.html
schemas.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/journal/feed/
PublicJournalFeed.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/journal/happiness-graph/
HappinessChart.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/leetcode-tool/
CompletionStatusFilter.tsx.html
DifficultyFilter.tsx.html
LeetCodeFilterControl.tsx.html
LeetCodeList.tsx.html
PatternFilterControl.tsx.html
PatternNameFilter.tsx.html
RandomProblemRecommendation.tsx.html
SearchControl.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/mobile-menu/
MobileMenuContent.tsx.html
MobileMenuDropdowns.tsx.html
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/perks/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/privacy-policy/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/settings/
index.html
page.tsx.html
schemas.ts.html
ladderly-io/tests/coverage/ladderly-io/src/app/settings/components/
CountryDropdown.tsx.html
SettingsForm.tsx.html
SettingsFormWrapper.tsx.html
USStateDropdown.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/app/settings/email-preferences/
index.html
page.tsx.html
ladderly-io/tests/coverage/ladderly-io/src/app/settings/email-preferences/components/
EmailPreferencesFormWrapper.tsx.html
index.html
ladderly-io/tests/coverage/ladderly-io/src/pages/
ladderly-io/tests/coverage/ladderly-io/src/pages/api/
index.html
send-journal-reminders.ts.html
ladderly-io/tests/coverage/ladderly-io/src/server/
LadderlyMigrationAdapter.ts.html
auth.ts.html
constants.ts.html
db.ts.html
index.html
schemas.ts.html
ladderly-io/tests/coverage/ladderly-io/src/server/api/
index.html
root.ts.html
trpc.ts.html
ladderly-io/tests/coverage/ladderly-io/src/server/api/routers/
auth.ts.html
certificate.ts.html
chat.ts.html
checklist.ts.html
course.ts.html
index.html
journal.ts.html
quiz.ts.html
user.ts.html
ladderly-io/tests/coverage/ladderly-io/src/server/api/routers/jobSearch/
csv.helpers.ts.html
csv.router.ts.html
index.html
jobPost.router.ts.html
jobStep.router.ts.html
router.ts.html
schemas.ts.html
ladderly-io/tests/coverage/ladderly-io/src/server/mailers/
forgotPasswordMailer.ts.html
index.html
journalReminderMailer.ts.html
utils.ts.html
ladderly-io/tests/coverage/ladderly-io/src/server/utils/
index.html
rateLimit.ts.html
ladderly-io/tests/coverage/ladderly-io/src/trpc/
index.html
query-client.ts.html
react.tsx.html
server.ts.html
ladderly-io/tests/factories/
userFactory.ts
ladderly-io/tests/integration/
auth.integration.test.ts
ladderly-io/tests/server/
ladderly-io/tests/server/api/
ladderly-io/tests/server/api/routers/
user.test.ts
ladderly-io/tests/server/mailers/
verifyEmailMailer.test.ts
node_modules/

## Agent skills, rules, and repository scope

- **Project skills** for this repository live under **`.claude/skills/<skill-name>/SKILL.md`**. The team can commit them so everyone shares the same agent workflows; Cursor (and compatible tools) also load these paths.
- **Rule and skill change requests are repo-local by default:** When the user asks to add or change a rule, skill, or how the agent should behave, apply edits **only inside this repository** (for example `.claude/skills/`, and project `.cursor/` only if they want Cursor-specific config checked in). Do **not** add or change files under home-directory paths (e.g. `~/.cursor/`, `~/.claude/`) or anywhere outside the clone unless the user **explicitly** requests a global or user-level install.
- **Git and GitHub writes:** Follow the project skill **`deny-default-git-writes`** (`.claude/skills/deny-default-git-writes/SKILL.md`): do not run agent-driven `git commit`, `git push`, or history-mutating git commands, or equivalent `gh` operations, unless the user clearly asks for that in the current message. Read-only commands are fine. Some skills add a **narrow `gh` allowlist** (e.g. `match-or-create-github-issue`); when those apply, follow the skill; they do not allow commits or push by default.

Other Rules:

- Prefer `getServerAuthSession` on server components over using `useSession` on client components where possible.
