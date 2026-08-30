# SecurityOn Research Journey — Gemini Code Assist Context

## Project identity

SecurityOn Research Journey is BAN Seok's bilingual academic research journal and engineering record. It documents graduate study, professional IT/security experience, research questions, experiments, and publications, with a growing focus on AI Security.

The intended voice and appearance are:

- reflective;
- chronological;
- technically precise;
- modest;
- text-first;
- academic;
- restrained.

It must not drift into a marketing portfolio, startup landing page, dashboard, or decorative product site.

## Technology and organisation

The project is a statically generated Astro 7 site using:

- TypeScript
- Astro content collections
- Markdown / MDX
- Tailwind CSS 4
- Tailwind Typography
- Pagefind
- Astro RSS / sitemap integrations
- Satori / Sharp OG-image generation
- Astro view transitions

Key locations:

- `astro-paper.config.ts` — project-facing configuration for site, Notes, features, social links, and sharing.
- `src/config.ts` — resolved defaults.
- `src/types/config.ts` — configuration contracts.
- `src/content.config.ts` — the sole `notes` content-collection schema.
- `src/content/notes/` — active Korean and English Note sources.
- `src/pages/index.astro`, `src/pages/about.astro`, `src/pages/research.astro` — bilingual static editorial pages.
- `src/pages/notes/[lang]/` — language-aware Note listings, detail routes, tags, pagination, and OG routes.
- `src/layouts/Layout.astro` — global metadata, fonts, theme, and client router.
- `src/layouts/NoteLayout.astro` — Article metadata and JSON-LD.
- `src/styles/global.css` — font faces, Korean typography, shared layout utilities, and section labels.
- `src/styles/typography.css` — rendered Markdown prose.
- `src/utils/getNotePaths.ts` — canonical Note slug / URL construction.
- `src/utils/noteFilter.ts`, `getSortedNotes.ts`, `getUniqueTags.ts` — Note visibility, sorting, and tag behaviour.
- `src/pages/archives/`, `src/pages/rss.xml.ts`, `src/pages/search.astro` — archive, feed, and search behaviour.

This repository originated from AstroPaper. Current source and intentional project rules override upstream README assumptions.

## Notes content model

The original AstroPaper `posts` collection and `/posts` routes were intentionally retired.

The active and only content collection is `notes`. About is implemented by the
standalone `src/pages/about.astro` route; do not recreate the removed `pages`
collection or `src/content/pages/about.md`.

Do not recreate:

- `posts`;
- the removed `pages` content collection;
- `/posts`;
- top-level `/tags`;
- Post-named route helpers or layouts such as `PostLayout`, `getPostUrl`, `getPostSlug`, `getSortedPosts`, or `postFilter`.

Legacy `/posts` redirects are intentionally not required.

Important Note frontmatter:

- required: `pubDatetime`, `title`, `description`;
- defaults: `author`, `tags`, `lang` (`ko`);
- `lang`: `ko | en`;
- `translationKey`: optional semantic link between translated versions;
- optional publication fields include `draft`, `featured`, `modDatetime`, `ogImage`, `canonicalURL`, `timezone`, and `hideEditPost`.

`noteFilter()` excludes drafts and applies production scheduling rules.

`getSortedNotes()` sorts descending by `modDatetime ?? pubDatetime`.

`getUniqueTags()` uses Note visibility filtering, slug-deduplicates tags, and sorts them.

Current source filenames are date-prefixed; English counterparts commonly end in `-en`. `getNotePaths.ts` removes those conventions from public slugs.

Use `getNoteUrl()` rather than manually constructing Note-detail routes.

Note detail pages use the shared `src/components/ShareActions.astro` and
`src/components/BackToTopButton.astro` components. Do not recreate the removed
route-local variants.

## Explicit multilingual routing

Notes are separate statically generated resources, not two hidden versions of the same article.

Canonical routes:

- `/notes/ko/`
- `/notes/en/`
- `/notes/{lang}/{page}/`
- `/notes/{lang}/{slug}/`
- `/notes/{lang}/tags/`
- `/notes/{lang}/tags/{tag}/`
- paginated tag routes under the corresponding language

Language filtering happens **before** pagination, tag derivation, or adjacent-note calculation.

Korean and English therefore have independent:

- Note lists;
- page counts;
- tags;
- previous / next Note sequences.

Preserve the explicit language segment in Card links, Tag links, breadcrumbs, pagination, adjacent navigation, RSS, and OG routes.

