# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A local-only, single-user course-timetable planner for BITS Pilani Hyderabad Campus (CSE / branch A7 currently). Students track which courses to take each semester, monitor CDC/DEL/OPEL/HUEL credit requirements, browse a catalog of real courses (CDCs, minors, electives) seeded from actual university documents, and check progress toward completing a minor. There is no backend — everything lives in the browser's IndexedDB.

Note: this app has no numbered-week/day/time scheduling. A semester is just a flat list of courses (think "courses are things you do in a semester," not a weekly timetable grid). Slot codes, clash detection, and time-of-day concepts do not exist in this codebase — don't reintroduce them without being asked.

## Commands

```bash
npm run dev      # start dev server (Next.js + Turbopack) on :3000
npm run build    # production build — also runs the TypeScript check
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit -p tsconfig.json   # type-check only, faster than a full build
```

There are no automated tests in this project (no test runner configured).

After any non-trivial change, run `npx tsc --noEmit` and `npm run lint` before considering the change done — both are fast and catch most issues before a full build.

## Architecture

**Stack**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS v4 + `@dnd-kit` (core/sortable/utilities) for the Overview board's drag-and-drop. Everything is client-rendered (`"use client"` almost everywhere) since there's no backend; Next.js is used purely as an SPA shell with static hosting in mind (deployable to Vercel free tier).

### Data flow: DB → repositories → zustand stores → components

