# Purpose & context

We are building Dormr, a student housing marketplace (proptech) that matches university students with compatible accommodations. The platform has two user roles — students (tenants who browse listings) and listers (landlords who post rooms) — each with separate dashboard namespaces (/dashboard/ and /lister/), routing, and navigation patterns.
Core platform features include: listing creation/management, tenant request flows, compatibility scoring between prospective and existing tenants, notifications, and a student profile system. The project is in active multi-phase development, with foundational infrastructure complete and feature layers being added incrementally.
Tech stack: Next.js (App Router, Turbopack), Supabase (auth, database, storage, RLS), TypeScript, React Query, Zustand, React Hook Form, Zod, shadcn/ui, Tailwind CSS, Leaflet (vanilla, not react-leaflet).

Current state

Compatibility system (Phase 5): Fully implemented — scroll-triggered SVG ring animation (IntersectionObserver + requestAnimationFrame, cubic ease-out), per-tenant field-by-field match/mismatch breakdown with actual differing values, four distinct display states (single-occupancy hidden, no tenants message, viewer-is-only-tenant "You're listed here" state, animated score). Compatibility badge on browse page made more visually prominent.
Browse listings page: Inline sticky filter bar (search, room type, max price, gender preference) embedded directly in listings-browse-client.tsx; horizontal stacked card layout; Zustand store used for filter state (not local useState); pagination and skeleton loading in place.
Tenant request & notification flow: Full stack implemented — student submits request → lister notified with approve/reject buttons on notifications page → approval adds to listing_tenants → student notified of outcome → removal triggers notification. read_at column on tenant_requests drives unread badge count.
Lister dashboard: My Listings page, new/edit listing forms, dashboard home with real stats, ListerSidebar, auth/profile guards all in place.
Student profile: Complete StudentProfile interface with all fields; use-student-profile.ts hook with correct query key and initialData support; inline editing via EditableField, EditableHobbies, EditableSearchField; avatar upload/remove via Supabase Storage.
Map integration: Vanilla Leaflet with useRef/useEffect lifecycle control, manual \_leaflet_id clearing, next/dynamic with ssr: false for LocationPickerMap.

On the horizon

Lister-side features flagged as "coming soon": analytics, chats, compatibility insights.
Student-side: chats, saved listings.
Contact buttons (Call, Email, WhatsApp) currently disabled with "coming soon" tooltips — future activation planned.
Subdomain email matching improvement: updating is_email_domain_allowed to support suffix/subdomain matching so only root domains need to be maintained.
Payment/financial features not yet scoped but acknowledged as a future possibility.

Key learnings & principles

Ask before acting: Abu Hamza explicitly praised Claude for asking clarifying questions and requesting current file contents before implementing, rather than guessing. This pattern should be continued consistently.
Match project conventions: File structure, naming, and patterns should follow what already exists (e.g., types in lib/types/, not new directories; existing hook naming conventions).
Real fixes over suppressions: Abu Hamza prefers finding genuine solutions rather than suppressing linter errors or using workarounds that mask problems.
Simplicity over complexity: Pushed back on over-engineering — removed live validation from EditableField, removed optimistic avatar previews in favor of cache invalidation, prefers targeted single-file changes when possible.
Supabase join quirk: Joined relations return as arrays even for single-row joins; use .map() with Array.isArray guards rather than direct casting.
React Query initialData: Omitting initialDataUpdatedAt is correct — React Query treats initialData as immediately stale and refetches on mount, which is the desired behavior.
Two-query pattern for broken Supabase joins: When a FK points to auth.users instead of a public profile table, fetch raw rows first, extract IDs, then batch-fetch profiles with .in() and merge via a Map.
Leaflet + Next.js: react-leaflet is incompatible with React Strict Mode double-mount and Turbopack HMR; vanilla Leaflet with explicit lifecycle control is the established solution.
Zustand for filter state: Filter state must live in the Zustand store, not local useState, to survive navigation.

Approach & patterns

Architecture: Server components fetch data and pass as React Query initialData to client components; mutations use React Query hooks; schemas in lib/schemas/; hooks in hooks/; UI in components/.
Forms: Server Actions + Zod for simple forms; React Query mutations + React Hook Form + Zod for complex forms needing real-time validation or optimistic updates.
Output format preference: Plain raw code blocks only — no artifacts, no expandable panels. Complete file replacements preferred over partial diffs.
Incremental sessions: Work frequently picks up from compacted prior context; Abu Hamza provides current file contents to re-establish state before implementation.
Design sensibility: Minimal, restrained aesthetic inspired by Anthropic's style — orange accents (oklch values), Lora serif font, grainy SVG texture, hover:scale transitions (not color-change hovers), no gradients or glassmorphism.
Dead code hygiene: Unused files and components are deleted rather than left in place.

Tools & resources

Supabase MCP: Used directly for schema inspection and database analysis during debugging sessions.
GitHub: Abu Hamza shares file links for Claude to read current state before making changes.
Key external APIs: Hipolabs university search API (with custom hardcoded entries for institutions not yet in the API, e.g., German International University).
UI libraries: shadcn/ui (including AlertDialog), Sonner (toasts), Leaflet (vanilla).
Fonts: Lora (serif, via next/font/google), referenced via --font-lora CSS variable mapped to --font-serif.

# Copilot Instructions

Do not use "any" types for typescript
try to use a schadcn component instead of a custom one when its available
all components should support dark mode
ensure any design implementation is responsive and mobile friendly
ensure separation of concerns
follow this diagram for data fetching and form submission implementation decision
Need to fetch data?
├─ Is it initial page load data?
│ ├─ YES → Server Component
│ └─ NO → React Query
│
├─ Does it change frequently?
│ ├─ YES → React Query
│ └─ NO → Server Component
│
└─ Do you need optimistic updates?
├─ YES → React Query
└─ NO → Server Component with React Query initialData

Need to submit a form?
├─ Is it a simple form (1-3 fields)?
│ ├─ YES → Server Action + Zod
│ └─ NO → React Query Mutation + React Hook Form + Zod
│
├─ Do you need real-time validation?
│ ├─ YES → React Query Mutation + React Hook Form
│ └─ NO → Server Action
│
└─ Do you need optimistic updates?
├─ YES → React Query Mutation
└─ NO → Server Action

when giving me pages files dont name them "page.tsx" as i cant tell which page.tsx is for what exactly so give them meaninful names, i copy pase the contents anyway so name of files dont matter only contents do

from now on send the files as plain text blocks so I can copy manually
no expandable panels
no artifacts
just raw code blocks

if u find me trying to implement a feature in a way that's not conventional or follow professional standards tell me, and show me the better way

# For Supabase

we have two projects one for dev and another for production

1. Change schema on dev Supabase → test locally
2. Push feature branch → test on preview URL
3. Merge to main → dormr.app updates
4. Apply same schema change to prod Supabase

# git feature to production workflow

- Always branch off `dev`, never off `main`
- Never push directly to `main` or `dev` — always use feature branches and PRs
- Test the Vercel preview URL before merging anything
- Only merge `dev` → `main` when you're confident it's production-ready
- Delete feature branches after merging to keep things clean
