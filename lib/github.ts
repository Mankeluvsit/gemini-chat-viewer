const GITHUB_API = "https://api.github.com";

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    throw new Error("GITHUB_PAT environment variable is not set");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GitHub API error ${res.status}: ${res.statusText} - ${body}`
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ---------- Repos ----------

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  html_url: string;
  homepage: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  visibility: string;
  has_issues: boolean;
  has_wiki: boolean;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
}

export async function getRepos(
  page = 1,
  perPage = 100,
  sort: "updated" | "created" | "pushed" | "full_name" = "updated"
): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    `/user/repos?per_page=${perPage}&page=${page}&sort=${sort}&affiliation=owner`
  );
}

export async function getRepo(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`);
}

export async function createRepo(data: {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>("/user/repos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateRepo(
  owner: string,
  repo: string,
  data: {
    name?: string;
    description?: string;
    homepage?: string;
    private?: boolean;
    has_issues?: boolean;
    has_wiki?: boolean;
    topics?: string[];
    default_branch?: string;
    archived?: boolean;
  }
): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteRepo(
  owner: string,
  repo: string
): Promise<void> {
  return githubFetch<void>(`/repos/${owner}/${repo}`, {
    method: "DELETE",
  });
}

export async function updateRepoTopics(
  owner: string,
  repo: string,
  topics: string[]
): Promise<{ names: string[] }> {
  return githubFetch<{ names: string[] }>(
    `/repos/${owner}/${repo}/topics`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names: topics }),
    }
  );
}

// ---------- Issues ----------

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
  assignees: {
    login: string;
    avatar_url: string;
  }[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  comments: number;
  pull_request?: {
    url: string;
  };
}

export async function getIssues(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
  page = 1,
  perPage = 30
): Promise<GitHubIssue[]> {
  const issues = await githubFetch<GitHubIssue[]>(
    `/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&page=${page}`
  );
  // Filter out pull requests (GitHub API includes PRs in issues)
  return issues.filter((i) => !i.pull_request);
}

export async function createIssue(
  owner: string,
  repo: string,
  data: { title: string; body?: string; labels?: string[] }
): Promise<GitHubIssue> {
  return githubFetch<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  data: { state?: "open" | "closed"; title?: string; body?: string }
): Promise<GitHubIssue> {
  return githubFetch<GitHubIssue>(
    `/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

// ---------- Pull Requests ----------

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  html_url: string;
  merged_at: string | null;
  draft: boolean;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    label: string;
  };
  base: {
    ref: string;
    label: string;
  };
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
  created_at: string;
  updated_at: string;
  comments: number;
  review_comments: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export async function getPulls(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
  page = 1,
  perPage = 30
): Promise<GitHubPullRequest[]> {
  return githubFetch<GitHubPullRequest[]>(
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=${perPage}&page=${page}`
  );
}

// ---------- Commits & Activity ----------

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export async function getCommits(
  owner: string,
  repo: string,
  page = 1,
  perPage = 30
): Promise<GitHubCommit[]> {
  return githubFetch<GitHubCommit[]>(
    `/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`
  );
}

export interface CommitActivity {
  days: number[];
  total: number;
  week: number;
}

export async function getCommitActivity(
  owner: string,
  repo: string
): Promise<CommitActivity[]> {
  return githubFetch<CommitActivity[]>(
    `/repos/${owner}/${repo}/stats/commit_activity`
  );
}

// ---------- Languages ----------

export async function getLanguages(
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  return githubFetch<Record<string, number>>(
    `/repos/${owner}/${repo}/languages`
  );
}

// ---------- Rate Limit ----------

export interface RateLimit {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
  };
  rate: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  };
}

export async function getRateLimit(): Promise<RateLimit> {
  return githubFetch<RateLimit>("/rate_limit");
}

// ---------- README ----------

export async function getReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
      {
        headers: {
          ...getHeaders(),
          Accept: "application/vnd.github.raw+json",
        },
      }
    );
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}
