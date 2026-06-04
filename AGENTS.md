# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Hector Analytics is a lightweight web analytics SaaS built with Next.js and Supabase.

The current product is being refactored away from a generic "privacy-first Google Analytics alternative" positioning. Privacy, no-cookie tracking, and GDPR-friendly analytics remain important constraints, but they should not be treated as the whole product story.

The stronger direction is conversion-oriented analytics for small teams: help founders, consultants, agencies, SEO/content teams, and privacy-conscious businesses understand which pages, sources, funnels, and events lead to meaningful outcomes.

Durable product context lives in `docs/product-context.md`. Read it before major feature, SEO, or landing page work.

## Essential Commands

```bash
# Development
pnpm dev          # Start development server with Turbopack on http://localhost:3000

# Build & Production
pnpm build        # Create production build
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint checks (currently maps to next lint)
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js with App Router
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui components with Radix UI
- **Styling**: Tailwind CSS v4 with CSS variables
- **Auth**: Supabase Auth with cookie-based sessions
- **Email**: Resend API
- **Forms**: React Hook Form + Zod validation

### Project Structure

```
app/                    # Next.js App Router pages
├── api/track/         # Analytics tracking endpoint
├── auth/              # Authentication flows
├── dashboard/[domain]/ # Domain-specific analytics dashboard
└── (marketing pages)   # Public pages

components/
├── ui/                # shadcn/ui reusable components
├── SiteData/          # Analytics visualization components
└── auth-*.tsx         # Authentication forms

lib/
├── supabase/          # Supabase client configurations
│   ├── client.ts      # Browser client
│   ├── server.ts      # Server client (RSC)
│   └── admin.ts       # Service role client
└── geo.ts             # IP geolocation utilities
```

### Key Patterns

#### Supabase Client Usage

- Use `createClient()` from `lib/supabase/server.ts` in Server Components
- Use `createClient()` from `lib/supabase/client.ts` in Client Components
- Use `createAdminClient()` from `lib/supabase/admin.ts` for admin operations

#### Authentication Flow

- All dashboard routes require authentication via middleware
- Session handled through cookies (no JWT in localStorage)
- Auth forms use Server Actions for form submission

#### Analytics Tracking

- Privacy-first: No cookies used
- Tracking script: `/public/script.js`
- API endpoint: `/api/track` handles session upserts
- Geolocation via MaxMind GeoIP2 database

#### SEO and Content

- Do not recreate the old clone-style automated content workflow.
- `app/api/generate-content/route.ts` is an internal editorial aid, not an autopublishing engine.
- Content should be built around clear search intent and product use cases: conversion, source quality, funnels, lead attribution, landing page performance, client reporting, and no-cookie event tracking.
- Avoid generic "alternative to Google Analytics" pages unless there is a specific buyer question being answered.

### Database Schema (Key Tables)

- `sites` - Website configurations
- `sessions` - Analytics data with geolocation
- `waitlist` - Email signups

### Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
OPENAI_API_KEY=
```

Optional:

```
OPENAI_CONTENT_MODEL=
CONTENT_GENERATION_API_KEY=
STRIPE_SECRET_KEY=
```

### Component Guidelines

- UI components use shadcn/ui patterns (found in `components/ui/`)
- Forms use React Hook Form with Zod schemas
- All components are TypeScript with proper typing
- Use `cn()` utility for className merging

### Styling

- Tailwind CSS v4 with CSS-first configuration
- Theme variables defined in `app/globals.css`
- Dark/light mode via next-themes
- Primary brand color: #3d9dbd (blue)

### Refont Landing Page Guidance

- Show the actual product or a credible product surface in the first viewport.
- Lead with operational value: understand what turns traffic into outcomes.
- Do not build a generic hero plus feature-card clone.
- Keep privacy as proof and constraint, not the only headline.
- Prefer concrete workflows: install script, define events, inspect pages/sources/funnels, report outcomes.
