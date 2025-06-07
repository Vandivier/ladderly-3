# Setup

This document will guide you through the process of setting up your local development environment for ladderly.io.

First, install packages and dependencies. We recommend using Node.js version 22.x+.

```bash
cd ladderly-io
npm i
```

Secondly, create a database in Supabase and obtain the pooler connection string-literal. You are going to need it in the next steps. The connection string is composed of named substrings which have values that might look like:

```text
host:       aws-0-us-west-1.pooler.supabase.com
db:         postgres
port:       5432
user:       postgres.zrpwqlogwfcxwcuyfnmd
password:   [PASSWORD_WITHOUT_SQUARE_BRACKETS]
```

Thirdly, copy .env to .env.local and provide the connection-string value to the key `DATABASE_URL`

```text
DATABASE_URL=postgres://postgres.zrpwqlogwfcxwcuyfnmd:[PASSWORD_WITHOUT_SQUARE_BRACKETS]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

Only the `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` keys in the .env file are required. Other keys are optional.

Fourth, generate tables and columns in your Supabase Postgres database.

```bash
npx prisma generate
npx prisma db push
```

Now you can run the app locally!

```bash
npm run dev
```

## FAQ

**Q: I want to setup local development environment with local database.**
**A:** For local database to work, you are may need to configure a local postgres pooler. There is currently no supported path for this. Instead, it is recommended to use a cloud Postgres instance, and Ladderly particularly recommends [Supabase](https://supabase.com/).

**Q: Where can I find more information on creating the database on supabase?**
**A:** Find more information about this here <https://supabase.com/docs/guides/database/overview>

## Other Troubleshooting Tips

### **Unable to connect to supabase postgres database**

Make sure the connection string literal has no typos in it.
Make sure the password is correct and you don't have any braces after the colon `:`
If you just created the db at Supabase, give it about 45 minutes to propagate.
