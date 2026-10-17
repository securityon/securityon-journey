# AI Agent course editorial record — 2026-10-17

## Author-confirmed facts

- One-day course at company headquarters on Monday 2026-10-12.
- Followed the August foundation course.
- Followed the handouts without creating a separate variant.
- Completed all exercises successfully and checked their operation.
- No additional measurements, tool transcripts or deployment results supplied.
- Public source remains first-person; provenance and editorial inventories stay here.

## Coverage map

| Source | Scope read | Note | Coverage |
| --- | --- | --- | --- |
| 1_들어가며_r5.pdf | PDF 29–37, Unit 3 onward only | 1 | Basic-course review; four engineering perspectives; rules, Skills, MCP, delegation |
| 2_Agent_View_기반_병렬_개발_r8.pdf | All 77 pages | 1 | Agent View, session lifecycle/background/other folders, worktrees, isolated changes, merge/conflicts |
| 3_AI_Application의_이해_r9.pdf | All 39 pages | 2 | Fictional report generation (10 planned/5 made), API PoC, FastAPI/HTML/JS, PRD/dashboard/chat |
| 4_Agent_Orchestration_기반_Agent_Application_구현_r5.pdf | All 81 pages | 2 + 3 | Deep Agents, prompts/tools/Skills/memory, persona chatbot, Playwright; Tool/MCP/A2A sequence, Emoji/Feedback, bounded iteration, code separation |
| 5_Agent_App_개발_프로젝트_r5.pdf | All 69 pages | 3 | Fictional insurance prototype, Supervisor, parallel UI/backend work, Full-Mesh, case memory reset, test-scope reduction, integration mismatch, extension tasks |

Selected diagrams, code and example outputs visually inspected in all five PDFs.
Do not publish slides or the complete extracted teaching material. Omitted repeated
installation screens, company/customer names, instructor-specific branding and
long prompt dumps. Retained important design decisions and stage changes.

## Supplementary primary references (read 2026-10-17)

- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- https://www.anthropic.com/engineering/building-effective-agents
- https://code.claude.com/docs/en/agents
- https://git-scm.com/docs/git-worktree
- https://docs.langchain.com/oss/python/deepagents/overview
- https://modelcontextprotocol.io/docs/getting-started/intro
- https://a2a-protocol.org/latest/topics/what-is-a2a/

The four-stage progression and the human/AI role split for agent engineering are
the course's teaching framework, not a claimed universal taxonomy. Supplementary
examples explain concepts rather than adding unreported course exercises.
Distinguish local session persistence from surviving a computer shutdown;
worktree isolation from integration correctness; Tool invocation from MCP/A2A;
and observed example operation from protocol conformance or real insurance use.
Model ID and effort are historical exercise conditions, not recommendations.
Deep Agents current documentation is supplementary, not proof of the installed
version or exact default behaviour used during the course.

## Draft metadata and next action

Three KO/EN pairs with publication times 2026-10-17T09:00:00+09:00 (part 1),
09:10 (part 2) and 09:20 (part 3), mirrored in each language. These explicit
author-requested offsets replace equal timestamps and sortOrder. All six remain
draft: true. No commit/push authorised. Read EDITORIAL_PROGRESS.md for the latest
validation and next action.

## Completion checkpoint

All three KO/EN pairs complete locally (96, 94 and 105 lines per language).
Lint, focused formatting, preview and final draft builds passed. Routes,
translations, series order, external links and six OG images checked. All
sources restored to draft: true and excluded from final publication output.
No commit or push performed. Read the latest EDITORIAL_PROGRESS.md checkpoint
before resuming; next step is author review.

## Author review — 2026-10-17 (supersedes earlier metadata/voice decisions)

The author clarified that the four engineering concepts were covered in detail
in August and practised with Codex and Gemini; only that earlier handout was
not attached. Removed lecturer/reviewer narration and editorial-supplementation
provenance from all three public pairs. Earlier practice is not limited by the
brevity of the October recap. Retained useful citations within explanations.
Explained timeline.py as integer year arithmetic, with a and b inputs and
forward/backward results. The 2026/10 → 2036/2016 calculation illustrates the
behaviour and is not a claimed captured test. Preserved technical identifiers,
historical exercise settings and genuine validation limits.

