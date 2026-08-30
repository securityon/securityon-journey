# SecurityOn Research Journey — Codex Guide

## Purpose

SecurityOn Research Journey is BAN Seok's bilingual academic research journal and engineering record. It documents graduate study, professional IT/security experience, research questions, experiments, and publications, with a growing focus on AI Security.

Preserve its restrained research-journal character. It is not a marketing portfolio, startup landing page, dashboard, or decorative product site.

## Stack and repository map

- Astro 7 static site
- TypeScript
- Tailwind CSS 4
- Astro content collections
- Markdown / MDX
- Tailwind Typography
- Pagefind
- Astro RSS / sitemap integrations
- Satori / Sharp dynamic OG-image generation
- Astro view transitions

Important locations:

- `astro-paper.config.ts` — project-facing site, Notes, feature, social, and sharing configuration.
- `src/config.ts` — resolved configuration and defaults; normally prefer the root config for intentional settings.
- `src/types/config.ts` — configuration contracts.
- `src/content.config.ts` — the sole `notes` content-collection schema.
- `src/content/notes/` — active Korean and English Note sources.
- `src/pages/index.astro`, `src/pages/about.astro`, `src/pages/research.astro` — bilingual static editorial pages.
- `src/pages/notes/[lang]/` — language-partitioned Note lists, detail routes, tags, pagination, and per-Note OG routes.
- `src/layouts/Layout.astro` — global metadata, fonts, theme, and client router.
- `src/layouts/NoteLayout.astro` — Article metadata and JSON-LD.
- `src/utils/getNotePaths.ts` — canonical Note slug / URL construction.
- `src/utils/noteFilter.ts`, `getSortedNotes.ts`, `getUniqueTags.ts` — visibility, sorting, and tag rules.
- `src/styles/global.css` — font faces, Korean typography, layout utilities, and shared section-label utility.
- `src/styles/typography.css` — rendered Markdown prose.
- `src/pages/archives/`, `src/pages/rss.xml.ts`, `src/pages/search.astro` — retained archive, RSS, and search behaviour.

The repository originated from AstroPaper, but current source and intentional project rules override upstream README assumptions.

## Notes content model

The former AstroPaper `posts` model was intentionally retired in favour of `notes`.
`notes` is the only content collection. About is the standalone
`src/pages/about.astro` route; do not recreate the removed `pages` collection or
`src/content/pages/about.md`.

Do not recreate:

- the `posts` collection;
- the removed `pages` content collection;
- `/posts` routes;
- top-level `/tags` routes;
- Post-named routing helpers or layouts such as `PostLayout`, `getPostUrl`, `getPostSlug`, `getSortedPosts`, or `postFilter`.

Legacy `/posts` redirects are intentionally not required.

Important Note frontmatter:

- Required: `pubDatetime`, `title`, `description`.
- Defaults: `author`, `tags`, `lang` (`ko`).
- `lang`: `ko | en`.
- `translationKey`: optional semantic identifier for a bilingual pair.
- Supported publication fields include `draft`, `featured`, `modDatetime`, `ogImage`, `canonicalURL`, `timezone`, and `hideEditPost`.

`noteFilter()` excludes drafts. In production it also withholds scheduled Notes until the configured scheduling margin; development shows non-draft future Notes for authoring.

`getSortedNotes()` sorts descending by `modDatetime ?? pubDatetime`.

`getUniqueTags()` applies Note visibility filtering, slug-deduplicates tags, and sorts them.

Current filenames are date-prefixed, with English counterparts commonly ending in `-en`. `getNotePaths.ts` removes both filename conventions from public slugs. Content subdirectories become slugged URL segments.

Use `getNoteUrl()` for Note-detail links rather than rebuilding URLs manually.

Note detail pages use the shared `src/components/ShareActions.astro` and
`src/components/BackToTopButton.astro` components. Do not recreate the removed
route-local variants.

## Multilingual Notes routing

Canonical routes:

