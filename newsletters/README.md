# Newsletters folder

`index.html` and `archive.js` are the public archive page at `/newsletters/`, which lists every entry in `updates.js` with series and year filters. The series is worked out from each entry's label by `seriesOf()` in `updates.js`.

## Issue pages

Every issue also has its own page here, so it can be read and searched on emevidence.org rather than only as a PDF on Google Drive. The PDF on Google Drive stays the archive and print copy, and each page links to it.

The pages are written by `scripts/build-issue-pages.py`, which downloads each PDF, copies its text across word for word (nothing is summarised or reworded), and rebuilds the headings, lists, tables and links from the layout. Each page says that the PDF is the definitive version. They are plain static HTML, committed to the repo; Netlify does not run the script.

### Where the pages go

One folder per series, then the issue:

| Series | Folder | Example |
| --- | --- | --- |
| EM Evidence Rundown | `em/` | `em/issue-33.html` |
| PHEM Evidence Rundown | `phem/` | `phem/issue-9.html` |
| Anaesthetics & ICU Evidence Rundown | `anaes/` | `anaes/issue-9.html` |
| Major Trauma Evidence Rundown | `trauma/` | `trauma/issue-7.html` |
| Quarterly State of the Science | `quarterly/` | `quarterly/2026-q3-em.html` |

The file name is `issue-N` when `updates.js` gives the issue number, otherwise the issue's date (`2026-06-02.html`). Quarterlies are `YEAR-qN-series`. If two PDFs would get the same name (an earlier version of an issue, for example), the older one has its date added: `trauma/issue-1-2026-06-29.html`.

### Adding a page for a new issue

After the issue is in `updates.js`:

```sh
python3 -m pip install pdfplumber      # once; also needs node and pdftotext (poppler-utils)
python3 -I scripts/build-issue-pages.py
```

With no options it builds a page for every issue that doesn't have one yet. It then adds `htmlPath` to that issue in `updates.js`, so the archive and the home page show a "Read on site →" link, and adds the page to `sitemap.xml`. Commit the new page with those two files.

Other options: `--drive-id <id>` for one issue, `--all` to rebuild every page (after changing the page template, for example), `--preview <folder>` to try it without touching the site, and `--pdf-dir <folder>` to keep the downloaded PDFs.

`htmlPath` goes on the entry when it has one PDF, and on each link when an entry holds several:

```js
{
  date: "2 Oct 2026",
  label: "EM Evidence Rundown — Issue 32",
  htmlPath: "/newsletters/em/issue-32.html",
  links: [ { title: "EM Evidence Rundown — Issue 32", driveId: "..." } ]
}
```

`node scripts/validate-updates.js` (run by Netlify before every deploy) fails if an `htmlPath` points at a file that isn't here.

### Checks

Before writing a page the script checks it against an independent reading of the PDF (`pdftotext`): the letters and digits on the page must match the PDF's (so nothing is dropped or doubled), and the text must read in the same order. An issue that fails, or whose PDF has no usable text (a scan, for example), is skipped and listed rather than published. Figures and images are not copied; a page whose PDF has them says so.
