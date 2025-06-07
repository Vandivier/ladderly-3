# Ladderly.io

The [Ladderly.io](https://ladderly.io/) is an open source web app, offline tools, and community designed to help individuals accelerate tech career progression.

## Getting Started

First, review [docs/SETUP.md](https://github.com/Vandivier/ladderly-3/blob/main/docs/SETUP.md).

Then, install, seed, and run your app in the development mode.

```bash
cd ladderly-io
npm i
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app!

## Tests

Runs your tests using Jest.

```bash
npm run dev
```

## Production

The app will run locally without `POSTMARK_API_KEY` and several other environment variables, but it's highly recommended to populate all of these values in production since absence of these values can severely degrade user experience.
