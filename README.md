# video-sharing-app

English | [日本語](./README.ja.md)

<!-- Keep this file in sync when README.ja.md is updated. -->

## Overview

A simple video-sharing app where you can upload and play videos. Sign in to post videos and watch them from the list.

### Demo

https://video-sharing-app-sand.vercel.app

- Browsing and playing videos requires no sign-in
- Sign up to try uploading and managing videos
- This is a test deployment; posted data may be deleted without notice
- The app runs on free plans, so the number of uploads is limited and it may be temporarily unavailable

### Key Features

- Video listing & playback
- Video upload
- Video management (listing, editing, multi-select deletion)
- User authentication (sign-up / sign-in)

### Screenshots

| Video list | Playback |
| --- | --- |
| ![Video list](docs/screenshots/videos.png) | ![Playback](docs/screenshots/player.png) |

| Video management | Video upload |
| --- | --- |
| ![Video management](docs/screenshots/my-videos.png) | ![Video upload](docs/screenshots/upload-dialog.png) |

## Tech Stack

| Category | Technology | Version |
| --- | --- | --- |
| Language | TypeScript | 5.x |
| Framework | Next.js (App Router) | 16.x |
| API Layer | tRPC (+ TanStack Query) | 11.x |
| Auth & Database | Supabase (Auth / PostgreSQL) | - |
| ORM | Drizzle ORM | 0.45.x |
| Video Platform | Mux (upload / encoding / playback) | - |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | - |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Unit & Integration Tests | Vitest + Testing Library | 4.x / 16.x |
| E2E Tests | Playwright | 1.x |
| Package Manager | pnpm | 11.x |
| CI/CD | GitHub Actions | - |
| Deployment | Vercel | - |

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
├── docs/                # Screenshots
├── drizzle/             # DB migration files
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
│   │   ├── auth/callback/       # Auth callback endpoint (Supabase Auth)
│   │   └── api/
│   │       ├── trpc/[trpc]/     # tRPC endpoint (fetch adapter)
│   │       └── webhooks/mux/    # Mux webhook handler
│   ├── components/      # Shared components
│   │   ├── auth/        # Authentication
│   │   ├── layout/      # Layout (sidebar, header, etc.)
│   │   ├── videos/      # Videos
│   │   └── ui/          # shadcn/ui generated components
│   ├── constants/       # Constants
│   ├── db/              # Drizzle schema & DB connection
│   ├── hooks/           # Shared hooks
│   ├── lib/             # Supabase / Mux clients, etc.
│   ├── proxy.ts         # Session refresh & auth redirect (Supabase Auth)
│   ├── trpc/            # tRPC init, routers, client/server proxies
│   └── types/           # Shared types not going through tRPC
├── drizzle.config.ts    # Drizzle Kit configuration
├── next.config.ts       # Next.js configuration
├── playwright.config.ts # Playwright configuration
├── vitest.config.mts    # Vitest configuration
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
| `MUX_TOKEN_ID` | Mux access token ID |
| `MUX_TOKEN_SECRET` | Mux access token secret |
| `MUX_WEBHOOK_SECRET` | Mux webhook signing secret |
| `MUX_UPLOAD_CORS_ORIGIN` | Origin allowed to upload (defaults to `*` when unset; set the production URL in production) |

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
| `pnpm db:generate` | Generate migration files (Drizzle Kit) |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Launch Drizzle Studio |

## Dev Server URL

http://localhost:3000

---

⭐ If you found this project helpful, I would really appreciate a star.
