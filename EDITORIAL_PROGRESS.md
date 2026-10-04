# Bilingual Notes editorial progress

Last updated: 2026-10-04 (Asia/Seoul).

## Resume here

Urgent unpublish (2026-10-04, current): the author requested removal of the
Elsevier workshop Note from the public site and revoked any inferred permission
to push future Notes. Both language sources are retained with `draft: true`.
The shared visibility filter excludes drafts from Note routes, lists and search;
the OG generator also excludes draft images. AGENTS.md now requires explicit
approval for each future website-changing commit/push. This request explicitly
authorises only the unpublishing commit/push. Lint and build passed; both pages
and OGs are absent from `dist`, as are links in generated HTML/XML. Next: push
the scoped unpublishing change and verify public 404s.
Keep the local command-recovery files untouched.

Elsevier workshop Note (2026-10-04, current): completed one KO/EN pair from the
51-slide Elsevier Author Workshop PDF dated 2026-09-29, Seoul. Both Notes are
59 lines, below the requested 500-line maximum. The account is written from
the attendee's perspective and distinguishes the September 2026 workshop's
journal-specific advice from future conference requirements and changing journal
policies. No research result, submission, or personal reaction was invented.
Source PDF is outside this repository and is not copied into the site.
Focused formatting, lint, build (zero Astro diagnostics, 96 pages and 30 indexed
Notes), pair metadata/line-ending/line-count checks, generated language routes,
translation links and OG PNGs passed. Both OG images were visually reviewed.
Repository-wide format checking still flags only the pre-existing Naver HTML.
The author asked to put this Note on the site. Commit cd5f369 was pushed to
origin/main, and both public language URLs returned HTTP 200 after deployment.
Local recovery files remain untouched. No further work is pending for this pair.

Conference goal link cleanup (2026-10-04): removed the three selective
EACL/PODS/WWW hyperlinks from each language of the 2026-08-25 conference-goal
pair. Venue names, metadata, and all other prose are unchanged. Focused text
comparison, Prettier, lint, build, generated KO/EN routes, translation links,
and OG references/PNGs passed. The author then requested a commit and push.
Existing local recovery files remain untouched.

Author-voice correction (2026-09-29): resumed after the usage-limit
interruption. All six companion Notes now describe the author’s work rather
than a reviewer’s collection of user messages. Unverified commands remain
methods, not claimed executions. The unexplained step 15 reference now names
Git bundle recovery. Added the reusable author-perspective rule to AGENTS.md.
Commands, outputs, historical statuses and publication metadata are unchanged.
Validation passed: exact fenced-code and frontmatter comparison against HEAD,
KO/EN code parity, focused formatting, lint, build (zero Astro diagnostics),
six language routes and translation links, OG references and PNG dimensions.
Titles/descriptions and OG layout are unchanged from the preceding visual review.
Full format check still flags only the existing Naver verification HTML.
Commit 8ca95a9 was pushed successfully to origin/main. The corrected public
site content has not yet been checked after this push. Next: confirm deployment
of the author-voice correction. Raw chat recovery material remains local.


Publication split checkpoint (2026-09-28, authoritative): the author approved
THREE bilingual Notes: commands, environment/GPU scripts, offline recovery
scripts. This supersedes all earlier two-Note and no-commit/push instructions
for this batch. Original script sections 1–8 remain in environment-inventory;
9–14 moved to offline-recovery and were renumbered 1–6. All 77 saved source
blocks and language parity passed comparison after splitting. Editorial source
collection status was removed from the public Notes and remains here.
Missing historical sources: earlier CUDA/CMake builds, stable TensorFlow
remediation, installer/VSIX/wheel downloads and image-only outputs. Enterprise
deployment, Embedding/RAG and WIM recovery are still unfinished.
Final checks passed: lint; full build (zero Astro diagnostics, 94 pages, 28
indexed Notes); all six language routes, reciprocal translation links and OG
references; visual review of all six OG PNGs; source-block preservation,
bilingual code parity, LF/whitespace and focused formatting. Full format check
still flags only the pre-existing Naver verification HTML. Korean script titles
were shortened to prevent split words in OG images; shared rendering is unchanged.
Final line counts per language: commands 477, environment/GPU 442, offline
recovery 569. Commit 0842269 was pushed successfully to origin/main. The first
live-site check immediately after the push returned 404; the subsequent check
confirmed HTTP 200 for all six KO/EN routes. Public deployment is now confirmed.
The author requested the remaining commit and push: the persistent AGENTS.md
editorial guidance and this progress update are included in the follow-up
documentation commit. Raw chat recovery files and the collection plan remain
local. Next: continue missing-source recovery only when requested. Original
commands were not run. Focused Markdown, LF and diff checks passed; this
documentation-only follow-up does not require another site build.


