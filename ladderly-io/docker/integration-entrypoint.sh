#!/usr/bin/env bash

# Starts a local Postgres instance, launches the Next.js app, and executes the
# integration test suite against the running service. Designed to be the
# entrypoint for Dockerfile.integration_tests.

set -euo pipefail

DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-ladderly_io_test}
DB_PORT=${DB_PORT:-5432}
APP_PORT=${APP_PORT:-3000}
APP_HOST=${APP_HOST:-0.0.0.0}
TEST_COMMAND=${INTEGRATION_TEST_COMMAND:-"npm run test:integration"}

export DATABASE_URL=${DATABASE_URL:-"postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"}
export APP_ORIGIN=${APP_ORIGIN:-"http://127.0.0.1:${APP_PORT}"}

function wait_for_db() {
  echo "Waiting for database at ${DB_HOST}:${DB_PORT} to become available..."
  until PGPASSWORD="${DB_PASSWORD}" pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" >/dev/null 2>&1; do
    sleep 1
  done

  echo "Database ready; ensuring '${DB_NAME}' exists"
  PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
    -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
    || PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
      -c "CREATE DATABASE ${DB_NAME};"
}

function start_app() {
  echo "Resetting database and syncing Prisma schema..."
  npx prisma db push --force-reset --skip-generate

  echo "Building Next.js app"
  npm run build

  echo "Starting Next.js app on ${APP_HOST}:${APP_PORT}"
  npm run start -- --hostname "${APP_HOST}" --port "${APP_PORT}" &
  APP_PID=$!

  echo "Waiting for app to become available..."
  until curl -sf "${APP_ORIGIN}" >/dev/null 2>&1; do
    if ! kill -0 "${APP_PID}" >/dev/null 2>&1; then
      echo "Next.js process exited unexpectedly"
      wait "${APP_PID}"
      exit 1
    fi
    sleep 1
  done

  echo "App is up (PID ${APP_PID})"

  # Seed test user via API (must happen after server is running)
  echo "Seeding integration test user via API..."
  node --experimental-strip-types scripts/seedIntegrationTestUser.ts

  echo "Running integration tests"
  trap 'kill "${APP_PID}" >/dev/null 2>&1 || true' EXIT HUP INT TERM

  # Execute the test command.
  bash -c "${TEST_COMMAND}"

  echo "Tests complete; shutting down app"
  kill "${APP_PID}" >/dev/null 2>&1 || true
  wait "${APP_PID}" >/dev/null 2>&1 || true
}

wait_for_db
start_app

