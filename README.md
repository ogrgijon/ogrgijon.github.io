# The Merekai Project

The Merekai Project is a bilingual editorial and project website exploring ideas, technology, culture, tradition and the future. It brings thoughtful writing together with practical projects and resources, creating a home for curiosity, reflection and work with purpose.

The site is designed as a calm, readable web publication: editorial typography, focused long-form layouts and responsive pages make it comfortable to explore on desktop and mobile. Spanish is the default experience; English-language pages are available throughout the site.

## Explore Merekai

- **Journal** — essays and perspectives on technology, culture and a changing world.
- **Projects** — initiatives, experiments and work shaped by the site's mission.
- **Reading Room** — a dedicated space for long-form articles, with a reusable editorial layout for subjects ranging from art and philosophy to technology.
- **Tradition** — recurring Spanish-language articles and a cultural calendar with approximate lunar and solar markers.
- **About** — the project's purpose, background and ways to get in touch.

The site also includes a language switcher, responsive navigation, RSS feed, sitemap and search-engine metadata. Its Gijón information panel uses locally stored tide and solunar data rather than making browser requests to external services.

## Built with

Merekai is a static website built with [Jekyll](https://jekyllrb.com/), Liquid templates, Markdown and custom CSS. Journal entries and project pages are maintained as content files, while shared layouts and includes keep the experience consistent. GitHub Actions can build and deploy the site to GitHub Pages.

## Run locally

Install Ruby and Bundler, then from the repository directory run:

```bash
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000/`. The site is configured for the custom domain, so `baseurl` is empty.

## Publish with GitHub Pages

1. Push the repository to GitHub.
2. In the repository's **Settings → Pages**, choose **GitHub Actions** as the deployment source.
3. Confirm that `merekai.es` is listed as the custom domain and that its DNS records point to GitHub Pages.
4. Push to `main` and follow the build and deployment workflow in the **Actions** tab.

The included workflow is `.github/workflows/pages.yml`.

## Publishing content

### Journal articles

Add a Markdown file to `_posts/` using Jekyll's date-based filename format, for example `2026-10-21-a-title-worth-reading.md`:

```yaml
---
title: "A title worth reading"
subtitle: "A useful subtitle"
date: 2026-10-21
category: TECHNOLOGY
description: "A short summary for search and sharing."
image: /assets/images/editorial-abstract.svg
image_alt: "Describe the image"
---
```

Write the article after the front matter. Store image files in `assets/images/`. English and Spanish articles are separate posts; set `lang: es` and `translation_url` on Spanish posts to connect them with their English counterparts.

### Projects

Create a Markdown file in `_projects/`, for example `_projects/my-project.md`:

```yaml
---
title: "My project"
date: 2026-10-21
status: "IN PROGRESS"
description: "One-sentence explanation of the project."
---
```

Add the project content below the front matter. The collection publishes project pages under `/projects/`.

### Reading Room articles

Create a Markdown page under `reading/` and set `layout: page`, `reading_room: true` and `reading_article: true` in its front matter. Include the page's `lang`, `translation_url`, `permalink`, `title`, `kicker` and `description` so it appears correctly in navigation and metadata.

The shared design system in `assets/css/reading-room.css` provides responsive typography, comfortable reading measure, heading hierarchy, quotation, list, link and print styles. Optional editorial elements include `.reading-byline`, `.reading-toc`, `.reading-callout`, `.reading-pullquote`, `.reading-figure` and `.reading-sources`.

### Tradition articles and local Gijón data

Spanish tradition articles live in `tradition/`. Set `tradition_article: true`, a `recurring_month` from 1 to 12, `tradition_theme`, `description` and `permalink` in the front matter. The tradition index groups entries by recurring month, including articles from previous years.

The calendar's lunar-phase and tropical solar-sign markers are approximate cultural orientation, not a precision ephemeris. The Gijón panel reads archived XML from `assets/data/` and does not fetch external data in the browser. Tide predictions in `gijon-tides.xml` are for IHM port 6 (43.558333, -5.698333); `gijon-solunar.xml` contains locally calculated events. After updating the tide data, regenerate the solunar file with:

```bash
node scripts/generate-gijon-solunar.js
```

The local ephemeris is indicative only; it is not a guarantee of fish activity or a substitute for official nautical predictions.

## Before launch

- The canonical URL is `https://merekai.es`; `_config.yml` uses an empty `baseurl` for the custom domain.
- Replace sample content and update `about.md` with accurate project and contact information.
- The footer contact address is `info@ogrgijon.es`.
- Add only verifiable metrics; the site intentionally avoids invented statistics.
- If adding analytics, a newsletter or forms, consider applicable privacy and consent requirements.

## License

No license is currently specified. Contact the project owner before reusing this repository's content or assets.