At the author's explicit request, use different publication timestamps:
part 1 2026-10-17T09:00:00+09:00, part 2 09:10, part 3 09:20, mirrored in
KO/EN. Removed redundant sortOrder values. Earlier equal-timestamp descriptions
above are superseded. AGENTS.md now covers participant voice, earlier learning
history, explaining example identifiers and validating series publication order.
All six Notes remain drafts; no commit/push is authorised. Starting snapshots
for the six Notes, guide and working plan were saved before this review.

## Author-review validation complete

All six revised Notes and the reusable guide rules are complete locally.
Preview and final draft builds passed. Verified actual generated timestamps,
KO/EN translation links, list order 3/2/1 and adjacent reading order 1/2/3.
Visually checked six OG images. Protected references and identifiers retained;
example inputs/calculations were explained without claiming new test output.
Draft routes, list entries and RSS items are absent from final build. Starting
snapshots and focused source diffs remain outside public content under
tmp/agent-author-review-20261017 for resumption/review. No commit or push.

## Selective figures and wording review — completed locally

Revised part 2 and 3 transitions to describe the previous Note, rather than
present the transition as a learning event. Expanded external Skill installation
with its concrete input (GitHub Skill page URL in chat), app action (retrieve and
install), conversational use selection and distinction from HTML Tool execution.
Added one explanatory SVG per part, with separate KO/EN assets under
src/assets/notes/ai-agent-course. Worktrees show separation/merge, the Skill flow
shows guidance versus action, and the orchestration figure preserves all central
Tool calls while adding expert-only A2A links. No copied slide images or new
runtime dependencies. Guide rules require selective, accessible figures rather
than a quota or retroactive sweep, and distinguish article references from past
learning. Metadata and publication times unchanged; all sources remain drafts.

Preview/final builds, lint, focused formatting and whitespace checks passed.
Actual built pages passed 18 browser checks (KO/EN × 3 parts × 1280/390/360px):
loaded optimised SVGs, alt text, no horizontal overflow. Mobile image zoom and
Escape dismissal passed. Six SVG renders and mobile screenshots visually checked.
Default bundled Chromium was unavailable; an isolated headless Edge session was
used for local pages only. Temporary browser helper removed after checks; source
snapshots, SVG generator and QA records remain outside published content.
No commit or push authorised/performed. Read the latest progress checkpoint.

## Figure/body balance — completed locally

Adjusted the six KO/EN SVGs to a 480px intrinsic width and compact heights of
approximately 495, 450 and 612px. Reduced box spacing, heading weight and line
weight while retaining readable labels, equivalent relationships and localised
text. Font stacks follow the site UI/application families with local fallbacks;
fonts are not embedded in the SVG images. AGENTS.md now requires checking figures
with their surrounding prose, including scale, whitespace and useful zoom.

Actual local Edge checks passed at 1280, 390 and 360px for all six pages. Visually
reviewed complete article context for each figure; mobile zoom/Escape remained
functional and no document overflow occurred. Preview and final draft builds
passed; all six Note sources are byte-identical to this pass's starting snapshot.
Final build excludes draft routes, lists and RSS entries. Measurements, context
screenshots, build logs and snapshots are in tmp/agent-figure-balance-20261017.
No commit or push. This request is complete locally.

## Publication approval — 2026-10-17

Author explicitly approved publishing all three parts and committing/pushing the
completed package. All six sources now use draft: false; publication offsets and
other content remain unchanged. Final publication build and generated KO/EN
routes, translation/adjacent links, newest-first series order, RSS, SVG references
and OG references/dimensions passed. Earlier draft-only statuses above are history.
Actual deployed appearance remains for later author review; do not check deployment
or the public site automatically after the authorised push.