There is no top-level `/tags` route or breadcrumb branch. Tags remain nested
under `/notes/{lang}/tags/...`.

Tag-detail language controls are rendered only for languages in which the same
tag slug actually exists. Never assume a tag slug has a counterpart in both
languages.

## Translation pairing

`translationKey` identifies one logical Note across languages.

For a normal pair:

- one Korean Note and one English Note share the same key;
- unrelated Notes must not reuse the key;
- filename similarity is not the translation contract;
- an unpaired Note is valid;
- the counterpart control should appear only when both language versions exist.

## Language-state model

There are two bilingual systems.

### Static editorial pages

Home, About, and Research contain both languages in the same document.

`LanguageToggle.astro`:

- toggles `[data-lang]`;
- updates `<html lang>`;
- persists `securityon-language`;
- updates the Header's prospective Notes link.

### Notes

Notes use explicit language URLs.

Within `/notes/{ko|en}/...`, the **URL language is the source of truth**.

Note list, detail, tag-index, and tag-detail routes pass their explicit `lang`
to `Layout.astro`, so their generated documents start with a truthful static
`<html lang="ko">` or `<html lang="en">` value.

`Header.astro` should:

- derive the current Note language from the URL;
- point Notes navigation to the matching language index;
- store the route language as the latest preference.

Header does not directly mutate `<html lang>` for Notes. The static Notes
document language comes from the explicit route `lang` passed to
`Layout.astro`.

Outside Notes, `securityon-language` is only preference state.

Never let stale localStorage override an explicit Note URL.

`BackButton.astro` must treat `sessionStorage.backUrl` as potentially stale
after a Note translation switch. If its Notes language differs from the
current Note URL language, fall back to `/notes/{currentLang}/`; do not
mechanically translate pagination or tag URLs across languages.

### Historical anti-patterns that must not return

Do not reintroduce:

- `data-note-lang`;
- hidden dual-language Note articles;
- client-side visibility to select Note content;
- per-route scripts that independently synchronise localStorage;
- Header logic that trusts localStorage over `/notes/ko/...` or `/notes/en/...`.

Those patterns previously caused hidden KO/EN article bodies and intermittent navigation-language mismatches.

Astro i18n currently exposes only `en`; the KO/EN system is application-level
rather than Astro locale-prefixed routing. Explicit Note-route layout props,
not Astro locale-prefixed routing, provide the static document language.

## Typography

### Korean body

Korean article prose uses `RIDIBatang` through `.ko-body`.

Current line-height: `1.8`.

Korean Note articles apply `.app-prose.ko-body` at the article boundary.

The RIDIBatang font face is registered at weight `400`, while Korean Note prose currently requests `300` because that lighter rendered appearance was preferred after visual review. Treat this as an intentional visual choice, not an automatic bug. Do not normalise it to `400` without checking the rendered page.

### Korean headings and UI

`.ko-ui` uses Pretendard.

Use Pretendard for:

- Korean Note titles;
- Markdown headings in Korean Note prose;
- table headers;
- Card titles;
- adjacent Note titles;
- comparable interface-like Korean text.

Prefer structural inheritance to long element-specific override lists.

### English

Preserve the existing English typography unless explicitly asked to change it.

Do not apply Korean font classes to English content.

Per-Note dynamic OG images use the local `RIDIBatang.otf` registered at weight
`400` for Korean titles. English titles retain the Google Sans Code bold
treatment. Keep the current OG layout unless a task explicitly requires a
design change.

## Editorial conventions

Use concise, natural, technically precise prose.

Prefer British English where the wording is not an official name or quotation:

- `programme`
- `analyse`
- `organisation`
- `behaviour`
- `modelling`
- `centre`
- `towards`
- `colour`

The preferred tone is academic and research-journal-like, not promotional.

Avoid exaggerated claims, marketing language, or portfolio-style self-promotion.

When editing bilingual static content, preserve both language variants.

## Visual design philosophy

The site should remain:

- quiet;
- text-led;
- academic;
- technical;
- trustworthy;
- minimal.

Preferred characteristics:

- narrow readable measure;
- controlled whitespace;
- subdued borders;
- restrained accent use;
- clear typographic hierarchy;
- minimal UI;
- subtle technical / research character.

Reuse existing tokens such as `background`, `foreground`, `accent`, `muted`, and `border`.

Avoid:

- gradients;
- arbitrary new colours;
- excessive cards;
- large colourful panels;
- oversized hero text;
- excessive shadows;
- strong decorative graphics;
- unnecessary animations;
- dashboard-like UI;
- marketing-site aesthetics.

