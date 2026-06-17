const DEFAULT_BASE_URL = "https://api.football-data.org/v4";

function resolveBaseUrl() {
  const configured = (process.env.FOOTBALL_DATA_BASE_URL || "").trim();

  if (!configured) {
    return DEFAULT_BASE_URL;
  }

  if (!/^https:\/\/api\.football-data\.org\/v4\/?$/i.test(configured)) {
    throw new Error(
      "FOOTBALL_DATA_BASE_URL must be https://api.football-data.org/v4 (not the football-data.org website URL)."
    );
  }

  return configured.replace(/\/$/, "");
}

async function readJsonResponse(response, requestUrl) {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error(`Football-Data returned an empty response for ${requestUrl}.`);
  }

  if (trimmed.startsWith("<")) {
    throw new Error(
      `Football-Data returned HTML instead of JSON (HTTP ${response.status}). ` +
        "Check FOOTBALL_DATA_BASE_URL and FOOTBALL_DATA_KEY in Netlify. " +
        `Response starts with: ${trimmed.slice(0, 120)}`
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(
      `Football-Data returned invalid JSON (HTTP ${response.status}) for ${requestUrl}. ` +
        `Response starts with: ${trimmed.slice(0, 120)}`
    );
  }
}

exports.handler = async function handler(event) {
  const apiKey = (process.env.FOOTBALL_DATA_KEY || "").trim();

  const params = event.queryStringParameters || {};
  const kind = params.kind;
  const competition = params.competition || "WC";
  const season = params.season;

  if (!apiKey) {
    return json(500, {
      error:
        "Missing FOOTBALL_DATA_KEY in Netlify environment variables. Add your football-data.org API token."
    });
  }

  if (!["teams", "matches", "standings", "competition"].includes(kind)) {
    return json(400, {
      error:
        "Invalid request. Use kind=teams, kind=matches, kind=standings, or kind=competition."
    });
  }

  if (!/^[A-Z0-9_-]+$/i.test(String(competition))) {
    return json(400, {
      error: "Invalid competition code."
    });
  }

  if (season && !/^\d{4}$/.test(String(season))) {
    return json(400, {
      error: "Invalid season. Use a four-digit year, e.g. 2026."
    });
  }

  let endpoint;

  switch (kind) {
    case "competition":
      endpoint = `/competitions/${competition}`;
      break;

    case "teams":
      endpoint = `/competitions/${competition}/teams`;
      break;

    case "matches":
      endpoint = `/competitions/${competition}/matches`;
      break;

    case "standings":
      endpoint = `/competitions/${competition}/standings`;
      break;

    default:
      return json(400, {
        error: "Unsupported request type."
      });
  }

  let baseUrl;

  try {
    baseUrl = resolveBaseUrl();
  } catch (error) {
    return json(500, { error: error.message });
  }

  const url = new URL(endpoint, `${baseUrl}/`);

  if (season && kind !== "competition") {
    url.searchParams.set("season", season);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-Auth-Token": apiKey,
        Accept: "application/json"
      }
    });

    const payload = await readJsonResponse(response, url.toString());

    if (!response.ok) {
      return json(response.status, {
        error:
          payload?.message ||
          `Football-Data request failed with status ${response.status}.`
      });
    }

    return json(
      200,
      payload,
      "public, max-age=0, s-maxage=300, stale-while-revalidate=60"
    );
  } catch (error) {
    return json(500, {
      error: error.message || "Unexpected Football-Data proxy error."
    });
  }
};

function json(statusCode, body, cacheControl = "no-store") {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl
    },
    body: JSON.stringify(body)
  };
}
