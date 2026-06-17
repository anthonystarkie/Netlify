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

## API Request Budget

The free football-data.org plan allows 10 requests per minute. The app tracks request usage in the browser and only auto-syncs results during a match-day window:

- starts at the earliest kickoff for fixtures dated today
- ends two hours after the latest expected match end
- spaces checks across that window so the browser does not exceed the daily sync budget

Manual team/result syncs also count toward the same budget. Successful Netlify Function responses are cached briefly at the CDN layer to reduce repeated upstream API calls when multiple people open the league.
