# Purpose & Context

**Dormr** is a student housing marketplace (proptech) that matches university students with compatible accommodations. Two distinct user roles with separate dashboards:

- **Students** (`/dashboard/`): Browse listings, submit tenant requests, manage profiles, view compatibility scores
- **Listers** (`/lister/`): Post rooms, manage listings, approve/reject tenant requests, view applications

Core features: listing CRUD, tenant request→approval→notification flows, real-time compatibility scoring, notifications, student profiles with inline editing.

**Tech Stack**: Next.js 16.1.6 (App Router, Turbopack), Supabase (auth.users, RLS policies, Storage), React 19, React Query 5, Zustand, React Hook Form, Zod, shadcn/ui, Tailwind 4, vanilla Leaflet (not react-leaflet for Strict Mode compatibility).

## Architecture & Data Flow

**Two-Tier Data Fetching Pattern** (server components → React Query):

- **Server Component (initial page load)**: Server components fetch data via `createClient()` (Supabase SSR), pass as `initialData` to client components via props
- **Client Component (mutations/updates)**: Use React Query hooks with `useQuery` (with `initialData`), mutations via React Query + React Hook Form + Zod
- **State Management**: Zustand for cross-navigation persistence (filter state, sidebar toggles, auth state) — NOT local `useState`

**File Organization**:

```
lib/
├── types/           # Domain types (listing.ts, compatibility.ts)
├── schemas/         # Zod schemas (listing-schema.ts, profile-edit-schema.ts)
├── stores/          # Zustand stores (listing-filters-store.ts, auth-store.ts)
└── supabase/        # Supabase clients (client.ts for browser, server.ts for RSC)
hooks/              # React Query + business logic (use-*.ts naming)
components/
├── dashboard/       # Student dashboard (profile, listings-browse, notifications)
├── lister/         # Lister dashboard (my-listings, listing-form)
└── ui/             # shadcn/ui components
app/
├── dashboard/      # Student routes (server layouts for auth guards)
├── lister/         # Lister routes
└── actions/        # Server Actions for simple forms (listing-actions.ts)
```

**Supabase Connection Pattern**:

- **Server**: `createClient()` from `@/lib/supabase/server` returns SSR client with cookie management
- **Client**: `createClient()` from `@/lib/supabase/client` returns browser client
- **Auth Guard**: Layout.tsx files check `supabase.auth.getUser()` and redirect if unauthorized

**Critical Supabase Quirks**:

1. **Joined relations return as arrays** (even single-row FK joins) → use `.map()` with `Array.isArray()` checks
2. **Two-query pattern for broken auth.users FK joins**: Fetch listing rows → extract user IDs → batch-fetch profiles with `.in()` → merge via Map
3. **RLS policies** control data access; always test with different user roles

## Form & Mutation Patterns

**Decision Tree**:

```
Simple form (1-3 fields)? → Server Action + Zod (/app/actions/*.ts)
Complex form (4+ fields) or real-time validation needed? → React Query + React Hook Form + Zod
Need optimistic updates? → Always use React Query
```

**Example - Simple Form (Server Action)**:

```tsx
// app/actions/listing-actions.ts
export async function updateContactPhone(formData: FormData) {
  const parsed = updateContactPhoneSchema.safeParse({
    listing_id: formData.get("listing_id"),
    contact_phone: formData.get("contact_phone"),
  });
  if (!parsed.success) return { error: "Invalid data" };
  // ... Supabase mutation
  revalidatePath("/lister/listings");
}
```

**Example - Complex Form (React Query + React Hook Form)**:

```tsx
// hooks/use-create-listing-mutation.ts
export function useCreateListingMutation() {
  return useMutation({
    mutationFn: (values: CreateListingValues) => createListing(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings"] }),
  });
}

// In component: useForm() + React Hook Form + FormField from shadcn/ui
const form = useForm<CreateListingValues>({
  resolver: zodResolver(createListingSchema),
});
```

## Key Implementation Details

**Zustand Filter State** (not useState):

- Filter state lives in `listing-filters-store` (`searchQuery`, `roomType`, `maxPrice`, etc.)
- Survives navigation, persists across browse→detail→browse
- Actions: `setSearchQuery()`, `setRoomType()`, `resetFilters()`, etc.

**Compatibility System**:

- Per-listing compatibility score with tenant profiles
- Scroll-triggered SVG ring animation (IntersectionObserver + requestAnimationFrame)
- Four states: single-occupancy (hidden), no-tenants message, viewer-is-only-tenant ("You're listed here"), animated score
- Hook: `use-compatibility.ts` handles fetch + calculation

**Vanilla Leaflet (not react-leaflet)**:

- React Strict Mode double-mount incompatible with react-leaflet
- Use `useRef` for map instance, `useEffect` for lifecycle, manually clear `_leaflet_id`
- Dynamic import: `next/dynamic` with `ssr: false` for LocationPickerMap
- See: `listing-detail-map.tsx`, `listing-form.tsx` (location picker section)

**Notifications & Tenant Requests**:

- Flow: Student submits request → `tenant_requests` row → Lister notified (read_at = null)
- Lister approves → `listing_tenants` row added → Student notified
- `read_at` column on `tenant_requests` drives unread badge count

