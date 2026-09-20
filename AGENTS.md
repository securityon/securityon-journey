# SecurityOn Research Journey — Codex Guide

## Purpose

SecurityOn Research Journey is BAN Seok's bilingual technical research journal
and engineering record. It documents graduate study, security research, AI and
local-LLM research, research workstation engineering, publication preparation,
experiments, and implementation decisions, informed by professional IT/security
experience.

Preserve its restrained research-journal character. It is not a marketing portfolio, startup landing page, dashboard, or decorative product site.

Write calmly, precisely, reflectively, and from evidence. Use first person where
appropriate; never make the record promotional or exaggerate outcomes. When
useful, connect the initial plan, observation, decision or change, reason, and
result or limitation. Let that sequence emerge through normal prose rather than
forcing repeated labelled subsections.

This root `AGENTS.md` is the persistent editorial and implementation working
agreement for future work in the repository.

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

Before creating a Note, inspect `src/content.config.ts` and relevant existing
KO/EN pairs. Follow the current schema rather than inventing frontmatter fields.

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

Keep pair filenames consistent: `YYYY-MM-DD-slug.md` and
`YYYY-MM-DD-slug-en.md`. Follow existing publication-date and timezone
conventions, explicit `lang`, semantic `translationKey`, tags, and
`featured` / `draft` usage. Preserve existing publication metadata during
editorial refinements unless changing it is part of the task.

Do not manually add a custom `ogImage` unless explicitly requested. Notes
normally use the shared dynamic OG generator.

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

Paired KO/EN Notes must remain factually equivalent. Apply substantive factual
or editorial changes to both versions while allowing natural phrasing in each
language.

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
- stores that route language as the latest preference.

Header does not directly mutate `<html lang>` for Notes. The static Notes
document language comes from the explicit route `lang` passed to
`Layout.astro`.

Outside Notes, `securityon-language` is preference state only.

Never allow stale localStorage to override an explicit Notes URL.

`BackButton.astro` must treat `sessionStorage.backUrl` as potentially stale
after a Note translation switch. If its Notes language differs from the
current Note URL language, fall back to `/notes/{currentLang}/`; do not
mechanically translate pagination or tag URLs across languages.

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

OG typography is separate from site prose typography; follow the shared OG
rules below.

### Numbered headings

Wrapped numbered headings must use a generic hanging-indent layout in both KO
and EN Notes. Continuation lines must align with the heading text after the
number, not with the far-left edge:

```text
2. First line of a long heading
   continuation aligned with heading text
```

This is a required visual behaviour for shared heading implementation, not a
claim that the current styles already implement it. When heading layout is in
scope, address it generically in shared rendering or styling; do not hard-code
particular headings, add manual breaks to individual Notes, or alter unrelated
styles during a content-only task.

Layout should not compensate for unnecessarily verbose headings. When a heading
becomes long, translation-like, or bureaucratic, prefer a concise, natural
heading that preserves the section meaning. Apply this judgement consistently
in Korean and English. Do not shorten official names or technical terms merely
for visual fit.

For example, where the section meaning allows, “Operating System, Licensing,
and Organisation Registration” may become “OS, Licence, and Device Registration”.
This is an illustration, not a global replacement rule for that wording.

### Markdown tables

Markdown-generated tables are wrapped by the shared rehype rendering path in
`.table-scroll`. Wide tables may scroll horizontally inside that wrapper, but
the document itself must not gain horizontal overflow. Do not add manual or
article-specific table wrappers to Notes; fix shared Markdown rendering or
styling instead.

## Editorial conventions

### Language

Use natural technical Korean. Retain common English technical terms when they
are clearer, avoid awkward translated terminology, and avoid marketing language.

Use natural British English rather than mechanically copying Korean sentence
structure. Prefer British spelling where the wording is not an official name or
quotation, including:

- organisation, behaviour, modelling;
- optimisation / optimised;
- programme where appropriate;
- licence as a noun, license as a verb;
- analyse, centre, towards, colour.

Preserve the official spelling of technical, product, application, and service
names. When editing bilingual static content, preserve both language variants.

### Terminology consistency

Choose terms by their role; do not rotate synonyms merely for stylistic variety.

| English term | Use                                                               |
| ------------ | ----------------------------------------------------------------- |
| laptop       | The physical Galaxy Book computer                                 |
| device       | Registration, management, Device Manager, or asset/policy context |
| workstation  | The configured research system or the laptop's research role      |
| environment  | The OS, software, development, or research environment            |

Avoid machine unless technically justified. Do not use notebook to mean the
physical laptop; preserve Jupyter Notebook and genuine notebook-computing
terminology.

