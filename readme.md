# Shuo Zhou's Homepage

![fernand.tech homepage](./public/readme-preview.png)

This repository hosts the Next.js + Notion mirror for Shuo Zhou's personal
homepage.

## Upstream

Forked from
[transitive-bullshit/nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit).
For the original starter-kit documentation, see the
[upstream README](https://github.com/transitive-bullshit/nextjs-notion-starter-kit/blob/main/readme.md).

## Site Mapping

The `master` branch is connected to the Notion page for the live personal
homepage. Changes made in that Notion interface are ultimately rendered at
<https://fernand.tech>.

The current root Notion page is configured in [site.config.ts](./site.config.ts):

```ts
rootNotionPageId: '5f6bf54917834c538f8b4c0264582174'
```

## Vercel Deployment Model

This repository is deployed as the production personal homepage. The Vercel
project uses the `master` branch as its production branch, and the custom domain
is:

```text
fernand.tech
```

Pushing to GitHub triggers Vercel to rebuild the site. Since the content source
is Notion, most text and publication updates should be made in Notion first; the
repository usually only needs changes for rendering logic, site metadata,
dependencies, or static assets such as this README preview.

## Recommended Versions

Use these versions when reproducing the project locally or recreating the Vercel
project:

| Tool or package | Recommended version |
| --- | --- |
| Node.js | `22.x` |
| npm | bundled with Node 22 |
| Vercel CLI | `59.x` |
| Next.js | `^12.2.3` |
| React | `18.2.0` |
| TypeScript | `^4.4.4` |
| `react-notion-x` | `^7.8.2` |
| `notion-client`, `notion-types`, `notion-utils` | `^7.8.2` |

`package.json` pins the deployment Node runtime with `"engines": { "node":
"22.x" }`. Dependencies should be installed with npm, using `package-lock.json`
as the source of truth:

```bash
npm ci
npm run build
```