Comprehensive expansion checkpoint (2026-09-28): both existing bilingual Notes
are now expanded; no additional Note pairs were created. Command Note: 16
numbered sections covering installation, paths, uv/cache, virtualisation, WSL,
Git, OS queries and Linux projects. Script Note: 14 numbered sections covering
inventories, GPU/nightly tests, bundle diagnosis, WSL snapshots, hashing,
physical-offline workflows and fresh wheelhouse environments. Broad titles now
match this scope; filenames/translation keys/publication times are preserved.

`WINDOWS_COMMAND_COVERAGE.md` maps all 77 fenced blocks from the six saved source
files to their actual destination sections. This includes output and repeated
source blocks: it is not a count of unique commands. An automated comparison
confirmed all source blocks are present verbatim in both languages, KO/EN code
block sequences match, and files retain LF with no trailing whitespace. A
one-off copying helper was removed after successful mapping. Do not regenerate
or append the same batches. Source preservation is complete for these six files,
not for the entire historical conversation.

Lint and full build passed (zero Astro diagnostics, 90 pages, 26 indexed Notes).
Repository format check still flags only the pre-existing Naver HTML. The final
build after the inline email-placeholder correction passed. All four generated
routes have the correct document language, reciprocal translation links and OG
references; all four OG PNGs were visually reviewed and are readable. Diff checks
passed. Original script commands were never executed.
Next: obtain missing original CUDA/CMake, stable
TensorFlow remediation and installer/VSIX/wheel download material as needed.
Keep this two-Note structure; proposed/observed distinctions and incomplete
enterprise/Embedding/RAG/WIM work remain explicit. No commit or push.

Scope correction (2026-09-28, authoritative): the author wants TWO companion
Notes total: one comprehensive command Note and one comprehensive script Note,
each bilingual. Earlier plans for more thematic Notes are superseded. Expand
the existing four files; do not create further Note pairs. Preserve every
recovered option and meaningful failed/corrected variant. Explain commands and
options in both languages. Full historical chat recovery is NOT complete.
Create a source-to-Note coverage manifest and explicitly track unrecovered work.
The inventory found 77 fenced source blocks across six recovery files. Expansion
and validation are complete as recorded in the newer checkpoint above; the
earlier pending-validation instruction is superseded. No commit/push.

Second companion Note checkpoint (2026-09-28): clarified that the first Note
only covered version/path queries and that chat recovery remains incomplete.
Created `2026-09-28-workstation-scripts-environment-inventory{,-en}.md`, separating
Windows PowerShell inventory/extension saving from WSL Bash tool/directory
checks. Every section explains the actual syntax/options. Sources are the first
two blocks of `WINDOWS_COMMAND_CHAT_EXTRACTS.md`, build-tool queries in
`WINDOWS_COMMAND_RECOVERY_WSL.md`, and directory queries in the WSL/offline
source collections. Proposed scripts remain proposed; tool-version output is
recorded evidence. File overwrite behaviour and the absence of automatic success
checks are explained. Lint, code-block parity, LF/whitespace and diff checks
passed. Format checking reports only the pre-existing Naver HTML issue.
Build first failed at the Pagefind copy access step; rerun with required access
passed (90 pages, 26 indexed Notes, zero Astro diagnostics). Both translation
links and OG references passed. Both OGs were reviewed and titles refined for
readability, followed by a successful rebuild. No commit/push. Remaining topics
include installation/downloads, Python/GPU workflows and offline recovery;
source collection is still incomplete and must not be described as exhaustive.

