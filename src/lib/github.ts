const GITHUB_USERNAME = "Koktongkt";
const GITHUB_API = "https://api.github.com";
const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

export type GithubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
};

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
  repositories: GithubRepo[];
  repositoryLabel: "Pinned repositories" | "Recently updated";
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

async function fetchProfileHtml(): Promise<string> {
  try {
    const response = await fetch(`https://github.com/${GITHUB_USERNAME}`, {
      headers: { "User-Agent": requestHeaders["User-Agent"] },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    return response.ok ? response.text() : "";
  } catch {
    return "";
  }
}

function getPinnedNames(profileHtml: string): string[] {
  const matches = profileHtml.matchAll(
    new RegExp(
      `pinned-item-list-item[\\s\\S]{0,2500}?href="\\/${GITHUB_USERNAME}\\/([^"?#]+)"`,
      "g",
    ),
  );

  return Array.from(matches, (match) => match[1]).slice(0, 6);
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
  const [profile, repos, events, contributionData, profileHtml] = await Promise.all([
    fetchJson<GithubProfile>(`${GITHUB_API}/users/${GITHUB_USERNAME}`, { public_repos: 0 }),
    fetchJson<GithubRepo[]>(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      [],
    ),
    fetchJson<GithubEvent[]>(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/events/public?per_page=30`,
      [],
    ),
    fetchJson<ContributionsResponse>(
      `${CONTRIBUTIONS_API}/${GITHUB_USERNAME}?y=last`,
      { total: {}, contributions: [] },
    ),
    fetchProfileHtml(),
  ]);

  const pinnedNames = getPinnedNames(profileHtml);
  const pinnedRepos = pinnedNames
    .map((name) => repos.find((repo) => repo.name.toLowerCase() === name.toLowerCase()))
    .filter((repo): repo is GithubRepo => Boolean(repo));
  const fallbackRepos = repos.filter((repo) => !repo.fork).slice(0, 4);

  return {
    username: GITHUB_USERNAME,
    profileUrl: `https://github.com/${GITHUB_USERNAME}`,
    publicRepos: profile.public_repos,
    contributionTotal: contributionData.total.lastYear || 0,
    contributions: contributionData.contributions,
    repositories: pinnedRepos.length > 0 ? pinnedRepos : fallbackRepos,
    repositoryLabel: pinnedRepos.length > 0 ? "Pinned repositories" : "Recently updated",
    activities: selectActivities(events),
  };
}
