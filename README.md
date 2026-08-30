# SecurityOn Research Journey

SecurityOn Research Journey is BAN Seok's bilingual academic research journal.

It documents graduate study, security and IT engineering experience, ongoing
research in AI Security, and the questions, experiments, and publication
progress that emerge from that work.

## Current characteristics

The project is a statically generated Astro 7 site written in TypeScript and
styled with Tailwind CSS 4. Korean and English Notes are managed through Astro
content collections and published under `/notes/ko/` and `/notes/en/`.

Pagefind builds separate Korean and English search indexes. The site also
provides RSS, dynamic Open Graph image generation, and responsive light and
dark themes.

## Project structure

```text
.
├── src/
│   ├── content/notes/          # Korean and English Note sources
│   ├── layouts/                # Shared page and Note layouts
│   ├── pages/
│   │   ├── notes/[lang]/       # Language-specific Note, tag, and OG routes
│   │   ├── index.astro         # Bilingual home page
│   │   ├── about.astro         # Bilingual About page
│   │   └── research.astro      # Bilingual Research page
│   ├── styles/                 # Global and Markdown typography styles
│   └── utils/                  # Note paths, filtering, sorting, and helpers
└── astro-paper.config.ts       # Project-facing site and feature configuration
```

## Development

The project requires Node.js 22.12 or later. From the repository root:

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies. |
| `pnpm dev` | Start the Astro development server. |
| `pnpm build` | Validate and build the Astro site, run Pagefind indexing, and copy the search bundle. |
| `pnpm preview` | Preview the production build locally. |
| `pnpm lint` | Run ESLint. |
| `pnpm format:check` | Check formatting with Prettier. |

## Project background

This project originated from [AstroPaper by Sat Naing](https://github.com/satnaing/astro-paper)
and has since been substantially adapted for SecurityOn Research Journey.
The upstream licence attribution is retained.

## Licence

The project retains the upstream MIT licence. See [LICENSE](LICENSE), including
the original copyright attribution.
