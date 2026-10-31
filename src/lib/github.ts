const GITHUB_USERNAME = "Koktongkt";
const GITHUB_API = "https://api.github.com";
const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

type GithubProfile = {
  public_repos: number;
};

type GithubEvent = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    action?: string;
    size?: number;
    ref_type?: string;
  };
};

export type GithubActivity = {
  id: string;
  action: string;
  repo: string;
  date: string;
  url: string;
};

export type Contribution = {
  date: string;
  count: number;
  level: number;
};

type ContributionsResponse = {
  total: { lastYear?: number };
  contributions: Contribution[];
};

export type GithubSnapshot = {
  username: string;
  profileUrl: string;
  publicRepos: number;
  contributionTotal: number;
  contributions: Contribution[];
  activities: GithubActivity[];
};

const requestHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "Koktongkt-portfolio",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function describeEvent(event: GithubEvent): string {
  const action = event.payload?.action;

  switch (event.type) {
    case "PushEvent":
      return `Pushed ${event.payload?.size || "new"} ${event.payload?.size === 1 ? "commit" : "commits"} to`;
    case "CreateEvent":
      return `Created ${event.payload?.ref_type || "a resource"} in`;
    case "PullRequestEvent":
      return `${action === "closed" ? "Closed" : "Opened"} a pull request in`;
    case "IssuesEvent":
      return `${action === "closed" ? "Closed" : "Opened"} an issue in`;
    case "ForkEvent":
      return "Forked";
    case "WatchEvent":
      return "Starred";
    case "PublicEvent":
      return "Made public";
    case "ReleaseEvent":
      return "Published a release in";
    default:
      return "Updated";
  }
}

function selectActivities(events: GithubEvent[]): GithubActivity[] {
  const seen = new Set<string>();

  return events
    .filter((event) => {
      const key = `${event.type}:${event.repo.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((event) => ({
      id: event.id,
      action: describeEvent(event),
      repo: event.repo.name.replace(`${GITHUB_USERNAME}/`, ""),
      date: event.created_at,
      url: `https://github.com/${event.repo.name}`,
    }));
}

export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  const [profile, events, contributionData] = await Promise.all([
    fetchJson<GithubProfile>(`${GITHUB_API}/users/${GITHUB_USERNAME}`, { public_repos: 0 }),
    fetchJson<GithubEvent[]>(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/events/public?per_page=30`,
      [],
    ),
    fetchJson<ContributionsResponse>(
      `${CONTRIBUTIONS_API}/${GITHUB_USERNAME}?y=last`,
      { total: {}, contributions: [] },
    ),
  ]);

  return {
    username: GITHUB_USERNAME,
    profileUrl: `https://github.com/${GITHUB_USERNAME}`,
    publicRepos: profile.public_repos,
    contributionTotal: contributionData.total.lastYear || 0,
    contributions: contributionData.contributions,
    activities: selectActivities(events),
  };
}