- `/notes/ko/`
- `/notes/en/`
- `/notes/{lang}/{page}/`
- `/notes/{lang}/{slug}/`
- `/notes/{lang}/tags/`
- `/notes/{lang}/tags/{tag}/`
- paginated tag routes under the same language path

Filter by language **before** pagination, tag derivation, or adjacent-note calculation.

Korean and English:

- lists are independent;
- page counts are independent;
- tags are independent;
- previous / next Note sequences are independent.

Preserve the language segment in:

- Card links;
- Tag links;
- breadcrumbs;
- pagination;
- adjacent navigation;
- RSS;
- OG routes.

There is no top-level `/tags` route or breadcrumb branch. Tags remain nested
under `/notes/{lang}/tags/...`.

Tag-detail language controls are rendered only for languages in which the same
tag slug actually exists. Never assume a tag slug has a counterpart in both
languages.

## Translation pairing

`translationKey` identifies one logical Note across languages.

For a normal bilingual pair:

- exactly one `ko` Note and one `en` Note should share the same `translationKey`;
- unrelated Notes must not reuse that key;
- filename similarity is not the pairing contract;
- an unpaired Note is valid and must not produce a broken language toggle.

## Language-state architecture

There are two bilingual mechanisms.

### Static editorial pages

Home, About, and Research render both languages in the same document.

`LanguageToggle.astro`:

- shows / hides `[data-lang]`;
- updates `<html lang>`;
- stores `securityon-language`;
- updates the Header's prospective Notes link.

### Notes

Notes are explicit language routes.

Inside `/notes/{ko|en}/...`, the **URL language is authoritative**.

Note list, detail, tag-index, and tag-detail routes pass their explicit `lang`
to `Layout.astro`, so their generated documents start with a truthful static
`<html lang="ko">` or `<html lang="en">` value.

`Header.astro`:

- derives the Notes language from the URL when inside Notes;
- points the Notes nav item to the matching language index;
- keeps `<html lang>` aligned;
- stores that route language as the latest preference.

Outside Notes, `securityon-language` is preference state only.

Never allow stale localStorage to override an explicit Notes URL.

Do not reintroduce:

- `data-note-lang`;
- client-side visibility to choose Note content;
- language-based hiding of rendered Note articles;
- per-route localStorage-sync scripts that race Header;
- Header logic that trusts localStorage over `/notes/ko/...` or `/notes/en/...`.

These anti-patterns previously caused hidden Note bodies and intermittent KO/EN navigation mismatches.

Astro i18n currently exposes only `en`; KO/EN behaviour is application-level
rather than Astro locale-prefixed routing. Explicit Note-route layout props,
not Astro locale-prefixed routing, provide the static document language.

## Typography

### Korean

- `.ko-body` → RIDIBatang, line-height `1.8`.
- `.ko-ui` → Pretendard for Korean headings and interface-like text.
- Korean Note articles apply `.app-prose.ko-body` at the article boundary.
- Korean Note prose headings and table headers are reset to Pretendard.
- Korean Note titles, Card titles, adjacent Note titles, and similar UI headings should use Pretendard.

The RIDIBatang font face is registered at weight `400`, while Korean Note prose currently requests `300` because that rendered appearance was preferred after visual review. This is intentional. Do not automatically normalise it to `400`; check the rendered result first.

Prefer inheritance from the article boundary over long element-specific override lists.

English must not inherit Korean font classes.

Per-Note dynamic OG images use the local `RIDIBatang.otf` registered at weight
`400` for Korean titles. English titles retain the Google Sans Code bold
treatment. Keep the existing OG layout unless a task explicitly requires a
design change.

## Editorial conventions

Use concise technical prose with a restrained academic / research-journal tone.

Prefer British English where the wording is not an official name or quotation, e.g.:

- `programme`
- `analyse`
- `organisation`
- `behaviour`
- `modelling`
- `centre`
- `towards`
- `colour`

Preserve official names verbatim.

When editing bilingual static content, preserve both language variants.

## Visual conventions

Preserve a quiet academic journal aesthetic:

