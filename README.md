# KT — Personal Portfolio

A responsive personal portfolio built with Next.js 16, React 19, and TypeScript. It includes a live GitHub activity dashboard, contribution graph, pinned repositories, an interactive cursor ambience, and responsive sections for selected work, the Hermes agent system, current focus, and contact details.

## Run locally

Requirements:

- Node.js 20.9 or newer
- npm

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run build
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKoktongkt%2Fpersonal-portfolio)

Or import `Koktongkt/personal-portfolio` from the Vercel dashboard. Vercel detects Next.js automatically, so no custom build settings are required.

- Framework preset: **Next.js**
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave unset

The site uses Incremental Static Regeneration with a one-hour refresh interval for GitHub activity.

### Optional environment variable

The public GitHub integration works without credentials. For a higher GitHub API rate limit, create a read-only fine-grained GitHub token and add this variable in Vercel:

```text
GITHUB_TOKEN=your_read_only_token
```

Never commit a real token. `.env.example` documents the supported variable, while local `.env*` files remain ignored.

## Live-data behavior

- GitHub profile, repositories, and public activity use GitHub's public endpoints.
- Pinned repositories are read from the public GitHub profile, with recently updated repositories as a fallback.
- Contribution history uses a public contribution-data service.
- External-data failures degrade gracefully instead of failing the deployment.

## Project structure

```text
src/app/page.tsx             Main portfolio page
src/app/globals.css          Responsive visual system
src/app/cursor-ambient.tsx   Pointer-following background effect
src/lib/github.ts            Server-side GitHub data integration
public/                      Static assets
```
