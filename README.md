# ogrgijon.github.io
OGRGijón Developer Website

## Adding a project
Add `projects/<name>.md` (optional front matter: `title`, `description`, `repo`).
`npm run build` (TypeScript, `src/build.ts`) renders each markdown file to a page and generates the index links in `docs-out/`, which the Pages workflow deploys.
