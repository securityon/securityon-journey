# Bilingual Note editorial task prompt

Use this prompt for a scoped editorial task in SecurityOn Research Journey.
This is an explicitly supplied task prompt, not a replacement for the repository's
AGENTS.md or an automatically loaded configuration file.

## Scope and starting point

Read AGENTS.md, applicable nested instructions, EDITORIAL_PROGRESS.md, and
`git status --short` before working. Inspect the requested files and their current
diffs. Treat existing modifications as user-owned and preserve unrelated work.
Use the latest progress checkpoint to avoid repeating completed editing batches.

Follow the user's current scope and requested mode. For review-only requests,
report findings without editing. For authorised edits, complete the specified
KO/EN pair or batch and its validation without repeatedly requesting permission.
Ask only when missing information is necessary for a consequential decision;
continue independent work while awaiting clarification.

Do not commit, push, reset, discard changes, or perform destructive Git operations
unless the user explicitly instructs you to do so.

## Evidence and historical accuracy

Preserve the journal as a record of actual work. Distinguish observations,
decisions, interpretations, future plans, and unresolved questions.
Never invent commands, results, versions, causes, benchmarks, installation types,
network-disconnection actions, security controls, or recovery outcomes.

Preserve exact commands, output excerpts, paths, package identifiers, numerical
results, and historical status strings. Do not mechanically unify status labels:
a change may represent a real transition. Explain it only when the source record
or author confirms the reason. Do not update a historical result merely because
a newer software release now exists.

Keep installation, discovery, execution, persistence, reconstruction, and
deployment claims within the evidence actually recorded. In particular, do not
turn a manifest into proof of a comparison, a restart into a full reboot, or a
test performed after reconnection into an isolated-network test.

When a fact remains uncertain, retain the original evidence and state the
uncertainty where it matters. Do not manufacture a resolution to make the prose
cleaner. Preserve earlier design snapshots; explain later implementation changes
in the relevant later record instead of silently rewriting the initial plan.

## Editorial approach

Write calmly and concretely, with the author's research-journal voice. Connect
the initial intent, observation, decision, reason, and outcome where useful,
without imposing that sequence as a repeated section template.

Use natural technical Korean. Translate ordinary prose nouns when that improves
readability; retain established technical terms, official names, and exact
literals when clearer. Check whole sentences and particles after edits rather
than applying broad word replacements.

Use natural British English for non-official prose. Preserve official product
names, quoted wording, API spelling, and output. Use “program” for software and
“programme” where appropriate for education or organised activities. Follow
AGENTS.md's contextual terminology and Markdown conventions.

Reduce redundant recaps and repeated contrast sentences such as “A does not
prove B” when the boundary is already clear. Keep limitations that affect the
reader's interpretation. State what was tested directly where possible.
Vary sentence length naturally; do not force synonyms, change technical terms
for variety, or add artificial imperfections to make writing appear human.

Keep short Notes short. Do not impose the structure of a long implementation
record on a brief reflection. Use concise, informative headings without
shortening official names merely to fit a layout.

## Bilingual and repository consistency

Use translationKey to identify the counterpart. Keep facts, chronology, scope,
status, and uncertainty equivalent across KO and EN while allowing idiomatic
phrasing in each language.

Preserve publication metadata unless its change is authorised. When an editorial
title or description changes, check quoted cross-Note references and generated
OG output. Do not change dates to make editorial refinements look newly published.
Inspect the actual schema before creating a Note; do not invent fields.

Stay within content scope. Do not alter shared routes, styles, layouts, the OG
renderer, dependencies, or unrelated Notes as incidental cleanup. Follow the
current AGENTS.md for language routing, typography, and implementation rules.

Verify external correction proposals against the actual source and, where
needed, primary references. A confident review from another model is not
evidence by itself. State which claims were checked rather than implying a
complete factual audit of every entry.

## Validation and progress

Follow AGENTS.md's current validation requirements. For edited Notes:

1. Inspect the focused diff and compare technical evidence, status values, and
   protected metadata against the starting state.
2. Run lint, build, repository format checking, and `git diff --check` as required.
   Limit formatting writes to task files; separately check untracked documents.
3. Verify generated KO/EN routes, translation links, document language, and OG
   references. Inspect the relevant generated OG images for readable titles and
   sensible word boundaries.
4. Preserve LF line endings. Report pre-existing failures separately and leave
   unrelated files untouched.

Documentation-only work needs the focused checks specified in AGENTS.md; do not
claim a fresh site build when only earlier content-build results are available.
Site validation does not revalidate the workstation experiments described by
the Notes.

Update EDITORIAL_PROGRESS.md after each completed pair or batch, meaningful
validation milestone, scope change, and before stopping. Record completed work,
pending work, unresolved facts, checks and warnings, and the next concrete step.
Make the latest checkpoint unambiguous while preserving useful historical logs.

In the final response, report changed files, consequential editorial decisions,
validation results and limitations, and facts deliberately left unresolved.
Keep the response concise and use the user's conversational language.

## Example invocation in VS Code

Replace the bracketed scope before sending:

> Read AGENTS.md, EDITORIAL_PROGRESS.md, and CODEX_EDITORIAL_PROMPT.md. Apply the
> editorial workflow to [specific KO/EN Note pair and requested changes]. Preserve
> existing modifications, technical evidence, historical statuses, and unresolved
> facts. Complete the relevant checks and update the progress file. Do not commit
> or push.

For a review without edits, explicitly replace the editing request with
“Review the specified pair and its current diff; report findings without editing.”

The existing English AGENTS.md remains the persistent project agreement. English
is used here to keep these instructions consistent with that agreement; user
discussion can remain in Korean. For Codex's instruction-file behaviour, see
the official [AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
