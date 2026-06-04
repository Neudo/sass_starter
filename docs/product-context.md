# Hector Analytics - Product Context

## What Hector Does

Hector Analytics is a lightweight web analytics SaaS for people who need to understand site performance without turning analytics into an enterprise project.

The product tracks visits, sources, pages, geography, devices, active visitors, funnels, and custom events. It is designed around a cookie-free script, Supabase-backed dashboards, and a simple installation flow.

## Current Reset

The project is entering a refactor phase.

The previous direction leaned too heavily on the same category framing as other privacy-first analytics tools: "alternative to Google Analytics", "cookie-free", "GDPR compliant", "simple dashboard". That framing is true, but it is not enough to create a distinct product or strong SEO surface.

The refactor should move Hector away from being a clone of existing privacy analytics products and toward a sharper use case:

- Help site owners identify which traffic creates decisions, leads, signups, or sales.
- Make acquisition quality easier to understand than in Google Analytics.
- Give small teams a clean view of pages, sources, funnels, and events without requiring analytics expertise.
- Keep privacy and no-cookie tracking as product constraints, not the whole value proposition.

## Target Users

Primary users:

- Solo founders and small SaaS teams.
- Freelancers and consultants who manage websites for clients.
- SEO and content teams that need clearer traffic and conversion signals.
- Privacy-conscious businesses that still need actionable performance data.

Secondary users:

- Bloggers and publishers.
- Small e-commerce teams.
- Agencies that want client-friendly analytics dashboards.

## Product Positioning To Explore

Stronger directions than "privacy-first alternative":

- Analytics for understanding why traffic does or does not convert.
- Simple source and funnel analysis for small teams.
- Client-friendly reporting without cookie banners.
- Website performance intelligence for operators who do not want GA complexity.
- Lead and content attribution without invasive tracking.

## Feature Brainstorm Backlog

Core product:

- Conversion-focused dashboard mode.
- Funnel setup wizard for common SaaS flows.
- Custom event templates: signup, checkout, contact form, pricing click, outbound link.
- Source quality scoring based on engaged sessions and conversion events.
- Landing page performance cards.
- Weekly email reports focused on movement, not vanity metrics.
- Public or client-shareable reports.
- Import/migration path from Google Analytics data.

SEO/product-led content:

- Pages around conversion questions, not only analytics alternatives.
- Use-case pages for SaaS, consultants, agencies, content teams, and privacy-first businesses.
- Comparison pages only when they answer real buying questions.
- Technical guides for no-cookie event tracking and funnels.
- Templates: tracking plan, event taxonomy, analytics checklist.

Landing page:

- First viewport should show the actual dashboard or a believable product surface.
- Lead with "understand what turns visits into outcomes", not only privacy compliance.
- Avoid generic SaaS hero copy and clone-like comparison framing.
- Show concrete workflows: install script, define events, read source/page/funnel insights.

## What To Avoid

- Copying the tone, structure, or product framing of Plausible or similar tools.
- Treating "GDPR compliant" as the main buying reason for every user.
- Publishing AI-generated SEO articles without a specific search intent and product angle.
- Broad keyword pages that chase volume but attract low-intent visitors.
- Landing pages made of generic feature cards without a clear operational workflow.

## Technical Context

Stack:

- Next.js App Router.
- Supabase for auth, database, and server-side data access.
- shadcn/ui and Radix UI primitives.
- Tailwind CSS v4.
- Resend for email.
- Stripe for billing.

Key implementation areas:

- `app/api/track/route.ts`: main analytics tracking endpoint.
- `public/script.js`: production tracking script.
- `components/SiteData/`: dashboard analytics views.
- `components/home-page.tsx` and `components/sections/`: current landing page.
- `app/api/generate-content/route.ts`: internal blog/content admin endpoint.

## Current Working Rules

- Use `pnpm`.
- Keep Codex project context in `AGENTS.md` and durable product context in this file.
- Keep local Codex MCP credentials out of git.
- Treat SEO generation as editorial assistance, not autopublishing.
- Before a landing page refactor, inspect the current dashboard so the marketing surface can show the real product.
