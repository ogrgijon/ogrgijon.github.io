import { promises as fs } from "node:fs";
import path from "node:path";
import { marked } from "marked";

const root = path.resolve(import.meta.dirname, "..");
const projectsDir = path.join(root, "projects");
const outDir = path.join(root, "docs-out");

interface Project {
  slug: string;
  title: string;
  description: string;
  repo: string;
  body: string;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function parseProject(slug: string, source: string): Project {
  const meta: Record<string, string> = {};
  let body = source;
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (m) {
    body = source.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const heading = /^#\s+(.+)$/m.exec(body);
  return {
    slug,
    title: meta.title ?? heading?.[1] ?? slug,
    description: meta.description ?? "",
    repo: /^https?:\/\//.test(meta.repo ?? "") ? meta.repo : "",
    body,
  };
}

const page = (title: string, content: string): string =>
  `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body>
${content}
</body></html>
`;

async function main(): Promise<void> {
  const files = (await fs.readdir(projectsDir)).filter((f) => f.endsWith(".md")).sort();
  const projects: Project[] = [];
  for (const f of files) {
    const src = await fs.readFile(path.join(projectsDir, f), "utf8");
    projects.push(parseProject(path.basename(f, ".md"), src));
  }

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(path.join(outDir, "projects"), { recursive: true });

  for (const p of projects) {
    const html = await marked.parse(p.body);
    const repoLink = p.repo ? `<p><a href="${escapeHtml(p.repo)}">Repository</a></p>\n` : "";
    await fs.writeFile(
      path.join(outDir, "projects", `${p.slug}.html`),
      page(p.title, `<p><a href="../index.html">&larr; Back</a></p>\n${html}\n${repoLink}`),
    );
  }

  const items = projects
    .map(
      (p) =>
        `<li><a href="projects/${encodeURIComponent(p.slug)}.html">${escapeHtml(p.title)}</a>` +
        (p.description ? ` &mdash; ${escapeHtml(p.description)}` : "") +
        `</li>`,
    )
    .join("\n");
  await fs.writeFile(
    path.join(outDir, "index.html"),
    page("OGRGijón Developer Website", `<h1>OGRGijón Projects</h1>\n<ul>\n${items}\n</ul>`),
  );
  console.log(`Generated ${projects.length} project page(s) in ${path.relative(root, outDir)}`);
}

await main();