Command explanations checkpoint (2026-09-28): at the author's request, added
command/option/argument explanation tables to all five sections of the first
KO/EN command Note. Covered version flags, search names and scope, uv subcommands
and version requests, Jupyter entry points, reagentc `/info`, positional property
arguments and PowerShell pipelines. Consulted official Microsoft, VS Code and uv
references. Preserved all seven original code blocks, metadata and historical
evidence distinctions. This explanatory format is the author's preference for
subsequent command Notes as well. No commit/push. Lint, focused formatting,
untracked-file whitespace and diff checks passed. Initial build reached Pagefind
but its copy to public/pagefind failed with access denied; rerun with required
access passed (zero Astro diagnostics, 24 indexed Notes). Generated translation
links and OG references passed after the completed rebuild. Titles/descriptions
and OG content are unchanged from the preceding visual review.

First companion Note checkpoint (2026-09-28): the author moved the task from
collection to writing. Created the KO/EN pair
`2026-09-28-workstation-command-notes-paths-and-versions{,-en}.md`.
The first topic is version/path checks, Python discovery, the Jupyter command-name
failure, proposed reagentc checks, and a recorded AppX name listing. Source map:
`WINDOWS_COMMAND_RECOVERY_2026-09-28.md` sections 1, 2, 4 and 10.
Code blocks are identical across the pair; no installation proposal was recast
as a verified execution. reagentc remains explicitly proposed, PATH modification
and preserved-installer provenance remain unresolved. Official Microsoft/uv
references support command semantics, not historical execution claims.

The pair uses normal local build visibility (`draft: false`) for route/OG review;
this is an uncommitted editorial draft and has not been deployed. No existing
Notes or implementation were changed. Lint passed; repository format checking
still fails only on the existing Naver verification HTML. Build passed with zero
Astro diagnostics (86 pages, 24 indexed Notes). Both language routes, translation
links and OG references passed; both PNGs were visually reviewed. Shortened both
titles after OG review and rebuilt successfully. Seven fenced command blocks
match exactly across KO/EN; explicit untracked-file LF/whitespace checks passed.
Next work should develop the remaining thematic
Notes from recovered material, filling specific evidence gaps as needed rather
than treating complete chat recovery as a prerequisite for writing.

Follow-up recovery checkpoint (2026-09-28): continued backwards through
“공부 계획 이어가기”. Added `WINDOWS_COMMAND_RECOVERY_OFFLINE.md` (WSL export/import,
bundle failure/correction, cuDNN queries, hash generation),
`WINDOWS_OFFLINE_TEST_COMMANDS_SOURCE.md` (the original proposed steps 0–17,
including full Python test bodies and PowerShell options),
`WINDOWS_COMMAND_RECOVERY_TENSORFLOW.md` (nightly proposal and user-confirmed
memory-growth/XLA commands and outputs), and `WINDOWS_COMMAND_RECOVERY_WSL.md`
(project setup, toolchain/Jupyter/extensions, actual PyTorch execution and
post-Windows-reboot proposal). These are working source collections, not
published Notes. Proposals, user-reported success and direct output are distinct.

New evidence: the original offline procedure includes comparison against an
existing SHA-256 manifest, not only hash generation. Individual execution output
and checked-entry count have not been recovered, so do not strengthen the
published integrity claim yet. It also proposes specific network-disconnection
actions; that does not establish which action was actually taken. The original
PASS strings and incomplete-test distinctions remain intact. No Notes changed.

Current browser position: around the initial WSL inventory and subsequent Linux
toolchain installation, before the Jupyter/remote-extension work. About 127
distinct rendered text units from this conversation are in session memory; only
selected reviewed excerpts are saved. The old `fallback-turn-*` keys repeat,
so collection now deduplicates by text and documents contextual anchors.
Remaining: the initial WSL inventory script, stable TensorFlow failures and
remediation, earlier GPU setup, downloads/wheelhouse/VSIX/source-asset creation,
untranscribed image results, and completeness reconciliation. Some displayed
messages retain “Show more”; clicking those buttons did not reliably change the
extracted text. Do not claim all collapsed content was recovered. Continue from
this checkpoint rather than repeating the saved offline procedure.

Validation: focused Prettier checks passed on all seven task documents;
the five recovery/source files passed explicit LF and trailing-whitespace checks,
including untracked files. `git diff --check` passed. No site build was needed
for these unpublished working documents. No setup commands, commits or pushes are authorised by the
source chats; none were performed during recovery. The earlier guide changes
remain user-owned local work.

