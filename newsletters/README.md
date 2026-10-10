# Newsletters folder

`index.html` and `archive.js` are the public archive page at `/newsletters/`, which lists every entry in `updates.js` with series and year filters. The series is worked out from each entry's label by `seriesOf()` in `updates.js`.

## Landing pages (not yet in use)

This folder is reserved for HTML versions of each Evidence Rundown issue, so the content can be read and searched on emevidence.org rather than only as a PDF on Google Drive. No pages have been added yet; every issue is currently linked as a PDF.

The site already supports them. To link a page, add `htmlPath` to that issue's entry in `updates.js`, and the archive shows a "Read on site →" link next to the PDF:

```js
{
  date: "2 Oct 2026",
  label: "EM Evidence Rundown — Issue 32",
  htmlPath: "/newsletters/em/issue-32.html",
  links: [ ... ]
}
```

Suggested layout:

- `em/issue-N.html` for the EM Evidence Rundown
- `phem/issue-N.html` for the PHEM Evidence Rundown
- `anaes/issue-N.html` for the Anaesthetics & ICU Evidence Rundown

The PDF on Google Drive stays the archive and print copy.
