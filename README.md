
# ****Ladderly****

## About

The Ladderly Ecosystem is a community, a set of tools, and an educational program designed to help individuals learn to code and accelerate tech career progression. Check out these other repos for more information:
1. [ladderly-slides](https://github.com/Vandivier/ladderly-slides)
2. [rect](https://github.com/Vandivier/rect)
3. [redyellowgreen](https://github.com/Vandivier/redyellowgreen)

## Getting Started

Run your app in the development mode.

```
blitz dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Recommended Tools

This app uses Tailwind, so we encourage you to install the Tailwind CSS IntelliSense VS Code plugin.

## Environment Variables

Ensure the `.env.local` file has required environment variables:

```
DATABASE_URL=postgresql://<YOUR_DB_USERNAME>@localhost:5432/ladderly-3
```

Ensure the `.env.test.local` file has required environment variables:

```
DATABASE_URL=postgresql://<YOUR_DB_USERNAME>@localhost:5432/ladderly-3_test
```

## Tests

Runs your tests using Jest.

```
yarn test
```

Blitz comes with a test setup using [Vitest](https://vitest.dev/) and [react-testing-library](https://testing-library.com/).

### Built With

1. [**Blitz.js**](https://blitzjs.com)
2. **ESLint**: It lints your code: searches for bad practices and tell you about it. You can customize it via the `.eslintrc.js`, and you can install (or even write) plugins to have it the way you like it. It already comes with the [`blitz`](https://github.com/blitz-js/blitz/tree/canary/packages/eslint-config) config, but you can remove it safely. [Learn More](https://blitzjs.com/docs/eslint-config).
3. **Husky**: It adds [githooks](https://git-scm.com/docs/githooks), little pieces of code that get executed when certain Git events are triggerd. For example, `pre-commit` is triggered just before a commit is created. You can see the current hooks inside `.husky/`. If are having problems commiting and pushing, check out ther [troubleshooting](https://typicode.github.io/husky/#/?id=troubleshoot) guide. [Learn More](https://blitzjs.com/docs/husky-config).
4. **Prettier**: It formats your code to look the same everywhere. You can configure it via the `.prettierrc` file. The `.prettierignore` contains the files that should be ignored by Prettier; useful when you have large files or when you want to keep a custom formatting. [Learn More](https://blitzjs.com/docs/prettier-config).