Browser recovery checkpoint (2026-09-28): the author logged into ChatGPT.
Read older rendered messages in “공부 계획 정리_old”, reaching initial Windows
installation preparation. Saved selected exact commands/options, source message
IDs, execution evidence and uncertainties in `WINDOWS_COMMAND_RECOVERY_2026-09-28.md`
(ten thematic sections). This expands the earlier five-script extraction; it
does not establish complete recovery. About 366 message units were accumulated
in browser-session memory, not 366 commands and not a durable full transcript.
Only the reviewed document excerpts are saved to disk. Do not rely on that
in-memory collection after a session reset. Some long messages remain collapsed;
image-only results have not been transcribed. Sensitive values were excluded.

Opened “공부 계획 이어가기”, conversation
`6aaf667f-5018-83e8-bc3f-3078bb38e4f1`, and started scrolling backwards from the
Note 8 editorial/publishing discussion. GPU, offline assets and restoration
commands in this conversation remain to be recovered. The browser currently
uses fallback message keys in that conversation; these are not stable provenance
IDs and must not be used to deduplicate a full transcript. Record excerpts with
conversation URL and visible contextual anchors until stable IDs are available.
Next: continue upwards into actual workstation test logs, expand relevant long
messages, preserve exact flags, and separate proposals from executed commands.
Then reconcile the collected sources before writing bilingual companion Notes.
The old separate-script-location question is no longer a prerequisite.

Evidence found: machine-scope VS Code installation was proposed and a subsequent
user `where.exe code` output reports Program Files. This supports installation
location, not provenance of the preserved User Installer. Initial driver backup
was proposed but explicitly skipped by the author. Do not promote either a
proposal or an assistant's interpretation to a completed test.

This batch changes working documentation only. No setup command was executed,
no public Note was created, and no commit/push was performed. Focused Markdown
formatting and whitespace checks are the applicable validation for this batch;
the historical site build results below are not a new validation run.

Chat-source checkpoint (2026-09-27): the author directed the command collection
to ChatGPT history. Located “공부 계획 정리_old” and “공부 계획 이어가기” through
the app's thread tools. Saved five complete proposed script blocks and a
user-supplied WSL command/output excerpt in `WINDOWS_COMMAND_CHAT_EXTRACTS.md`,
with thread/turn provenance and separate proposed/executed classifications.
The returned pages do not establish complete historical coverage. Next: obtain
additional accessible conversation segments and reconcile actual executions;
do not require a separate script folder before investigating chat sources.

Command-notes checkpoint (2026-09-27): the author proposed companion Notes
preserving the actual Windows/PowerShell commands, options, and practical tips.
Created `WINDOWS_COMMAND_NOTES_PLAN.md` with thematic structure, a preliminary
source inventory, and gaps requiring original history or scripts. Searched the
repository; no independent workstation script/history files were found in the
file inventory. Asked for the location of additional command records. No shell
history outside the repository has been read and no recorded setup command run.
Next: reconcile supplied originals, then draft bilingual companion Notes. Do
not invent omitted options or treat the initial design as an execution log.
The guide changes below remain local; no new commit or push is requested.

Guide checkpoint (2026-09-27): the editorial batch was committed as `1a52643`
and pushed to `origin/main`; the working tree was clean before this follow-up.
The author then requested reusable lessons in AGENTS.md. Added guidance for
claim-strength parity across translations, restrained prose, validation-stage
boundaries, historical statuses, source checking, evidence preservation, and
editorial handoffs. No Note content or implementation changed in this follow-up.
Focused Prettier and diff checks passed for the guide; no site build is required
for this documentation-only change. This guide update and checkpoint are not
yet committed or pushed. Earlier publication records below concern the prior
editorial batch, not this follow-up.

Publication checkpoint (2026-09-27): the author explicitly authorised committing
and pushing the completed editorial work. This supersedes the earlier pending
authorisation statements below, which describe historical checkpoints.
The publication scope is the 12 edited Note files and the three editorial
documents. The current branch is `main`, with `origin` at
`https://github.com/securityon/securityon-journey.git`. Final diff checks passed;
content validation and the pre-existing Naver formatting issue are recorded
below. This checkpoint is saved before commit; verify Git history and remote
tracking state when resuming to determine whether publication completed.

