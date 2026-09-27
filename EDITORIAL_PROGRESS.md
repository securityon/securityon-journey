# Bilingual Notes editorial progress

Last updated: 2026-09-27 (Asia/Seoul).

## Resume here

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
