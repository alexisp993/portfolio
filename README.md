# Alex Pagtakhan — Analytics Portfolio

A lightweight, responsive portfolio for Alex Pagtakhan, Power BI Developer and Data Analyst. The site uses plain HTML, CSS, and JavaScript with no build step or runtime dependencies.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server. For example:

```powershell
cd C:\Users\Personal\AI-Workspace\Projects\Alex-Analytics-Portfolio
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

- `index.html` — content, SVG graphics, and accessible page structure
- `styles.css` — responsive layout, palette, typography, and motion
- `app.js` — hash routing, navigation state, loader, project slider, and interactions
- `api/visits.js` — Vercel Function that reads and increments the shared portfolio visit count
- `public/assets/` — profile image, résumé, and real project screenshots

The home page uses local project screenshots with a vignette treatment and accessible controls. All portfolio claims are grounded in the supplied résumé and project assets.

## Visit counter on Vercel

The sidebar counter stores its shared total in Upstash Redis. Connect an Upstash Redis database to the Vercel project, confirm that one of these environment-variable pairs exists, and redeploy:

```text
KV_REST_API_URL
KV_REST_API_TOKEN
```

or:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

The browser increments the total once per tab session and reads the current total on later page loads in that session. If storage is unavailable or unconfigured, the sidebar hides the counter instead of displaying stale data.