## Section-label convention

Major section labels use the shared `section-label` utility.

It standardises:

- application font;
- accent colour;
- uppercase treatment;
- `text-sm`;
- medium weight;
- `0.16em` tracking.

Reuse it for comparable major labels such as Profile, Career Journey, Education, Current Focus, Timeline, and Master's Thesis Candidates.

Smaller nested labels may remain visually subordinate.

## About Career Journey timeline

The timeline is intentionally archival and restrained.

Preserve:

- a subtle vertical line;
- muted outlined historical nodes;
- a single accent-filled latest node;
- measured spacing;
- bilingual behaviour;
- responsive layout.

Do not convert milestones into cards or add gradients, decorative icons, or strong colour.

## Education display conventions

Education is intentionally shown as two lines: institution first, programme / degree second.

Korean:

- `국립공주대학교`
  - `IT융합 석사과정`
- `건국대학교`
  - `전자공학 학사`
- `동양공업전문대학`
  - `전자공학 전문학사`

English:

- `Kongju National University`
  - `M.S. Programme in IT Convergence`
- `Konkuk University`
  - `B.S. in Electronic Engineering`
- `Dongyang Technical College`
  - `Associate Degree in Electronic Engineering`

Do not merge institution and programme onto one line.

The graduate-school name is intentionally omitted from this display.

If a formal context requires the official English graduate-school name, use:

`Graduate School of Technology & Convergence`

Do not use `Graduate School of Techno-Convergence`.

## Archives, RSS, and Pagefind

### Archives

Archives are intentionally retained even while hidden through `showArchives: false`.

They may later serve as a chronological research-history view as Notes accumulate.

Do not delete archive code just because it is absent from navigation.

### RSS

RSS is a single bilingual feed using:

- visible sorted Notes;
- language-aware URLs;
- `modDatetime ?? pubDatetime`.

### Pagefind

The build runs Pagefind against `dist` and copies the bundle into `public/pagefind`.

Only pages with `data-pagefind-body` are indexed; Note detail pages are currently the main indexed content.

Truthful static Note document languages produce separate `ko` and `en`
Pagefind indexes. `search.astro` selects the active Pagefind language from
`securityon-language` before initialisation and scopes RIDIBatang/Pretendard
result typography to Korean search results; English results retain the
application font.

## Safe editing behaviour

Before changing code:

1. inspect `git status --short`;
2. treat existing modifications as user-owned;
3. inspect the relevant schema, route, helpers, components, styles, and history;
4. trace multilingual effects across both variants;
5. identify the root cause before structural or bug-fix edits.

While editing:

- make the smallest robust change;
- preserve unrelated work;
- reuse existing helpers, classes, route constructors, and tokens;
- do not perform broad formatting rewrites during a focused task;
- avoid speculative refactors;
- do not add redirects, dependencies, abstractions, or unrelated cleanup without justification;
- do not silently redesign unrelated parts of the site.

Validation:

- run `git diff --check`;
- inspect focused diffs;
- run `npm run build` after meaningful source, content, schema, route, or style changes;
- use `npm run lint` / `npm run format:check` where relevant;
- report exact files changed, why, validation results, and warnings.

Do not commit, push, reset, discard work, or perform destructive Git actions unless explicitly instructed.

## Architectural invariants

Future changes should preserve these unless explicitly approved otherwise:

1. `notes`, never `posts`.
2. Explicit `/notes/ko/` and `/notes/en/` routing.
3. Language filtering before pagination, tags, and adjacent navigation.
4. URL precedence and truthful static `<html lang>` inside Notes; localStorage preference outside.
5. `translationKey` as the translation-pair contract.
6. No `data-note-lang`.
7. No hidden dual-language Note articles.
8. RIDIBatang Korean Note body; Pretendard Korean headings / UI.
9. British English preference for non-official prose.
10. Archives retained even when hidden.
11. No required legacy `/posts` redirects.
12. Restrained academic research-journal visual identity.
13. The static 404 REQUEST display uses
    `window.location.pathname + window.location.search`; build-time
    `Astro.url.pathname` identifies the generated 404 document, not
    necessarily the browser's missing URL.

## Decision principle

When two implementation choices are both valid, prefer the one that:

1. keeps the architecture understandable;
2. avoids hidden client-side state;
3. uses explicit routes and content metadata;
4. reduces duplicated logic;
5. preserves the restrained academic visual identity;
6. remains maintainable as the number of Notes grows.

Long-term clarity is more important than preserving AstroPaper template compatibility.