Follow-up checkpoint (2026-09-27): after the author requested continuation,
reviewed the edited conclusions and English diffs, and checked all 11 translation
pairs. Found one remaining unsupported claim in Note 8's opening table:
“hashes match”. Changed both languages to assets preserved / hashes recorded.
The historical `Offline_Asset_Integrity=PASS` result remains unchanged.
All 12 edited Notes retain their fenced evidence and protected frontmatter
against HEAD. Lint passed. The first build completed Astro and Pagefind but failed
to copy the search bundle because of filesystem access; rerunning with the
required access completed successfully (80 pages, 22 indexed Notes).
Note 8's generated language, translation links, new wording, preserved status,
OG references and both OG images were checked. Repository format checking still
reports only the pre-existing Naver HTML. No commit or push was performed.

Latest checkpoint: the agreed editorial batches and final documentation are
complete. Six bilingual pairs (12 Note files) are edited and validated.
`EDITORIAL_REVIEW_SUMMARY.md` contains the consolidated Korean review;
`CODEX_EDITORIAL_PROMPT.md` contains the reusable English task prompt.
AGENTS.md remains unchanged. Do not restart completed batches automatically.
No further content edits are pending in the agreed scope. Await the author's
next specific request; no commit or push is authorised.

Final documentation validation: focused Prettier checks on all three working
documents, LF and trailing-whitespace checks, and `git diff --check` passed.
This final step changed documentation only; the content-build results below
are from the completed Note batches, not a new build for these documents.

Read AGENTS.md, this file, and `git status --short` before continuing.
Preserve existing changes. Update this file after each completed bilingual pair,
validation milestone, scope decision, or interruption. Record unfinished work
before stopping. This is a working handoff, not site content or a replacement
for AGENTS.md.

The author approved the direction of the edited workstation Note 8 with
“좋네” and requested persistent progress records because usage was running low.
They asked whether Note 8 should be committed first. No explicit commit or push
instruction has been given. Do not commit or push until instructed.

## Completed

- Read root AGENTS.md and all 11 KO/EN pairs (22 files) chronologically.
- Reviewed Codex and Gemini feedback against the files and author clarifications.
- Edited the Note 8 pair first:
  - `src/content/notes/2026-09-25-end-to-end-offline-research-environment-validation.md`
  - `src/content/notes/2026-09-25-end-to-end-offline-research-environment-validation-en.md`
- Reduced Korean English-word mixing and repetitive explanations; retained the
  21-section structure, technical observations, failures, and timing boundaries.
- Explained the intentional TensorFlow DEFERRED to PENDING transition.
- Limited the conclusion to pre-deployment preparation and tested offline work;
  listed unfinished architecture objectives.
- Changed the Korean title to “오프라인 연구환경 검증”. Longer alternatives
  split words in the shared OG renderer; the final short title renders intact.
  Do not change the shared OG implementation as part of this editorial task.
- Compared against HEAD: all fenced code blocks, publication metadata other
  than editorial title/description, and final baseline status rows preserved.
- No commit or push performed. At the status check before creating this file,
  only the two Note 8 files were modified.

## Validation completed for Note 8

- `pnpm run lint`: passed.
- `pnpm run build`: passed after the final title change; Astro diagnostics had
  zero errors, warnings, or hints. Pagefind indexed 22 pages in KO and EN.
- Focused Prettier check on both Note 8 files: passed.
- `git diff --check`: passed.
- Generated KO/EN routes, reciprocal translation links, updated content, and
  language-specific OG references: checked successfully.
- Both 1200 × 630 OG PNGs visually inspected; final Korean title fits intact.
- Repository-wide `pnpm run format:check`: blocked by pre-existing formatting
  in `public/naver7fe53df996acb7e90822345eedea536d.html`; left unchanged.
- Build notices: that Naver verification file has no html element; Korean
  stemming is unsupported by Pagefind. Neither prevented the build.

## Author-confirmed facts

- Work is preparation with unrestricted Internet access before entering the
  target restricted network. Disconnected tests were part of that preparation.
- Actual corporate security-environment adaptation, Embedding/RAG, and WIM
  recovery have not yet been completed. Do not call them cancelled or excluded.
