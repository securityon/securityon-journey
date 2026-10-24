# AVON webinar source review — 2026-10-24

## Scope and author confirmation

After reviewing the completed draft, the author explicitly requested commit and
push. Both Notes now have draft: false; all prose, figures, dates and pairing are
unchanged. This permission supersedes the earlier draft-only restriction below
for this specific AVON publication package. Temporary captions and source/QA
artifacts remain local and are not part of the commit.

The author confirmed attending the webinar on 15 October 2026 and gave its
Korean title: 「전 주제분야 학술 동영상 자료 DB, AVON 이용교육」. The current
request authorises writing a Note, not committing, pushing or publishing it.
The preceding Wiley push succeeded as e2ffcf0; its approval does not carry over.

Read root AGENTS.md, current progress, content schema and relevant existing
Notes before authoring. No nested src AGENTS.md found. Existing unrelated
Mac/Windows working records and temporary artifacts remain untouched.

## Sources actually reviewed

- Author-supplied AVON_교육자료_대학교__2026_.pdf: 12 physical PDF pages.
  Extracted and read all text; rendered all pages in a contact sheet and checked
  enlarged pages 7 and 9. Several printed footer numbers say 13 and do not match
  PDF pagination. Intermediate material is in tmp/pdfs/avon-20261024/.
- Official Korean guide: https://proquest.libguides.com/avonkr . The web lookup
  tool initially returned 429, but the in-app browser loaded it normally.
  It contains the current recording, 2026 PDF and menu/feature guide links.
- Embedded recording title: 261015_전 주제 분야 학술 동영상 자료 DB AVON 이용 교육.
  Vidyard player duration observed through the media DOM: 2600.24 seconds
  (43:20.24). Sixteen chapter entries were read from the visible menu.
- Reviewed the complete supplied Korean caption text: 1,133 timed cues, from
  00:00:00.120 through the final cue starting 00:43:17.714. Caption text was
  retrieved from the track URL actually present in the player DOM. Only text
  captions were saved locally; no video/audio media download or external upload.
  Do not persist the temporary signed caption URL in public or working records.
- Review was caption-led with selected video frames, not continuous listening
  to the entire audio. Actually viewed title, transcript, saved clip, citation
  export and the entry into Interactions. The citation frame clearly displayed
  Download .RIS Format, EndNote Fusion, APA6 and the original production data.
  The clip frame displayed a saved 4:46 institutional clip. A search-results
  frame displayed All titles: 85,325. Screens from the recording are not public
  assets or the author's own execution results.
- Player seeking could initially show the previous frame. Chapter navigation
  and later screenshots were used to confirm actual content; a progress slider
  value alone was not treated as proof of the displayed scene.

## Topic map and source boundaries

| Recording range | Content retained |
| --- | --- |
| 0:00–1:10 | Housekeeping omitted; product introduction follows |
| 1:10–7:20 | Scope, formats, library/proxy/RISS routes, production context |
| 7:20–13:10 | Transcript search/synchronisation, citations, clips and lists, Interactions |
| 13:10–20:01 | Collection browsing, newest additions vs production date, account, translated UI, grid/list views |
| 20:01–23:08 | Subject/content type/duration/date filters and Details |
| 23:08–25:04 | Search foods in transcript, select a match and move playback |
| 25:04–30:22 | Clip ranges, visibility, sharing, adding clip/full video to playlists |
| 30:22–32:38 | Citation styles, bibliographic export and reference managers |
| 32:38–35:46 | Interaction templates; multiple-choice example created, not every activity completed |
| 35:46–37:07 | Captions, Korean automatic translation, speed, quality |
| 37:07–39:20 | Return-to-collection navigation, keyword search combined with filters |
| 39:20–43:20 | Saved clips, Interactions, playlists, Watchlist, recent views and closing access reminder |

The final moments invite questions; no substantive closing Q&A is present in
the supplied caption text. No invented questions or answers were added.

## Editorial decisions

- One KO/EN pair: 2026-10-24-avon-academic-video-webinar.md and -en.md.
  Shared key avon-academic-video-webinar-2026, draft: true, publication metadata
  2026-10-24T09:20:00+09:00. Confirmed webinar date remains 15 October in prose;
  the draft metadata does not redefine attendance date.
- Combine PDF and recording by the research workflow, without file-by-file
  summaries, assistant provenance, or implying actual personal feature use.
- Describe collection size as more than 85,000 at the 2026 session. Captions
  briefly say 75,300 among repeated 85,300/85,325 references; do not turn this
  inconsistency into a new current count or force a precise numerical claim.
- Correct obvious caption errors such as KERS → KERIS and 기간 → 기관 through
  context and visible UI. Do not reproduce the speaker's blanket claim that
  free portal material cannot be cited. Availability, evidential quality,
  attribution and reuse permission are separate considerations.
- Do not guarantee universal RISS access or current library entitlement.
  Explain institutional access separately from the personal account, and refer
  readers to their library for their actual route.
- Preserve historical style editions as examples observed in the demonstration,
  not recommendations that APA6 or MLA8 are the required current editions.
- Distinguish clip playback-range/link storage, whole-video links, RIS metadata
  and downloading the actual video. Public clip visibility does not itself grant
  access to the licensed original. No broader copyright permission asserted.
- Link the citation workflow to the actual title of the EndNote Fusion Note in
  each language. Do not imply that a direct AVON-to-manager transfer was tested.
- Add a compact original conceptual SVG per language showing complete videos
  and selected-range clips both feeding into a Playlist. No third-party movie
  frames or slide images copied into public assets; no decorative image quota.
- Future application in the conclusion is intention, not completed research.

## Validation

Publication follow-up: final public build and lint passed after the authorised
draft flag changes. Verified KO/EN routes, language, translation links, list/RSS
inclusion and OG references. The generated 1200×630 OG PNGs exactly match the
visually reviewed previews by SHA-256. Focused Markdown/SVG formatting and source
whitespace checks passed; the same unrelated verification HTML formatting issue
remains the only repository-wide format failure. Prior responsive QA applies.
The approved six-file package is ready for commit/push; earlier draft checks
below describe the historical preparation stage.

Draft complete: 99 lines in each language. Custom Korean Note title is
「AVON: 학술 동영상 검색과 활용」; the official webinar title remains unchanged
in the opening. EN retains its natural descriptive title. Interactions wording
explains the method directly without presenting a complete set of tested
activities or narrating an editorial evidence boundary to readers.

Preview and restored-draft final builds passed. Lint, focused Markdown/SVG
formatting, source whitespace and git diff --check passed. Repository format
check failed only on existing public/naver7fe53df996acb7e90822345eedea536d.html;
that unrelated file was not edited. Browser QA at 1280/390/360px for KO/EN:
no document overflow, image centring error 0, image width 480/358/328px,
zoom/Escape working, translation links, new-tab links and two table wrappers
correct. Actual prose/figure screenshots and both 1200×630 OGs were inspected.
Final preview included the revised concise KO title and Interactions paragraphs.
Final draft build omits new public routes and OGs, with no AVON links in generated
HTML/RSS/sitemap. Pagefind indexed 60 public pages instead of preview 62.
No commit/push; EDITORIAL_PROGRESS.md contains the next review checkpoint.
