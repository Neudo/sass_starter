# Hector Analytics

Hector Analytics is a lightweight web analytics SaaS for small teams that need to understand which traffic, pages, funnels, and events create meaningful outcomes.

The project is in a refactor phase. The product should move away from generic "privacy-first Google Analytics alternative" positioning and toward clearer conversion-oriented analytics for founders, consultants, agencies, SEO/content teams, and privacy-conscious businesses.

Read [docs/product-context.md](docs/product-context.md) before major feature, SEO, or landing page work.

## Stack

- Next.js App Router
- Supabase
- shadcn/ui and Radix UI
- Tailwind CSS v4
- Resend
- Stripe

## Development

```bash
pnpm dev
```

The development server runs on [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```

## Lint

```bash
pnpm lint
```

## Environment

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
OPENAI_API_KEY=
```

Optional:

```bash
OPENAI_CONTENT_MODEL=
CONTENT_GENERATION_API_KEY=
STRIPE_SECRET_KEY=
```

## Key Areas

- `app/api/track/route.ts`: analytics tracking endpoint.
- `public/script.js`: production tracking script.
- `components/SiteData/`: analytics dashboard components.
- `components/home-page.tsx`: landing page composition.
- `app/api/generate-content/route.ts`: internal editorial content endpoint.
