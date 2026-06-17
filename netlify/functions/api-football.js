const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";

exports.handler = async function handler(event) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const params = event.queryStringParameters || {};
  const kind = params.kind;
  const league = params.league || "1";
  const season = params.season || "2026";

  if (!apiKey) {
    return json(500, {
      error: "Missing API_FOOTBALL_KEY in Netlify environment variables."
    });
  }

  if (!["teams", "fixtures"].includes(kind)) {
    return json(400, {
      error: "Invalid API request. Use kind=teams or kind=fixtures."
    });
  }

  if (!/^\d+$/.test(String(league)) || !/^\d{4}$/.test(String(season))) {
    return json(400, {
      error: "League and season must be numeric."
    });
  }

  const url = new URL(`/${kind}`, API_BASE_URL);
  url.searchParams.set("league", league);
  url.searchParams.set("season", season);

  try {
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const payload = await response.json();

    if (!response.ok) {
      return json(response.status, {
        error: payload?.message || `API-Football request failed with status ${response.status}.`
      });
    }

    if (payload.errors && Object.keys(payload.errors).length) {
      return json(502, {
        error: flattenApiErrors(payload.errors)
      });
    }

    return json(200, {
      response: payload.response || []
    }, "public, max-age=0, s-maxage=240, stale-while-revalidate=60");
  } catch (error) {
    return json(500, {
      error: error.message || "Unexpected API proxy error."
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

function flattenApiErrors(errors) {
  if (Array.isArray(errors)) return errors.join(", ");
  if (typeof errors === "string") return errors;
  return Object.values(errors).flat().join(", ") || "API-Football returned an error.";
}