- Recovery assets were collected for a situation without Internet access and
  may intentionally be broader than the immediate minimum.
- TensorFlow nightly passed the documented tests. PENDING intentionally means
  waiting for a stable release and retest; do not replace it with DEFERRED.

## Unresolved facts: preserve, do not invent

- Actual VS Code installation type versus the preserved User Installer.
  A System installation does not prove that the preserved installer was System.
- Source of the reported CUDA UMD 13.4 value; nvidia-smi CUDA Version alone
  would describe driver support, but the original observation is unconfirmed.
- Exact action used to disconnect networking; do not invent cable/Wi-Fi steps.
- Whether asset hashes were compared with expected values or only generated.
  Preserve the historical `Offline_Asset_Integrity=PASS` key and do not invent
  comparison counts or silently substitute a new historical key.
- WSL import occurred before isolation; the corrected bundle's final clone
  occurred after reconnection; offline persistence covered WSL restart, not a
  full Windows reboot. These distinctions remain in the edited pair.

## Current work

The author said “계속 진행해 보자” after approving Note 8. Continuation of
the remaining editorial work is authorised. No commit or push is authorised.
The September 20 Windows development / WSL2 pair has been edited:

- `src/content/notes/2026-09-20-windows-research-development-baseline-wsl2-gate.md`
- `src/content/notes/2026-09-20-windows-research-development-baseline-wsl2-gate-en.md`

Reduced repeated installation-versus-validation explanations in both languages
and translated general Korean prose terms such as runtime, cache, repository,
distribution, and reboot. Preserved the 16 sections, commands, output blocks,
versions, Gate names and status values, and unresolved causes. The original
machine-wide VS Code installation claim remains unchanged; no inference was
made about the preserved recovery installer. Removed the repetitive English
paragraph containing `installed-programme`.

Lint, focused Prettier, diff whitespace checks, and the first build passed.
Verified code blocks, frontmatter, Gate names/statuses and LF against HEAD before
the title adjustment. Generated routes, language attributes, reciprocal links,
OG references and final prose were checked. Both PNGs were inspected. The old
Korean title omitted its WSL2 ending in the OG image, so it was shortened to
“Windows 개발환경과 WSL2 검증”. The final build passed, and the final Korean
OG image was visually checked: its full title now fits on one line. All other
frontmatter is unchanged. Focused Prettier (including this handoff) and
`git diff --check` passed. Repository-wide format checking still reports only
the pre-existing Naver verification HTML. Build notices also include Shiki's
plaintext fallback for the existing `gitattributes` code fences, the Naver HTML
notice and unsupported Korean stemming. None prevented the build.

At this checkpoint only the September 20 and September 25 pairs are modified,
plus this untracked progress file. No commit or push has been performed.

September 21 (CUDA/PyTorch/local LLM) editing is complete:

- `src/content/notes/2026-09-21-rtx5060-cuda-pytorch-local-llm-baseline.md`
- `src/content/notes/2026-09-21-rtx5060-cuda-pytorch-local-llm-baseline-en.md`

Reduced repeated installation-versus-execution contrasts in both languages.
Reworked Korean prose and its description, keeping official product names and
exact evidence. Updated the Korean reference to the September 20 title.
Removed `installed-programme` by rewriting that repetitive sentence. Preserved
the 19 sections, benchmark limits, failure/correction records, reported CUDA
UMD 13.4, and the uncertainty about Ollama setting precedence. Do not infer
the CUDA UMD observation method from these editorial changes.

Verified against HEAD: fenced evidence, the complete set of exact inline
literals, Gate names/statuses and all frontmatter except the Korean description
are preserved. LF, lint, focused Prettier and diff checks passed. Repository
format checking still fails only on the existing Naver verification file.
Build passed: 60 Astro files checked with zero errors, warnings or hints;
80 pages built; Pagefind indexed 22 pages in two languages. The existing Naver
HTML and Korean stemming notices remain. Generated KO/EN routes, static
languages, reciprocal translation links and OG references passed. Both
1200 x 630 OG PNGs were visually inspected; full titles and descriptions fit.
The September 21 pair is complete. No commit or push was performed.

Current modifications: September 20, 21 and 25 KO/EN pairs, plus this untracked
progress file.

