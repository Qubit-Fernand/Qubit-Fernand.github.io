# Personal Homepage: [fernand.tech](https://fernand.tech)

![fernand.tech homepage](./public/readme-preview.png)

## GitHub Pages Deployment Notes

1. If GitHub Pages is configured to deploy from `github-pages` branch `/(root)`, the root `index.html` acts as a redirect page and forwards visitors to `https://fernand.tech/`.
2. If GitHub Pages is configured to deploy from `github-pages` branch `/docs`, it serves the Notion-rendered **static** site directly. Keep the `docs` export **updated** in time so it stays consistent with the redirect destination.

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

## Public assets

The `github-pages` branch is currently published from its repository root. Files
in `assets/` are available at `https://qubit-fernand.github.io/assets/<filename>`.
For example, `assets/README.txt` is available at
<https://qubit-fernand.github.io/assets/README.txt>. The root `index.html`
continues to redirect to fernand.tech; asset URLs do not use that redirect.

To publish a file, add it under `assets/` on the `github-pages` branch, commit,
and push that branch. Use its direct URL as the link in Notion or fernand.tech.
The repository and all files here are public, so only add material intended for
public access. Prefer stable, descriptive filenames. GitHub Pages changes can
take a few minutes to deploy. If Pages is reconfigured to publish `/docs`, these
root-level asset URLs will no longer be served unless the assets are moved or
copied into the new publishing directory.