**Student Profile Inline Editing**:

- Components: `EditableField`, `EditableHobbies`, `EditableSearchField` (not live validation)
- Avatar upload via Supabase Storage, cache invalidation on success
- Hook: `use-student-profile.ts` handles queries + initialData

## Development Workflow

**Local Development**:

```bash
npm run dev          # Starts on localhost:3000, Turbopack watch
npm run build        # Production build
npm run lint         # ESLint check
```

**Environment**:

- `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- Dev Supabase project for local testing
- Production Supabase project synced after main merge

**Git & Deployment Workflow**:

1. Branch off `dev` (never `main`)
2. Test locally, then push feature branch → Vercel preview auto-generated
3. Merge to `dev` after preview validation
4. When ready for production: merge `dev` → `main` (triggers dormr.app deployment)
5. Apply same DB schema changes to production Supabase manually
6. Delete feature branch after merge

## Code Quality Standards

**TypeScript**: No `any` types — always provide explicit types. Use type-safe patterns with Zod for validation.

**Components**: All components support dark mode via `next-themes`. Use shadcn/ui components over custom ones when available (Button, Input, Form, Card, AlertDialog, etc.). Ensure mobile responsiveness (test on 320px+ viewport).

**Separation of Concerns**:

- Server components for data fetching and auth guards → client components for UI rendering
- Hooks for business logic and data queries → components for presentation only
- Schemas in dedicated files (lib/schemas/), types in lib/types/

**Code Style**:

- Design: Minimal, restrained aesthetic — orange accents (oklch values), Lora serif font, grainy SVG texture, hover:scale transitions (not color-change)
- No gradients, glassmorphism, or unnecessary animations
- Hover states should scale, not change color

**Dead Code**: Delete unused files/components immediately — don't leave stale code.

## Common Pitfalls & Solutions

| Issue                          | Wrong                      | Right                                                     |
| ------------------------------ | -------------------------- | --------------------------------------------------------- |
| Filter state across navigation | Local `useState`           | Zustamd store (`listing-filters-store`)                   |
| Map library in Next.js         | `react-leaflet`            | Vanilla Leaflet with `next/dynamic` + `ssr: false`        |
| Supabase FK join on auth.users | Single query with join     | Two-query: fetch rows → batch-fetch profiles with `.in()` |
| React Query initialData stale  | Set `initialDataUpdatedAt` | Omit it; React Query refetches on mount (intended)        |
| Simple form validation         | Custom hooks               | Server Action + Zod (in /app/actions/)                    |
| Form errors in complex forms   | Toasts for each error      | Render via `<FormMessage>` from React Hook Form           |

## Files to Reference

- `hooks/use-public-listings-page.ts`: Listing query with pagination, filters, tenant profile batching
- `components/listings/listing-form.tsx`: Complex form with image upload, location picker (Leaflet), React Hook Form
- `app/dashboard/page.tsx`: Server component with auth guard, initial data fetch pattern
- `lib/stores/listing-filters-store.ts`: Zustand store example
- `lib/schemas/listing-schema.ts`: Zod schema organization
- `hooks/use-student-profile.ts`: React Query with initialData + inline editing

## Approach & Conventions

**Architecture**: Server components fetch data and pass as React Query initialData to client components; mutations use React Query hooks; schemas in lib/schemas/; hooks in hooks/; UI in components/.

**Forms**: Server Actions + Zod for simple forms; React Query mutations + React Hook Form + Zod for complex forms needing real-time validation or optimistic updates.

**Output format**: Plain raw code blocks only — no artifacts, no expandable panels. Complete file replacements preferred over partial diffs. When providing page files, use meaningful content descriptions rather than generic "page.tsx" names.

**Design Sensibility**: Minimal, restrained aesthetic — orange accents (oklch values), Lora serif font, grainy SVG texture, hover:scale transitions (not color-change hovers), no gradients or glassmorphism.

**Code Review**: If you identify a feature being implemented in an unconventional or non-professional way, flag it and show the better approach. Always ask clarifying questions before implementing, and request current file contents before making changes.

**Dead Code Hygiene**: Unused files and components are deleted rather than left in place.

## Tools & Resources

- **Supabase MCP**: Used for schema inspection, database analysis, migrations
- **Environment**: `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- **External APIs**: Hipolabs university search API (with custom hardcoded entries for unlisted institutions)
- **UI Libraries**: shadcn/ui, Sonner (toasts), vanilla Leaflet
- **Fonts**: Lora (serif, via next/font/google, referenced as --font-lora CSS variable)

## Supabase & Deployment Workflow

**Development Environment**:

1. Two Supabase projects: dev (local testing) and production (live app)
2. Schema changes: Modify dev Supabase schema → test locally (`npm run dev`)
3. Feature branch: Push to Vercel preview → test on preview URL
4. Merge & Deploy: `dev` → `main` triggers production Supabase update
5. **Manual step**: Apply same schema changes to production Supabase after merge

**Git Workflow**:

- Always branch off `dev` (never `main`)
- Never push directly to `main` or `dev` — use feature branches + PRs
- Test Vercel preview URL before merging
- Only merge `dev` → `main` when production-ready
- Delete feature branches after merge