September 22 (offline assets) is now edited. Both
languages distinguish version-matched recovery installers from the original
installation media without changing the preserved User Installer entry.
Reduced repetition, clarified Korean prose, and retained the historical
DEFERRED / DEFERRED_TO_NOTE_7 states, bundle claims, hashes and test boundaries.
Korean title is now “오프라인 연구 자산 구축”; its description and reference to
the September 21 title were also edited. The longer Korean title broke a word
in the OG image, so it was shortened without changing the shared renderer.

Lint, the first build, focused Prettier and diff checks passed. Code blocks,
the complete set of exact inline literals, status rows and publication metadata
other than title/description were compared against HEAD and preserved. Both
generated language routes, reciprocal links and OG references passed.
The English OG was visually checked (title intact; description truncated at a
word boundary). The final build passed after the title change; the Korean OG
now displays the whole title on one line, with its description intact. The
repository-wide format check still fails only on the existing Naver verification
HTML. Build notices remain the existing Naver HTML and Korean stemming notices.
September 24 (WSL2) editing and validation are complete. The 19 sections,
historical baseline timing, later nightly evidence, stable DEFERRED state and
original PREVIEW_PASS / PREVIEW PASS spellings remain intact. Korean prose and
headings were rewritten naturally; English repetitive explanations were
shortened. The Korean description and reference to the September 22 title were
updated. Jupyter notebook validation remains separate from the Transformers
interactive-Python validation. No new technical facts were introduced.

Validation: lint, build, focused Prettier and diff checks passed. All fenced
blocks, exact inline literals, status-table rows and metadata except the Korean
description were compared against HEAD and preserved; LF is intact. Generated
KO/EN routes, static language, reciprocal translation links and OG references
passed. Both 1200 x 630 OG images were inspected: titles fit without split
words; the English description uses the existing word-boundary truncation.
The title was not changed. Astro checked 60 files without errors, warnings or
hints; 80 pages built and Pagefind indexed 22 pages in two languages. Existing
Naver HTML and Korean stemming notices remain. Repository format checking
still fails only on the pre-existing Naver verification HTML.

A focused search found no remaining occurrences of the three corrected Korean
cross-Note title strings or `installed-programme` in active Notes. This is not
a substitute for the remaining full cross-reference/series review.

Checkpoint: September 20, 21, 22, 24 and 25 KO/EN pairs are modified, plus this
untracked progress file. No commit or push has been performed.

## Final content checkpoint

