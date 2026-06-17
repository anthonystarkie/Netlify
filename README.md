# Family World Cup Fantasy League

This is a Netlify-ready static app with a small serverless function for API-Football.

## Deploy

1. Create a new Netlify site from this folder.
2. Add the environment variable `API_FOOTBALL_KEY` in Netlify.
3. Deploy.

Optional environment variable:

- `API_FOOTBALL_BASE_URL`, defaults to `https://v3.football.api-sports.io`

## Local Development

Install Netlify CLI, then run:

```bash
npm install
npm run dev
```

The app will be served by Netlify Dev with the function available at `/.netlify/functions/api-football`.

## API Request Budget

The free API-Football plan allows 100 requests per day. The app tracks request usage in the browser and only auto-syncs results during a match-day window:

- starts at the earliest kickoff for fixtures dated today
- ends two hours after the latest expected match end
- spaces checks across that window so the browser does not exceed 100 requests per day

Manual team/result syncs also count toward the same daily budget. Successful Netlify Function responses are cached briefly at the CDN layer to reduce repeated upstream API calls when multiple people open the league.
