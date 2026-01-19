# Agent Links Dashboard (Overhaul)

A lightweight, no-build static dashboard for grouped links with:
- Fast search (titles / notes / URLs) with safe highlighting
- Favourites (persisted in localStorage)
- Expand/collapse sections (persisted)
- Theme toggle (persisted)
- Visibility filters (internal/external/restricted)
- Keyboard shortcuts: `/` focus search, `Esc` clears search + closes nav (mobile)

## Run locally (recommended)
If you open `index.html` with `file://`, many browsers block `fetch()` for JSON.

From this folder:

```bash
python -m http.server 8000
```

Then open: `http://localhost:8000`

## Data format
Edit `data/links.json`:

```json
{
  "groups": [
    {
      "id": "agent",
      "title": "Agent Tools",
      "items": [
        { "title": "Example", "url": "https://example.com", "notes": "…", "vis": "internal" }
      ]
    }
  ]
}
```

Optional: add a stable `id` per item if you want favourites to survive renames perfectly.

## Deploy
This is a static site. Any static host works (GitHub Pages, Netlify, IONOS webspace).