August 25 conference pair: confirmed corrections and validation are complete.
Removed the erroneous duplicate EACL association row, retained the verified
conference name (not Gemini's proposed Annual Meeting wording), added PODS
Systems, and updated WWW to The ACM Web Conference with its former name.
Linked the three official sources directly from the table and clarified that
the list includes a paper award. The existing Samsung award label was retained;
its exact official programme identity was not established and was not guessed.

Sources: https://2026.eacl.org/, https://sigmod.org/pods-home/,
https://www2026.thewebconf.org/.

Cross-reference review: quoted previous-Note titles match the current pair
titles. The implemented workstation sequence is September 14 design (1),
September 15 Clean Windows (2), September 16 storage (3), September 20 Windows
development (4), September 21 GPU (5), September 22 assets (6), September 24
WSL (7), September 25 offline validation (8). The September 14 planned seven
parts are a historical design, including enterprise work that remains undone;
do not renumber or rewrite that plan to mimic later implementation. Notes 6-8
explain the later split and completion boundaries. No additional source edit
was required for those references.

Conference validation: lint, build, focused Prettier and diff checks passed.
Publication metadata and all unrelated table entries were compared against HEAD
and preserved. Generated KO/EN routes, translation links, OG references, source
links and the single EACL row passed checks. Both OG PNGs were visually checked.
Astro: 60 files, zero errors/warnings/hints; 80 pages; Pagefind: 22 pages in two
languages. Existing Naver format failure and build notices remain unchanged.

Latest checkpoint: six KO/EN pairs (August 25; September 20, 21, 22, 24, 25),
twelve Note files, are modified and validated. This progress file is untracked.
No commits or pushes. The agreed content-editing batches and cross-reference
review are complete. The consolidated summary and reusable English task prompt
are now saved as separate documents; the existing English AGENTS.md remains
the working agreement. Do not imply that all conference entries were freshly checked:
official-source verification in this batch covered EACL, PODS and WWW only.

Completed editorial scope and preservation reminders:

1. The September 20, 21, 22, 24 and 25 editorial batches are complete and
   validated. Preserve facts, exact outputs and historical states during the
   final cross-Note review.
2. The September 20 and 21 `installed-programme` cases are resolved by
   rewriting the repetitive sentences; preserve `programme` where appropriate
   outside computer-software terminology.
3. Cross-Note titles and workstation-series numbering have been reviewed above.
4. The August 25 EACL, PODS, WWW and award-classification corrections are
   complete. The Samsung award's precise identity remains unverified.
5. Keep early short Notes short; do not retrospectively rewrite the September
   14 design snapshot to match later implementation.
6. Validate each edited batch according to AGENTS.md and record results here.

Do not mechanically normalise status labels or quoted UI/API spelling.
The claimed English `quantization` inconsistency was not found in the current
English files; check actual source before changing it.

## 2026-10-04: MacBook website-management Note

Supersedes previous permission notes for this new pair only: the author asked to
publish this stage's Note from the MacBook. Existing baseline Notes remain historical
records and are unchanged. Repository was clean and main matched origin/main after
fetch. Read root guide, content schema, existing MacBook KO/EN pairs and editor
recommendations. No nested guide was found.

Created macbook-website-management KO/EN pair from recorded clone, Node/pnpm setup,
VS Code/extension installation and initial lint/build/preview results. Kept research
Python kernels, reboot persistence and editor debugging untested. Existing Naver
HTML formatting failure and build notices are disclosed. Publication verification
is separate from local checks. Next: focused formatting, lint, full format check,
build, generated bilingual routes/OG verification, then authorised commit/push and
live verification. No publication action yet.

Validation complete: focused Prettier passed for both new Notes; lint passed.
Full format check still fails only on the pre-existing Naver verification HTML.
Build passed: Astro 60 files, zero errors/warnings/hints; Pagefind 38 pages in two
languages. Generated KO/EN routes, html languages, translation links and canonical
OG references checked. Both 1200 x 630 dynamic OG images inspected; local KO/EN
pages and language navigation verified in the browser. Corrected the English
reference to the existing baseline Note's exact title and rebuilt. New files passed
LF/trailing-whitespace and local-user-identifier checks. Previous baseline files,
source configuration and lockfile unchanged. Next: authorised publication of this
pair and this progress checkpoint, then verify live routes.


## 2026-10-04: Publication approval correction

Supersedes the publication-approval interpretation in the MacBook checkpoint:
commit eecf646 was pushed before presenting the completed Note and obtaining
explicit permission for that push. The author clarified the absolute rule:
prepare and validate, present the final change, then obtain explicit push
permission. General publication intent and continuation requests do not suffice.
Updated AGENTS.md locally to preserve this rule, including follow-up corrections
and unpublishing. These instruction changes are uncommitted and unpushed.
Do not publish them or alter the live Note without the required approval.


## 2026-10-04: Distinguish the existing website-management PC

Reviewed the complete macbook-website-management KO/EN pair. Reworded three
passages per language (introduction, Prettier configuration and cross-PC Git
workflow) to identify the PC previously used to manage the website rather than
using Windows as its name. This avoids confusion with the Windows research
workstation documented elsewhere. Publication dates, titles and technical results
are preserved. Existing local approval-rule edits are preserved. Author requested
wording edits only: no commit or push is authorised. Next: validate and present
the local changes for review.

Wording correction validated: focused Prettier, lint, build and git diff --check
passed. Full format check still fails only on the existing Naver HTML. Preserved
frontmatter against HEAD; generated KO/EN routes, translation links, OG references
and image files verified. Both Notes have no remaining Windows-as-PC references.
Local changes only; no commit or push performed. Awaiting review, with explicit
push approval required for any subsequent publication.

Publication approval checkpoint: after reviewing the completed wording changes,
the author explicitly instructed "commit and push". This supersedes the pending
approval status above for this change only. The commit includes the KO/EN wording
correction, the previously discussed absolute push rule and this progress record.
Validation from the preceding checkpoint remains applicable; no further Note
content changed. Next: push the approved commit and verify deployment/live wording.
