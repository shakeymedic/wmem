# Two-yearly tool reviews

Every tool listed on emevidence.org is reviewed at least every two years (Jake's decision, 10 October 2026). A review date shows on each card as "Reviewed Mon YYYY", and turns into "Review due" once it is more than two years old.

## How it runs

A monthly Claude routine ("EMevidence tool reviews") reviews the **next 4 tools** from:

```
node scripts/review-due.js 4
```

Tools never reviewed come first (in the order they appear in `tools.js`), then the oldest reviews. At 4 a month, all 78 tools get a first review in about 20 months, which keeps every tool inside the two-year window.

## What a review checks

For each tool:

1. **It works.** It loads with no console errors at phone (390 px) and laptop (1366 px) widths, with no sideways scrolling, broken images or dead links.
2. **Its clinical content is current.** Doses, thresholds, scores and pathways are checked against the current version of the guidance the tool cites (NICE, RCEM, RCUK, BTS, DVLA, BNF/SPC, RCR and so on). Anything that has changed is listed with the source and the exact wording to change.
3. **It's safe to use.** It shows the line "support, not replace, clinical judgement", doesn't ask for patient-identifiable information, and says which guideline version it follows.
4. **The emevidence.org card is accurate:** name, description and category.

## What the routine does with the findings

- **Fixes that change no clinical content** (layout, broken links, typos, the disclaimer line): a draft pull request on the tool's repository. For a drag-and-drop site with no source on GitHub, the fix is prepared as a folder and listed for Jake.
- **Clinical content changes:** a draft pull request with the source for each change. These are never merged without Jake's approval.
- **Recording the review:** a pull request on this repository setting `lastReviewed` (the review date) and `reviewedBy: "Claude (automated check)"` for each tool that was reviewed, so the card shows who checked it. If Jake checks a tool himself, he can change `reviewedBy` to his own name.
- **A summary for Jake:** one GitHub issue on this repository each month, titled "Tool reviews: Month YYYY" and assigned to Jake. It lists each tool, what was checked, what was found, and links to every pull request.

The routine never merges pull requests and never deploys clinical changes on its own.
