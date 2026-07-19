# video-sharing-app

English | [日本語](./README.ja.md)

<!-- Keep this file in sync when README.ja.md is updated. -->

## Overview

A browser-based video sharing application. The goal is to let users upload videos and play them back from a list.

### Key Features (planned)

- Video upload
- Video listing & playback
- User authentication (Supabase Auth)

## Tech Stack

| Category | Technology | Version |
| --- | --- | --- |
| Language | TypeScript | 5.x |
| Framework | Next.js (App Router) | 16.x |
| API Layer | tRPC (+ TanStack Query) | 11.x |
| Auth & Database | Supabase (Auth / PostgreSQL) | - |
| ORM | Drizzle ORM | - |
| Video Platform | Mux (upload / encoding / playback) | - |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | - |
| Unit & Integration Tests | Vitest | - |
| E2E Tests | Playwright | - |
| Package Manager | pnpm | 11.x |
| CI/CD | GitHub Actions | - |
| Deployment | Vercel | - |

<!-- Sync versions with the actual values after scaffolding -->

## Architecture (Video Upload & Playback)

Video files are uploaded directly from the browser to Mux (Direct Upload), and after encoding they are streamed back from Mux over HLS. Video metadata (title, Mux Playback ID, etc.) is stored in Supabase PostgreSQL. Next.js provides the UI and Route Handlers (issuing upload URLs, receiving Mux webhooks, etc.). The client-server API is defined with tRPC for end-to-end type safety. Database access goes through Drizzle ORM, with authorization checks performed in tRPC procedures.

```
[Browser] ──video upload (Direct Upload)──→ [Mux]
    │ ←──streaming playback (HLS)────────────┘
    │                                        │
    ├─ auth ──────────→ [Supabase Auth]      │ webhooks (encoding complete, etc.)
    └─ pages & API ───→ [Next.js] ←──────────┘
                           └─ metadata read/write → [Supabase PostgreSQL]
```

## Directory Structure

```
.
├── .github/             # PR template & CI workflows
├── e2e/                 # Playwright E2E tests
├── public/              # Static files
├── src/
│   ├── app/
│   │   ├── page.tsx             # / → redirect to /videos
│   │   ├── (main)/              # Main layout (sidebar + header)
│   │   │   ├── videos/          # Public video list
│   │   │   └── my-videos/       # Video management (auth required)
│   │   ├── (player)/            # Player layout
│   │   │   └── videos/[videoId]/  # Video playback page
│   │   └── api/
│   │       ├── trpc/[trpc]/     # tRPC endpoint (fetch adapter)
│   │       └── webhooks/mux/    # Mux webhook handler
│   ├── components/      # Shared components
│   │   └── ui/          # shadcn/ui generated components
│   ├── constants/       # Constants
│   ├── db/              # Drizzle schema & DB connection
│   ├── lib/             # Supabase / Mux clients, etc.
│   ├── proxy.ts         # Session refresh & auth redirect (Supabase Auth)
│   ├── trpc/            # tRPC init, routers, client/server proxies
│   └── types/           # Shared types not going through tRPC
├── drizzle.config.ts    # Drizzle Kit configuration
├── next.config.ts       # Next.js configuration
├── package.json
└── tsconfig.json
```

## Setup

Requirements: Node.js 24+ / pnpm 11+

```bash
pnpm install   # Install dependencies
pnpm dev       # Start the dev server
```

Environment variables go in `.env.local`.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `DATABASE_URL` | Supabase PostgreSQL connection string (Transaction pooler) |

Mux variables will be added when the integration is implemented.

## Development Commands

Run everything from the repository root.

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run unit & integration tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm lint` | Run linter |
| `pnpm format` | Format code |

## Dev Server URL

http://localhost:3000
