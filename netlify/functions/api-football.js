const API_BASE_URL =
  process.env.FOOTBALL_DATA_BASE_URL ||
  "https://api.football-data.org/v4";

exports.handler = async function handler(event) {
  const apiKey = process.env.FOOTBALL_DATA_KEY;

  const params = event.queryStringParameters || {};
  const kind = params.kind;
  const competition = params.competition || "WC";

  if (!apiKey) {
    return json(500, {
      error: "Missing FOOTBALL_DATA_KEY in Netlify environment variables."
    });
  }

  if (!["teams", "matches", "standings"].includes(kind)) {
    return json(400, {
      error:
        "Invalid request. Use kind=teams, kind=matches, or kind=standings."
    });
  }

  if (!/^[A-Z0-9_-]+$/i.test(String(competition))) {
    return json(400, {
      error: "Invalid competition code."
    });
  }

  let endpoint;

  switch (kind) {
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

  const url = new URL(endpoint, API_BASE_URL);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-Auth-Token": apiKey
      }
    });

    const payload = await response.json();

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