1. **`src/lib/db/db.ts`** — single IndexedDB database (`bits-timetable-db`) opened via `idb`. Schema is versioned; the `upgrade()` callback branches on `oldVersion` for migrations. Two migrations so far have *removed* a store outright by casting its name and calling `deleteObjectStore` (v1→v2 dropped the old `slotMaps` store when time-based scheduling was removed; v4→v5 dropped `minorBoardCourses`, a per-minor shortlist board that was tried on the Catalog page and then superseded by dragging straight from the Overview sidebar's "Minor" tab). Follow this same cast-and-delete pattern if a future feature's store needs to go away.
2. **`src/lib/db/repositories/*`** — one repository per object store (`courseRepository`, `timetableRepository`, `categoryRepository`, `branchRepository`, `calendarRepository`, `userRepository`, `boardRepository`). Each implements an interface from `src/lib/db/interfaces.ts`. **Components and stores never call `idb`/`getDb()` directly — always go through a repository.** This is the seam that would let local storage be swapped for a real backend later without touching UI code.
3. **`src/lib/state/*`** — zustand stores (`useAppStore`, `useCourseCatalog`, `useTimetable`, `useBoard`) that hold in-memory copies of repository data and expose actions. Writes are optimistic: update store state synchronously, then persist via the repository, rolling back on failure. **When adding a bulk-mutation store action, make sure it actually gets called** — a real bug in `overview/page.tsx`'s drag-end handler once returned early (as an "already in the right spot, nothing to do" optimization) *before* the commit call that converts a drag from a synthetic source into a real `TimetableEntry`, leaving a card that rendered fine but was never persisted and vanished on the next unrelated store sync. When a drag/optimistic-update path has an early-return short-circuit, double check it can't skip the actual persistence call.
4. **`src/components/layout/StoreHydrator.tsx`** — wraps the whole app (in `src/app/layout.tsx`), runs `seedIfEmpty()`, `correctCdcChoiceElectives()`, and loads all stores (including the board) on mount, and gates rendering behind `isHydrated` (IndexedDB access is async, so there's a brief loading state on first paint). Data-correctness fixes to already-seeded courses (see `correctCdcChoiceElectives` below) belong here, called unconditionally on every mount, rather than only inside a re-triggerable seed button — otherwise a user who already ran the old seed once never sees the fix.

### Data model (`src/types/`)

- `Course` — code, title, credits, `categoryType` (`CDC | DEL | OPEL | HUEL | OTHER_ELECTIVE`), `department`, `branchApplicability` (empty array = all branches), `semesterParity` (`ODD | EVEN | BOTH`), `categoryIds` (many-to-many with `CourseCategory`, the "vibe" groupings used for catalog browsing — distinct from `categoryType`), plus `minorTags`/`difficultyRating`/`popularity`/`calendarId` fields that exist now but are only exercised by not-yet-built future phases (difficulty color-coding, multi-calendar compare) — don't remove them even though they look unused. (Minor progress tracking is handled separately, by joining a course's `code` against `minorCourseEntries` in the seed data — see "Minor eligibility" below — not via `minorTags`.)
- `TimetableEntry` — links a `courseId` to a `semesterNumber` + `calendarId`, plus an `order` (position within that semester, used by the Overview board's drag-and-drop; entries written before this field existed have no `order` and sort last / fall back to `addedAt`). A course can legitimately have more than one `TimetableEntry` across different semesters (e.g. a retake) — nothing in the data model prevents this, and CDC courses specifically rely on it (see "CDC permanence" below).
- `BoardCourse` (`src/types/board.ts`) — a course staged in the Overview page's drag-and-drop sidebar's "Board" tab, scoped by `calendarId`. Being on the board just means it's visible as a drag source; it's independent of whether the course is actually placed into a semester. Added/removed via a toggle button on the Catalog page's `CourseCard`.
- `Calendar` — a named plan; only one (`"default"`, from `DEFAULT_CALENDAR_ID` in `src/lib/constants.ts`) is used today, but the entity already exists so a future multi-calendar-compare feature won't need a schema change.
- `UserProfile` — single local row (id is the `LOCAL_USER_ID` constant), holds name, branch, active calendar, theme, and `selectedMinorId` (which minor the student is currently tracking — see "Minor eligibility" below).

### Seed data (`src/data/seed/`)

Real (not placeholder) data transcribed from actual BITS documents:
- `cdc.a7.seed.ts` — the CSE/A7 compulsory curriculum by semester (`cdcSeedA7`, auto-placed into each course's `typicalSemester`), transcribed from a real performance/transcript sheet. Semester 7 is intentionally empty (fully elective term) and Practice School I is deliberately left in `unplacedCdcSeedA7` (no semester placement — its "summer term" isn't a numbered semester in this model). `cdcChoiceElectivesA7` holds ECON F211/MGTS F211: these were originally (incorrectly) seeded as two separate compulsory CDCs, but Sem 3 actually offers them as a "pick one" pair, so they're seeded as `OTHER_ELECTIVE` and left off the auto-placement list.
- `minors.seed.ts` — all 15 BITS minor programs (core + elective courses) transcribed from the official minors PDF. Water and Sanitation (minor #16) is missing from the source document used. Every minor uses the same 5-course/15-unit total floor (`MinorDefinition.totalMinCourses`/`totalMinUnits`), even the ones whose own program page states a higher total — there is deliberately no per-minor override anymore.
- `electives.a7.seed.ts` — the DEL/HUEL/OPEL elective pool from the official course-list spreadsheet. OPEL is explicitly a partial list per the source ("refer to catalog" for the rest).

Seeding happens via `src/lib/db/seed.ts`, triggered by buttons on the Catalog page (`seedCdcForBranch`, `seedMinorsData`, `seedElectivesForBranch`) and by the Settings page's reset action (`seedCdcForBranch`, see "Screens" below) — not automatically, except:
- `seedIfEmpty()` (branches/categories/default calendar), which runs unconditionally from `StoreHydrator` but no-ops once branches exist.
- `correctCdcChoiceElectives()`, which also runs unconditionally from `StoreHydrator` on every mount (cheap — a couple of index lookups) to downgrade any already-seeded `ECON F211`/`MGTS F211` course still classified `CDC` from before the "pick one" fix, back to `OTHER_ELECTIVE`. This is the pattern to follow for future seed-data corrections that need to reach users who already ran an older seed: a small idempotent correction function called unconditionally at hydration, not just folded into the re-triggerable seed button.

**Important merge/dedup rule**: many course codes appear in more than one seed source (e.g. a course can be both a CDC and a minor elective, or listed under multiple minors). The seed functions look up by course `code` (unique index in the `courses` store) before inserting:
- Never downgrade an existing `CDC` classification (except the narrow, explicit `cdcChoiceElectivesA7` correction described above, which is a one-time data fix, not a general rule).
- Upgrade `OTHER_ELECTIVE` (the fallback used by `seedMinorsData`, since a minor course's true DEL/HUEL/OPEL category isn't knowable from the minors doc alone) to the authoritative type once `seedElectivesForBranch` runs.
- Merge `minorTags` (union, not overwrite) when a course belongs to multiple minors.
- Keep the first-seeded `title` rather than overwriting with a later, possibly-truncated one.

When adding new seed data, follow this same pattern rather than blindly upserting by a freshly generated id.

### Screens (`src/app/(main)/`)

Route group `(main)` shares `NavBar` + container layout; `/` (start screen, name + branch + quote) sits outside the group with no nav.

- **`/overview`** (default landing after start) — a fixed 8-semester drag-and-drop board, **semesters as columns side-by-side** (each a compact `w-32` `SemesterRow`, courses stacked vertically within), plus a sidebar (`OverviewSidebar`) with two tabs: **Board** (the persisted `BoardCourse` drag source, `BoardSidebarContent`) and **Minor** (browse any minor's core/electives and drag straight onto a semester, `MinorSidebarContent` — see "Minor eligibility" below). A separate "Currently doing ___ minor" dropdown (`MinorSelector`) sits above the board and only lists minors you're currently *eligible* for, distinct from the sidebar's Minor tab which lets you browse *any* minor regardless of eligibility.
- **`/catalog`** — top tabs `DEL | OPEL | HUEL | All Courses` (`CatalogTabs`; there is no Minors tab here — minor browsing lives on `/overview`'s sidebar). Each tab scopes `filteredCourses` and the elective-progress panel to that category; the categoryType filter dropdown in `CourseFilterBar` only shows on "All Courses" (`showCategoryTypeFilter`). Below the tabs: browse/filter/add-to-semester via a per-course semester dropdown, toggle courses onto/off the Overview board, plus the seed-loading buttons.
- **`/settings`** — profile, theme picker, link to import, and a "Danger zone" section: **Reset plan to original CDC layout** clears every `TimetableEntry` for the active calendar (not just electives) and re-runs `seedCdcForBranch`, so CDCs land back in their original `typicalSemester` positions — this undoes manual moves and retakes too, not just non-CDC additions. The Board is left untouched by design.
- **`/settings/import`** — xlsx/csv import flow.

Course blocks are color-coded by `course.department` via `src/lib/theme/departmentColors.ts` — a fixed (non-theme-token) pastel palette assigned by hashing the department string, so any department, including ones introduced later via xlsx import, gets a stable color without a lookup table to maintain. The Minor sidebar's course items use a separate, non-hashed 2-entry palette (`src/lib/theme/minorRoleColors.ts`) to color by `core`/`elective` role instead.

### Overview board drag-and-drop (`src/app/(main)/overview/page.tsx`)

Built on `@dnd-kit` (not native HTML5 drag-and-drop — that approach was tried first and replaced because it can't do live position-aware reordering or touch support). Each semester column (`SemesterRow.tsx`) is a `useDroppable` container wrapping a `SortableContext` using `verticalListSortingStrategy` (courses stack top-to-bottom within a column, not left-to-right — the board is a semester-as-column / course-as-row grid); each placed course (`SortableCourseBlock.tsx`) is a sortable item keyed by its `TimetableEntry.id`; drag sources from the sidebar (`CatalogSidebarItem.tsx` on the Board tab, `MinorSidebarItem.tsx` on the Minor tab) are plain `useDraggable` sources keyed by a synthetic `catalog:{courseId}` id (not yet a real entry) — both tabs feed the same drop-handling code in `overview/page.tsx`, which doesn't care which sidebar tab a drag originated from. `DragOverlay` renders the lifted card following the cursor.

Local `board` state (`Record<containerId, itemId[]>` in `overview/page.tsx`) mirrors the store but is allowed to diverge during an active drag for live cross-container reordering preview; it's re-derived from `entries` during render (not an `useEffect`) whenever the store changes and no drag is in progress — React's documented pattern for resetting local state from an external source without an extra render pass. On drop, synthetic `catalog:` ids get resolved into real entries (`addEntry`) and the final per-semester order is committed in one call to `useTimetable`'s `setSemesterOrder(calendarId, semesterNumber, orderedEntryIds)`, which reconciles both `semesterNumber` and `order` for every entry in the list — this single action handles same-semester reorder, cross-semester move, and new-from-sidebar add uniformly. **`handleDragEnd` must call `commitBoard` even when the dropped item's index within its container didn't change** — that's the normal case for a simple single-item drop from a sidebar, and an early return there (added as a seemingly-safe "nothing to reorder" optimization) skips the only code path that turns a synthetic `catalog:` id into a real, persisted entry.

`PointerSensor` uses an 8px `activationConstraint` so a plain click (e.g. the remove button) doesn't get eaten as a drag start.

### CDC permanence

CDC courses are compulsory and can never be removed, from either `/catalog` or `/overview` — but they *can* be added to additional semesters (retakes), since nothing in the data model prevents a course having more than one `TimetableEntry`. Enforced in three places, all keyed off `course.categoryType === "CDC"`:
- **`CourseCard.tsx`** — a CDC renders each of its placements as a locked, non-interactive chip ("Sem X — locked", no remove affordance) plus an always-visible "Add to Semester…" dropdown (so retakes work); non-CDC courses render the normal single "Added to Sem X — Remove" button or add-dropdown.
- **`SemesterRow.tsx`** (Overview board) — `onRemove` is passed as `undefined` for a CDC block, so `CourseBlock` simply doesn't render its `×` button; drag/reorder is unaffected since `useSortable`'s `listeners`/`attributes` are spread on the card regardless of whether the remove button exists.
- **Defense in depth** — both `catalog/page.tsx#handleRemove` and `overview/page.tsx#handleRemove` also guard against removing a CDC directly (via a `courseById` lookup), independent of whether the UI correctly hid the button.

### Minor eligibility (`src/lib/scheduling/minorRules.ts`)

`evaluateMinorEligibility(minor, completedCourses)` / `getEligibleMinors(completedCourses)` compute whether the student's placed courses (any semester, this calendar — not the board) satisfy a minor, per the rules in `src/data/seed/minors.seed.ts`'s header comment (general BITS minors requirements: core = all listed core courses, electives = min 2 courses/6 units from the pool, total = min 5 courses/15 units — applied uniformly to every minor via `MinorDefinition.totalMinCourses`/`totalMinUnits`, even for minors whose own program page states a higher total). GPA isn't checked — this app doesn't track grades. A course that's also one of the student's own CDCs can count toward the total, but only up to `MINOR_MAJOR_OVERLAP_MAX_COURSES`/`_UNITS` (2 courses/6 units) — courses beyond that cap are excluded from *both* the elective-minimum and total counts, not just the total, so a CDC-heavy selection can't look eligible on paper while not actually satisfying the requirement.

Two separate UI surfaces read this, both on `/overview`: the top `MinorSelector` surfaces only currently-eligible minors in a "Currently doing ___ minor" dropdown, persisted to `profile.selectedMinorId`; the sidebar's Minor tab (`MinorSidebarContent`) lets you browse *any* minor (via `MinorCourseSelector`, unrestricted by eligibility), shows a compact progress summary for whichever one is selected, and lists its core/elective courses as drag sources so you can place them directly — there's no separate persisted "shortlist" step (that was tried as a Catalog-page feature and removed, see the `db.ts` v4→v5 migration note above). `isProjectTypeCourse(title)` is a title-keyword heuristic (`/project|seminar/i`) used to badge project/seminar-type electives in the Minor sidebar, since the seed data doesn't tag this explicitly.

### Excel import (`src/lib/importers/`)

Client-side only (SheetJS `xlsx` package, no server route). `xlsxParser.ts` reads the file into rows; `courseRowSchema.ts` validates/parses a single row into a `Course`; `importReport.ts` builds the batch-level plan (dedup against existing catalog + against duplicates within the same file, resolves/creates vibe categories by name). The UI is parse → preview (`ImportPreviewTable`, showing imported/skipped/error counts) → explicit confirm before anything is written. `.numbers` files are explicitly rejected with a message to export to `.xlsx`/`.csv` first — this app cannot and should not try to parse Apple's binary format.

Note: the `xlsx` npm package has known low-severity advisories (prototype pollution / ReDoS on malicious files) with no upstream fix on the pinned version. Acceptable here since it only parses files the user chooses to import themselves.

### Theming

CSS custom properties (`--background`, `--foreground`, `--accent`, `--accent-contrast`) scoped by `[data-theme="..."]` (note: **not** `:root[data-theme=...]` — the plain attribute selector is intentional so the same tokens can be reused for small in-page previews, e.g. `ThemePicker`'s swatches, not just the document root) in `src/app/globals.css`, mapped into Tailwind via `@theme inline`. Four themes are defined in `src/lib/theme/themes.ts`; `ThemeProvider` sets `document.documentElement.dataset.theme` from the user's profile. When styling new components, use the semantic Tailwind classes (`bg-background`, `text-foreground`, `bg-accent`, opacity variants like `text-foreground/60`) rather than hardcoded colors, so they render correctly across all four themes. Status colors (red/amber/emerald for errors/warnings/success) are intentionally the plain Tailwind palette, not theme tokens.

### Credit/elective rules (`src/lib/scheduling/creditRules.ts`)

Single source of truth for `MAX_CREDITS_PER_SEMESTER` (25) and `ELECTIVE_REQUIREMENTS` (DEL 4 courses/12 credits, OPEL 5/15, HUEL 3/8). All warnings derived from these are non-blocking (amber banners, never prevent adding a course) — this is a deliberate product decision, keep it that way.
