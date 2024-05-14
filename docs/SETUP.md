# Ladderly.

This document will guide you through the process of setting up your local development environment for ladderly.io.

## Setup

1. Install packages and dependencies.

```
npm i
```

2. Create a database in Supabase and gather connection string-literal. You are going to need it in the next steps.

```
host:       aws-0-us-west-1.pooler.supabase.com
db:         postgres
port:       5432
user:       postgres.zrpwqlogwfcxwcuyfnmd
password:   [PASSWORD_WITHOUT_SQUARE_BRACKETS]
```

3. Create copy .env to .env.local and provide the connection-string value to the key `DATABASE_URL`

```
DATABASE_URL=postgres://postgres.zrpwqlogwfcxwcuyfnmd:[PASSWORD_WITHOUT_SQUARE_BRACKETS]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

4. Generate tables and columns in your Supabase Postgres database.

```
npx blitz prisma generate
npx blitz prisma migrate dev
```

5. Run the app locally.

```
npx blitz dev
```

## FAQ.

**Q: I want to setup local development environment with local database.**
**A:** For local database to work, you are going to have to setup pooler. In the absence of the pooler setup, it is recommended to use cloud (Supabase) Postgres db.

**Q: Where can I find more information on creating the database on supabase?**
**A:** Find more information about this here https://supabase.com/docs/guides/database/overview

## Troubleshooting.

- **Unable to connect to supabase postgres database**
  Make sure the connection string literal has no typos in it.
  Make sure the password is correct and you don't have any braces after the colon `:`
  If you just created the db at Supabase, give it about 45 minutes to propagate.
