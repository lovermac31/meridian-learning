# BotUI Public Pilot Design for jurassicenglish.com

## Summary

This design introduces a contained BotUI pilot to jurassicenglish.com using an English-only floating launcher and slide-up panel. The pilot will appear on English public routes only, remain hidden on all Vietnamese routes and private/gated paths, and provide quick guided navigation to existing public content without connecting to CRM, Notion, pricing internals, or other operator workflows.

The implementation is intentionally narrow. If BotUI shows React/runtime instability under the current React 19 app, the rollout stops and the site remains unchanged.

## Goals

- Add a professional conversational assistant surface to jurassicenglish.com
- Limit the first release to English public routes
- Keep the assistant off `/vi/...` routes and off private/gated paths such as `/plans-pricing-access`
- Offer useful, accurate public guidance without making unsupported promises
- Preserve current routing, metadata, and gated-flow behavior

## Non-Goals

- No bilingual chat behavior in this first release
- No CRM, Notion, pricing registration, or operator workflow integration
- No data collection beyond the in-session conversational UI state
- No rollout to private or internal routes
- No centered modal chat in the first release

## Current Stack Findings

- Framework: Vite SPA
- UI runtime: React 19
- Language: TypeScript
- Styling: Tailwind 4 with site-specific theme tokens in `src/index.css`
- Motion layer: `motion/react`
- Routing: custom pathname-driven route handling in `src/App.tsx`
- Existing overlay pattern: `src/components/PricingModal.tsx`
- Existing floating widget system: none

## Compatibility Assessment

BotUI React is structurally compatible with the app shape because the site already uses:

- React function components
- app-level conditional rendering
- custom route gating
- reusable overlay/panel patterns

Known risk:

- `@botui/react` currently declares React 18 peer dependencies, while jurassicenglish.com uses React 19

Mitigation:

- keep BotUI isolated to a single pilot component
- validate compile/runtime behavior immediately after install
- stop implementation if peer/runtime issues surface

## Pilot Scope

### Show BotUI on

- all English public routes

Examples:

- `/`
- `/framework`
- `/get-started`
- `/series/compare`
- `/series/level-3-expansion`
- `/series/level-3-expansion/syllabus`
- `/thinking-cycle/compare`
- `/thinking-cycle/justify`
- `/legal/privacy`

### Hide BotUI on

- all Vietnamese `/vi/...` routes
- `/plans-pricing-access`
- any unsupported private/internal route

## Visibility Model

The pilot will use an explicit route policy helper in `src/lib/botUiRoutes.ts`.

This helper will define:

- an explicit allowlist for English public routes
- an explicit denylist for:
  - all `/vi/...`
  - `/plans-pricing-access`
  - unsupported private/internal paths

The app-level shell in `src/App.tsx` will query this policy and only mount the chat when the current route is allowed.

## UI Approach

### Chosen presentation

- floating launcher
- slide-up panel

### Placement

- bottom-right placement on desktop
- bottom-safe inset placement on mobile
- below the navbar priority layer
- above footer edge and page content
- not overlapping key hero/get-started CTAs

### Visual direction

The assistant should feel native to jurassicenglish.com rather than generic.

Characteristics:

- premium dark shell aligned to current modal/nav language
- restrained Jurassic accent highlights
- rounded panel edges consistent with existing premium surfaces
- concise header and subtle helper copy
- comfortable spacing for reading and tapping

### Styling containment

BotUI visual overrides must be scoped under a dedicated shell class so global site CSS is unaffected.

Recommended wrapper class:

- `.je-botui-shell`

All BotUI-related overrides in `src/index.css` should be nested or namespaced under this shell.

## Component Design

### `src/components/BotUIChat.tsx`

Responsibilities:

- hold the stable BotUI instance
- render the floating launcher
- render the slide-up panel
- own open/close state
- own intro-flow guard
- own reset behavior
- own the first public conversation pilot

Key design rules:

- bot instance should not be recreated on every render
- starter conversation must not duplicate on remount
- reopen behavior should reset intentionally
- close/open should feel deterministic

### `src/lib/botUiRoutes.ts`

Responsibilities:

- define which routes can show BotUI
- define public destinations the bot is allowed to suggest
- prevent exposure of private/gated paths

Suggested API:

- `isBotUIRouteAllowed(pathname: string): boolean`
- `getBotUIPublicDestinations(): ...`

### `src/App.tsx`

Responsibilities:

- mount the BotUI shell once at app level
- pass route navigation callbacks into the assistant
- apply English-public-route-only visibility gating

### `src/index.css`

Responsibilities:

- import the BotUI default theme
- add scoped overrides under `.je-botui-shell`
- preserve site-wide CSS behavior outside the BotUI shell

## Conversation Pilot

The first public assistant flow is navigation-oriented, not transactional.

Initial intents:

- What is Jurassic English?
- Explore the Series
- Compare Levels
- View Syllabus
- Learn About Training
- Contact Us

Behavior:

- welcome message
- show quick-intent options
- route the user to existing public pages
- keep responses factual and short

Out of scope:

- no pricing access promises
- no hidden/gated route exposure
- no CRM or Notion actions
- no unsupported claims about what the assistant can do

## State Safety

The assistant should behave predictably under React Strict Mode and route transitions.

Rules:

- prevent duplicate intro messages in development
- reset the conversation when the panel is closed and reopened
- avoid duplicate action blocks
- keep route changes from leaving the panel in a broken state

Decision:

- session state resets on close for the pilot
- no persistence across page loads in the first release

## Validation Gates

### Phase 2 gate

- packages install cleanly
- app compiles
- BotUI base component renders
- intro flow runs once
- no import/runtime crash

### Phase 3 gate

- launcher opens and closes cleanly
- panel works on desktop, tablet, mobile
- panel does not obstruct major CTAs
- styling is visually consistent with jurassicenglish.com

### Phase 4 gate

- BotUI appears only on English public routes
- BotUI is hidden on all `/vi/...` routes
- BotUI is hidden on `/plans-pricing-access`

### Phase 5 gate

- each quick intent resolves to a real supported path
- no dead-end conversation branches
- no unsupported promises

### Phase 6 gate

- `npm run build` passes
- no route regression
- no SEO regression
- homepage, framework, series, and get-started layouts remain sound

## Failure Modes and Stop Conditions

Stop implementation immediately if:

- BotUI fails to compile under the current React 19 stack
- runtime behavior becomes unstable
- Strict Mode causes unresolved duplicate-flow issues
- the launcher/panel materially degrades key page UX

If any stop condition occurs:

- remove the BotUI package wiring
- leave the site on the current stable experience
- reassess whether a site-native assistant shell is safer than BotUI

## Rollback Plan

If a later deployment causes issues:

1. remove the BotUI mount from `src/App.tsx`
2. remove the pilot component and route helper
3. remove the BotUI theme import and scoped overrides from `src/index.css`
4. rebuild and redeploy the prior stable public site

## Implementation Plan

1. Install `botui` and `@botui/react`
2. Create `src/lib/botUiRoutes.ts`
3. Create `src/components/BotUIChat.tsx`
4. Import BotUI theme and add scoped shell overrides in `src/index.css`
5. Mount the chat in `src/App.tsx` with route gating
6. Add the English-only public conversation pilot
7. Run build and route-level QA

