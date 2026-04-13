# Tabby — Technical Challenge

## Background

You've inherited this codebase. **Tabby** is a community management platform for affordable housing organizations. It tracks residents, events, and compliance requirements across multiple housing communities.

The app is built with:

- **Next.js 16** (App Router, React 19, TypeScript)
- **SQLite** via `better-sqlite3` (data stored in `main.db`)
- **Tailwind CSS** for styling

The database schema is defined in `database/init.sql`. The app has API routes under `app/api/` and pages for a dashboard, residents, events, and compliance tracking.

## Setup

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# The app will be available at http://localhost:3000
```

The database (`main.db`) is pre-populated with test data. You should not need to run any database setup.

## Your Tasks

You have **three tasks** to complete. You are not expected to finish everything — focus on quality over quantity. Your choices about what to prioritize matter as much as the work itself.

### Task 1: Data Ingestion

Two external data files are in the `data/` directory:

- **`new_residents.csv`** — A CSV file of new resident records from a partner organization. The data is messy.
- **`compliance_report.pdf`** — A compliance fulfillment report from a partner. Contains tabular data that should be reconciled with existing records.

Ingest as much of this data as you can into the application's database. You are **not expected to complete both files**. Use whatever tools, languages, or libraries you want — but explain your approach.

### Task 2: Bug Fixes

The application has bugs — some obvious, some subtle. Find and fix as many as you can. The bugs span the full stack: frontend rendering, API logic, database queries, and data integrity.

### Task 3: Documentation

Create a `SOLUTION.md` file in the project root documenting:

1. **Bugs found and fixed** — What was broken, why, and how you fixed it. Explain the root cause, not just the symptom.
2. **Data ingestion approach** — What you did, what tools you used, and what decisions you made about edge cases.
3. **Next steps** — If you had more time, what would you work on next? What architectural or code quality improvements would you make?

## Guidelines

- Use whatever tools, libraries, or languages you want. If you use something, explain how it works.
- Quality of fixes matters more than quantity. A well-explained fix for a hard bug is worth more than five shallow fixes.
- We're evaluating your ability to navigate an unfamiliar codebase, reason about systems, and communicate clearly.
- Commit your work as you go. Your commit history is part of your submission.
