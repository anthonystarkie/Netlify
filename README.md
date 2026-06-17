# Family World Cup Fantasy League

This is a Netlify-ready static app with a small serverless function for [football-data.org](https://www.football-data.org/).

## Deploy

1. Create a new Netlify site from this folder.
2. Add the environment variable `FOOTBALL_DATA_KEY` in Netlify (your football-data.org API token).
3. Deploy.

Optional environment variable:

- `FOOTBALL_DATA_BASE_URL`, defaults to `https://api.football-data.org/v4`

## Local Development

Install Netlify CLI, then run:

```bash
npm install
npm run dev
```

The app will be served by Netlify Dev with the function available at `/.netlify/functions/football-data`.

## API Settings

In the app, set:

- **Competition code** — `WC` for the FIFA World Cup
- **Season** — four-digit year, e.g. `2026`

## Troubleshooting

**"Received HTML instead of JSON" or "Unexpected token '<'"**

1. Run the app through Netlify (`npm run dev` locally, or your deployed Netlify URL) — opening `index.html` directly will not load functions.
2. In Netlify → Site settings → Environment variables, set `FOOTBALL_DATA_KEY` to your football-data.org token (not an old API-Football key).
3. Remove any old `API_FOOTBALL_KEY` / `API_FOOTBALL_BASE_URL` variables. If you set `FOOTBALL_DATA_BASE_URL`, it must be exactly `https://api.football-data.org/v4` (the API host, not `https://www.football-data.org`).
4. Redeploy after changing environment variables so `netlify/functions/football-data.js` is live.


The free football-data.org plan allows 10 requests per minute. The app tracks request usage in the browser and only auto-syncs results during a match-day window:

- starts at the earliest kickoff for fixtures dated today
- ends two hours after the latest expected match end
- spaces checks across that window so the browser does not exceed the daily sync budget

Manual team/result syncs also count toward the same budget. Successful Netlify Function responses are cached briefly at the CDN layer to reduce repeated upstream API calls when multiple people open the league.
