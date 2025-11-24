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
npm run test
```

## Integration Testing

Integration tests are run via Docker Compose with a Supabase Postgres container plus the app/test runner. Secrets from your local `.env` are not sent to Docker.

```bash
cd ladderly-io
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f docker/docker-compose.integration.yml build
docker compose -f docker/docker-compose.integration.yml up --abort-on-container-exit
```

If you have an issue creating your container, you might want to try breaking the Docker cache when you build again:

```bash
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f docker/docker-compose.integration.yml build --no-cache
```

Compose will:

- Start `supabase/postgres`, exposing it on `${DB_PORT:-5432}` (customize via env).
- Build the integration image (`Dockerfile.integration_tests`) and run `docker/integration-entrypoint.sh`.
- Wait for the DB to be healthy, run Prisma migrations, build Next.js, serve it on `${APP_PORT:-3000}`, then execute `${INTEGRATION_TEST_COMMAND:-npm run test}`.
- By default the test runner executes `npm run test:integration`, which targets the specs under `tests/integration`.

Logs stream in real time; when tests finish, `docker compose down` to clean up. Add `-d` if you want the stack to continue running for manual probing.

## Production

The app will run locally without `POSTMARK_API_KEY` and several other environment variables, but it's highly recommended to populate all of these values in production since absence of these values can severely degrade user experience.