- narrow readable measure (`max-w-3xl`);
- subdued borders;
- restrained accent colour;
- modest headings;
- controlled whitespace;
- regular vertical rhythm;
- minimal UI.

Reuse existing colour / design tokens such as `background`, `foreground`, `accent`, `muted`, and `border`.

Avoid:

- new arbitrary colours;
- gradients;
- oversized hero typography;
- promotional cards;
- excessive shadows;
- strong decorative graphics;
- dashboard-like UI;
- unnecessary animation;
- portfolio-style visual excess.

### Section labels

Major labels use the shared `section-label` utility:

- application font;
- accent colour;
- uppercase;
- `text-sm`;
- medium weight;
- `0.16em` tracking.

Reuse it for comparable major labels instead of duplicating the full class list.

Nested labels may stay smaller when hierarchy requires it.

### About Career Journey

Keep the timeline archival and restrained:

- subtle vertical line;
- muted outlined historical nodes;
- current / latest milestone uses the existing accent colour;
- measured spacing;
- no cards;
- no gradients;
- no decorative icons.

Do not make the timeline visually dominant.

## Education display

Education is intentionally localised and two-line.

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

Do not:

- merge university and programme / degree onto one line;
- restore a graduate-school label in this Education display without an explicit content request.

If a formal context requires the official English graduate-school name, use:

`Graduate School of Technology & Convergence`

Do not use `Graduate School of Techno-Convergence`.

## Archives, RSS, and search

### Archives

Archives are intentionally retained even though `showArchives: false` currently hides the route.

Do not delete archive code merely because it is absent from navigation.

When editing Archives, keep them based on the `notes` collection and Note terminology.

### RSS

RSS is one combined Korean / English feed using:

- visible sorted Notes;
- language-aware Note URLs;
- `modDatetime ?? pubDatetime` for feed dates.

### Pagefind

`npm run build` runs Pagefind against `dist` and copies the Pagefind bundle to `public/pagefind`.

Only pages carrying `data-pagefind-body` are indexed; currently Note detail pages are the main indexed content.

Truthful static Note document languages produce separate `ko` and `en`
Pagefind indexes. `search.astro` selects the active Pagefind language from
`securityon-language` before initialisation and scopes RIDIBatang/Pretendard
result typography to Korean search results; English results retain the
application font.

## Safe editing workflow

Before editing:

1. Read this file.
2. Run `git status --short`.
3. Treat existing modifications as user-owned.
4. Inspect the relevant schema, route, helpers, components, styles, and history.
5. Trace multilingual consequences before changing shared routing or language logic.

While editing:

- preserve unrelated work;
- make the smallest coherent diff;
- prefer existing helpers, route constructors, tokens, classes, and utilities;
- avoid broad formatting rewrites during focused tasks;
- avoid speculative refactors;
- do not add redirects, dependencies, or abstractions outside scope without clear justification;
- do not opportunistically “clean up” unrelated remnants.

Validation:

- run `git diff --check`;
- inspect focused diffs;
- run `npm run build` after source, content, schema, routing, or style changes;
- use `npm run lint` or `npm run format:check` when relevant;
- report exact files changed, reasons, validation, and any warnings.

Never commit, push, reset, discard work, or perform destructive Git operations unless explicitly instructed.

## Architectural invariants

Do not violate these without explicit approval:

1. `notes`, not `posts`.
2. Explicit `/notes/ko/` and `/notes/en/` routes.
3. Language filtering before pagination, tags, and adjacent navigation.
4. URL precedence and truthful static `<html lang>` inside Notes; localStorage is preference state elsewhere.
5. `translationKey` is the translation-pair contract.
6. No `data-note-lang`.
7. No hidden dual-language Note articles.
8. RIDIBatang for Korean Note body; Pretendard for Korean headings / UI.
9. British English preference for non-official prose.
10. Archives are retained even when hidden.
11. No required legacy `/posts` redirects.
12. Preserve the restrained academic-journal visual identity.