| Korean term                | Use                                                  |
| -------------------------- | ---------------------------------------------------- |
| 노트북                     | Physical laptop                                      |
| 장비                       | Asset, hardware, registration, or management context |
| 연구 워크스테이션          | Configured research system                           |
| 환경 / 연구환경 / 개발환경 | Software and tooling layers                          |

Do not arbitrarily rotate 노트북, 장비, 기기, and 워크스테이션.

For removable Windows installation media, prefer USB installation media, USB
drive, or USB flash drive according to context. Avoid bare USB where a more
precise noun improves the sentence. Do not use pen drive as the primary term.

### Markdown semantics

Use styling according to semantic role, not decoration:

- Reserve first-meaningful-occurrence bold primarily for named applications,
  products, services, or UI-facing tools, such as **Samsung Device Care**,
  **Samsung Settings**, **Galaxy Book Experience**, **Microsoft 365**, **Zotero**,
  and **Firefox**. Nearby subsequent mentions may be plain text. Preserve
  official product spelling, and do not add quotation marks merely to make names
  stand out.
- Do not bold general technologies, standards, protocols, frameworks, or Windows
  features merely because they are proper names. BitLocker, WSL2, CUDA, PyTorch,
  Windows Update, WinRE, OneDrive, and Pagefind normally remain plain prose unless
  emphasis is contextually useful. Use editorial judgement rather than
  mechanically bolding every trademark.
- Use bold for UI labels, menu items, buttons, and selectable modes, such as
  **Battery Protection**, **High Performance**, and **Settings**.
- Inside tables, do not force first-occurrence bolding when the table structure
  already makes the semantic role clear. Prefer clean, readable cells over
  decorative emphasis; use bold only when it communicates a real distinction
  or emphasis.
- Use inline code for commands and command names, paths, filenames, package
  identifiers, registry keys, environment variables, and exact technical values
  or status strings where distinction is useful. Examples: `winget export`,
  `D:\Lab`, `GoldenResearch.wim`, `AzureAdJoined`, and `Fully Decrypted`.
- Do not use inline code merely to style a normal product name.
- Use Korean title brackets such as 「...」 where appropriate when referring to
  Korean Note or article titles in prose.

Avoid excessive bolding. Emphasis should make semantic categories easier to
scan. Check actual Markdown source for accidental literal escape artefacts;
do not change valid syntax because a chat copy displayed it differently.

### Factual discipline

Notes document real research and implementation work. Never invent commands
that were not run, results that were not observed, version numbers, performance
measurements, configuration states, failure causes, security-policy details,
activation mechanisms, or benchmark results.

Clearly distinguish observed facts, decisions, planned future work, inferences,
and unverified possibilities. If a cause was not determined, say so. Do not turn
planned work into completed work or imply that a configuration was validated
when only its presence was observed.

### Commands and technical evidence

Use code blocks only when they materially improve the technical record. Prefer
a few representative state-changing commands, relevant output excerpts, and
small before/after or decision tables over long command dumps. Preserve exact
commands and outputs when they form part of the actual research record.

Do not turn a research Note into a step-by-step beginner tutorial unless that
is its explicit purpose. Explain decisions and boundaries as well as actions.

### Historical design decisions

Do not silently rewrite an older architecture or design Note merely because
implementation evolved. Document what the original design assumed, what actual
implementation revealed, what changed, and why the new decision was preferable
in the subsequent implementation record.

Revise an older Note only when explicitly requested or when correcting a clear
error. Preserve original design snapshots and keep implementation-specific
history in the relevant Notes.

## Security and privacy

Generalise organisation-specific details. Never expose:

- product keys, passwords, or tokens;
- tenant IDs;
- personal account email addresses unless explicitly required;
- internal hostnames, domains, or IP addresses;
- proxy addresses;
- certificates or secrets;
- sensitive security-policy details.

Generic enterprise controls such as Proxy, Firewall, CA, SSL/TLS Inspection,
EDR, DLP, and Application Control may be discussed without disclosing internal
identifiers or policy specifics.

## Shared dynamic Note OG images

The shared implementation is
`src/pages/notes/[lang]/[...slug]/index.png.ts`, producing per-language
`/notes/{lang}/{slug}/index.png` assets. Do not special-case individual articles.
Any OG change must work generically for existing KO Notes, existing EN Notes,
and future Notes. Preserve the template unless OG work is part of the task.

The visual direction is:

- warm cream editorial layout;
- charcoal typography and muted brown accents;
- the SecurityOn mountain visual inherited from the main OG identity;
- RIDIBatang for Note titles and descriptions in both languages;
- Google Sans Code for UI, metadata, and branding.

The current renderer uses local `RIDIBatang.otf` at weight `400` for both KO and
EN titles and descriptions. Do not confuse these roles with site headings,
which follow the site typography rules above.

OG text layout must:

- avoid breaking Korean words, English words, or acronyms in the middle;
- wrap Korean descriptions at sensible word or space boundaries;
- truncate descriptions only at complete word boundaries;
- keep metadata sparse;
- adapt gracefully to short and long titles.

If CSS or Satori word-breaking is unreliable, prefer a reusable helper that
builds lines from tokens over article-specific hard-coded breaks. Treat these
as layout requirements to verify during OG work, not as proof that every
current rendering already satisfies them.

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

### Back-to-top and responsive layout

The Note detail page's `app-layout` containing-block structure is the reference
placement for `BackToTopButton`. Preserve the same structure on general
editorial pages; do not add page-specific offsets or modify
`BackToTopButton.astro` merely to compensate for inconsistent page structure.
Preserve its progress ring, viewport-safe mobile placement, z-index,
click-to-top behaviour, and Astro client-side navigation behaviour.

For changes affecting shared layout, Markdown rendering, or Back-to-top
behaviour, verify where relevant:

- desktop around 1280px and mobile around 390px and 360px;
- no document-level horizontal overflow and wide tables scrolling only inside
  `.table-scroll`;
- the button remains inside the viewport, its progress ring stays visible, and
  clicking it returns the scroll position to `0`;
- behaviour survives Astro client-side navigation.

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

`pnpm run build` runs Pagefind against `dist` and copies the Pagefind bundle to `public/pagefind`.

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
6. Check for applicable nested `AGENTS.md` files when working in a subdirectory.

While editing:

- preserve unrelated work;
- make the smallest coherent diff;
- prefer existing helpers, route constructors, tokens, classes, and utilities;
- avoid speculative refactors;
- do not add redirects, dependencies, or abstractions outside scope without clear justification;
- do not opportunistically “clean up” unrelated remnants.

Do not modify unrelated Notes, layouts, styles, routes, or configuration unless
required by the task. If a request reveals a reusable rule, prefer a concise
`AGENTS.md` update or, when implementation is in scope, shared styling/rendering
logic over repeated article-specific workarounds. A newly documented rule does
not authorise a retroactive sweep of existing content or implementation.

### Formatting and line endings

Limit formatting writes to task files during focused work. Run a repository-wide
formatting write only when explicitly requested as a formatting-normalisation
task, and keep functional changes separate from broad formatting-only changes
when practical.

`.gitattributes` is the source of truth for text line endings and specifies
`* text=auto eol=lf`. Preserve LF in text files; do not introduce CRLF or mixed
line endings. Do not change `.gitattributes`, `core.autocrlf`, or other Git
line-ending policy unless the task explicitly requires it.

### Validation

Repository-wide `pnpm run format:check` is a normal validation check and is
expected to pass. Continue running `pnpm run lint`, `pnpm run build`, and
`git diff --check` as appropriate to the task.

When creating or editing Notes:

1. Run `pnpm run lint`.
2. Run `pnpm run build`.
3. Run `git diff --check` and inspect the focused diff. New untracked Notes also
   need whitespace review; ordinary `git diff` does not include them.
4. Verify the relevant generated KO/EN routes and translation links.
5. Verify the relevant dynamic OG PNGs and the pages' OG image references.

For other source, schema, routing, or style changes, run `pnpm run build` and
checks appropriate to the change, including `pnpm run lint` where relevant.
Documentation-only changes to this guide need focused Markdown and diff checks;
a site build is not required.

At completion, report the files changed, important editorial or technical
decisions, validation results and warnings, and factual ambiguities deliberately
left unresolved. State when a required check could not be completed.

Never commit, push, reset, discard work, or perform destructive Git operations unless explicitly instructed.

## Maintaining this guide

Treat this file as the persistent project working agreement. When future work
reveals a reusable rule, propose or make a concise update when appropriate to
the task. Do not add one-off article facts, installation inventories, or dated
implementation history here; keep those in their relevant Notes.

Keep this guide focused on reusable editorial, engineering, validation, and
security conventions. Distinguish required future behaviour from verified
current implementation, and correct stale implementation descriptions after
checking the source.

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
13. The static 404 REQUEST display uses
    `window.location.pathname + window.location.search`; build-time
    `Astro.url.pathname` identifies the generated 404 document, not
    necessarily the browser's missing URL.
