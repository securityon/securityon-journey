---
name: SecurityOn Research Journey
alwaysApply: true
---

Follow the project architecture and conventions documented in `GEMINI.md`.

Key invariants:

- Use `notes`, never `posts`.
- Notes use explicit `/notes/ko/` and `/notes/en/` routes.
- Inside Notes, URL language is authoritative.
- Never reintroduce `data-note-lang`.
- Korean Note body uses RIDIBatang.
- Korean headings/UI use Pretendard.
- Prefer British English.
- Preserve the restrained academic research-journal aesthetic.
- Preserve unrelated working-tree changes.
- Prefer minimal coherent diffs.
- Run `npm run build` after meaningful changes.
- Do not commit or push unless explicitly instructed.