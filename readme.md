# Personal Homepage: [fernand.tech](https://fernand.tech)

## GitHub Pages Deployment Notes

1. If GitHub Pages is configured to deploy from `github-pages` branch `/(root)`, the root `index.html` acts as a redirect page and forwards visitors to `https://fernand.tech/`.
2. If GitHub Pages is configured to deploy from `github-pages` branch `/docs`, it serves the Notion-rendered static site directly (effectively the same destination as the redirect result).

## Update docs on `github-pages`

Run these commands in the `github-pages` branch:

```bash
npm install
npm run deploy:docs
git add docs
git commit -m "chore: update docs export"
git push origin github-pages
```

What `npm run deploy:docs` does:

1. Builds Next.js.
2. Exports static files to `out/`.
3. Replaces `docs/` with the latest export output.
4. Ensures `docs/.nojekyll` exists.
