---
banner: https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80
---
# Codex Memory

This is the source project for the personal website at `https://fernand.tech/`.

## Visitor Map Relationship

- The visitor map at the bottom of the site comes from a Notion-exported iframe / embed block that points to `https://qubit-fernand.github.io/ClustrMaps/`.
- The actual visitor-map implementation lives in `/Users/AntiEntropy/Documents/Code/Github Repositories/ClustrMaps`, not in this Next.js codebase.
- Do not install MapMyVisitors globally in `pages/_document.tsx`: that previously produced a huge full-width map below the footer.
- If the map needs visual changes, edit the ClustrMaps repository's `index.html` instead, then let the Notion iframe pick up the GitHub Pages URL.
- In Notion, gray handles around the selected embed are usually Notion's resize controls, not necessarily page scrollbars.
- If the embed itself starts scrolling vertically, the usual cause is iframe height being smaller than the widget's rendered height. Fix it in the ClustrMaps page with `overflow: hidden` and a height-aware width constraint, not in this main website project.

## Current MapMyVisitors Choice

- The working MapMyVisitors widget uses the hidden parameter `t=tt`, which renders `Total Pageviews`.
- `t=m` / default behavior shows monthly stats and a date range, which is not the desired personal-site footer behavior.
- The current style intentionally follows the `https://leo-li.com/` map: white background, blue world map, dark text, light-blue/orange visitor markers.
- The successful no-scroll ClustrMaps layout uses `width: min(760px, 100vw, calc(100vh * 2.04))` so a shorter Notion iframe slightly shrinks the map instead of creating internal scroll.

## Build Notes

- This project has been verified with Node 22:
  `PATH="$HOME/.nvm/versions/node/v22.18.0/bin:$PATH" npm run build`
- The default machine `node` may be newer (`v26`) through local symlinks, so prefer the explicit Node 22 path for reproducible builds.

## Related Commits

- `6a03cff fix: remove oversized visitor map script` removed the global MapMyVisitors script from this website.
- ClustrMaps commits `dd62ec5`, `ad15283`, and `9d3baab` resized the iframe target, matched the Leo-style total pageview map, and prevented internal iframe scrolling.
- ClustrMaps commit `9030367` added local backups of MapMyVisitors code/assets/data plus repeatable backup scripts.
