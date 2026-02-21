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

// ---------- Workflow Runs (GitHub Actions) ----------

export interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  event: string;
}

export async function getWorkflowRuns(
  owner: string,
  repo: string,
  perPage = 10
): Promise<{ total_count: number; workflow_runs: WorkflowRun[] }> {
  return githubFetch<{ total_count: number; workflow_runs: WorkflowRun[] }>(
    `/repos/${owner}/${repo}/actions/runs?per_page=${perPage}`
  );
}

// ---------- Notifications ----------

export interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: string;
  updated_at: string;
  subject: {
    title: string;
    url: string;
    type: string;
  };
  repository: {
    full_name: string;
    html_url: string;
  };
}

export async function getNotifications(
  all = false
): Promise<GitHubNotification[]> {
  return githubFetch<GitHubNotification[]>(
    `/notifications?all=${all}&per_page=50`
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  return githubFetch<void>(`/notifications/threads/${id}`, {
    method: "PATCH",
  });
}

// ---------- Starred Repos ----------

export async function getStarredRepos(
  page = 1,
  perPage = 30
): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    `/user/starred?per_page=${perPage}&page=${page}&sort=updated`
  );
}

// ---------- User Events (Activity Timeline) ----------

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: Record<string, unknown>;
  created_at: string;
}

export async function getUserEvents(
  username: string,
  page = 1,
  perPage = 30
): Promise<GitHubEvent[]> {
  return githubFetch<GitHubEvent[]>(
    `/users/${username}/events?per_page=${perPage}&page=${page}`
  );
}

// ---------- User Profile ----------

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export async function getUser(): Promise<GitHubUser> {
  return githubFetch<GitHubUser>("/user");
}

// ---------- Gists ----------

export interface GitHubGist {
  id: string;
  description: string | null;
  html_url: string;
  public: boolean;
  files: Record<string, { filename: string; language: string | null; size: number }>;
  created_at: string;
  updated_at: string;
  comments: number;
}

export async function getGists(
  page = 1,
  perPage = 30
): Promise<GitHubGist[]> {
  return githubFetch<GitHubGist[]>(
    `/gists?per_page=${perPage}&page=${page}`
  );
}

export async function createGist(data: {
  description?: string;
  public?: boolean;
  files: Record<string, { content: string }>;
}): Promise<GitHubGist> {
  return githubFetch<GitHubGist>("/gists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteGist(id: string): Promise<void> {
  return githubFetch<void>(`/gists/${id}`, { method: "DELETE" });
}

// ---------- Releases ----------

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  html_url: string;
  created_at: string;
  published_at: string;
  author: {
    login: string;
    avatar_url: string;
  };
  assets: {
    name: string;
    size: number;
    download_count: number;
    browser_download_url: string;
  }[];
}

export async function getReleases(
  owner: string,
  repo: string,
  perPage = 20
): Promise<GitHubRelease[]> {
  return githubFetch<GitHubRelease[]>(
    `/repos/${owner}/${repo}/releases?per_page=${perPage}`
  );
}

export async function createRelease(
  owner: string,
  repo: string,
  data: {
    tag_name: string;
    name?: string;
    body?: string;
    draft?: boolean;
    prerelease?: boolean;
  }
): Promise<GitHubRelease> {
  return githubFetch<GitHubRelease>(`/repos/${owner}/${repo}/releases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ---------- Branches ----------

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export async function getBranches(
  owner: string,
  repo: string,
  perPage = 100
): Promise<GitHubBranch[]> {
  return githubFetch<GitHubBranch[]>(
    `/repos/${owner}/${repo}/branches?per_page=${perPage}`
  );
}

export async function deleteBranch(
  owner: string,
  repo: string,
  branch: string
): Promise<void> {
  return githubFetch<void>(
    `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    { method: "DELETE" }
  );
}

// ---------- Collaborators ----------

export interface GitHubCollaborator {
  login: string;
  avatar_url: string;
  html_url: string;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  role_name: string;
}

export async function getCollaborators(
  owner: string,
  repo: string
): Promise<GitHubCollaborator[]> {
  return githubFetch<GitHubCollaborator[]>(
    `/repos/${owner}/${repo}/collaborators`
  );
}

export async function addCollaborator(
  owner: string,
  repo: string,
  username: string,
  permission = "push"
): Promise<void> {
  return githubFetch<void>(
    `/repos/${owner}/${repo}/collaborators/${username}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission }),
    }
  );
}

export async function removeCollaborator(
  owner: string,
  repo: string,
  username: string
): Promise<void> {
  return githubFetch<void>(
    `/repos/${owner}/${repo}/collaborators/${username}`,
    { method: "DELETE" }
  );
}

// ---------- Code Search ----------

export interface CodeSearchResult {
  total_count: number;
  items: {
    name: string;
    path: string;
    sha: string;
    html_url: string;
    repository: {
      full_name: string;
    };
    text_matches?: {
      fragment: string;
    }[];
  }[];
}

export async function searchCode(
  query: string,
  username: string,
  page = 1,
  perPage = 20
): Promise<CodeSearchResult> {
  const q = encodeURIComponent(`${query} user:${username}`);
  return githubFetch<CodeSearchResult>(
    `/search/code?q=${q}&per_page=${perPage}&page=${page}`,
    {
      headers: { Accept: "application/vnd.github.text-match+json" },
    }
  );
}

// ---------- Advanced Search ----------

export interface RepoSearchResult {
  total_count: number;
  items: (GitHubRepo & {
    score: number;
  })[];
}

export async function searchRepos(
  query: string,
  sort?: string,
  order?: string,
  page = 1,
  perPage = 20
): Promise<RepoSearchResult> {
  let url = `/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
  if (sort) url += `&sort=${sort}`;
  if (order) url += `&order=${order}`;
  return githubFetch<RepoSearchResult>(url);
}

export interface IssueSearchResult {
  total_count: number;
  items: {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: string;
    html_url: string;
    user: { login: string; avatar_url: string };
    labels: { name: string; color: string }[];
    comments: number;
    created_at: string;
    repository_url: string;
    pull_request?: { url: string };
  }[];
}

export async function searchIssues(
  query: string,
  sort?: string,
  order?: string,
  page = 1,
  perPage = 20
): Promise<IssueSearchResult> {
  let url = `/search/issues?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
  if (sort) url += `&sort=${sort}`;
  if (order) url += `&order=${order}`;
  return githubFetch<IssueSearchResult>(url);
}

export interface UserSearchResult {
  total_count: number;
  items: {
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
    score: number;
  }[];
}

export async function searchUsers(
  query: string,
  page = 1,
  perPage = 20
): Promise<UserSearchResult> {
  return githubFetch<UserSearchResult>(
    `/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`
  );
}

export interface TopicSearchResult {
  total_count: number;
  items: {
    name: string;
    display_name: string;
    short_description: string;
    created_by: string;
    created_at: string;
    featured: boolean;
    curated: boolean;
    score: number;
  }[];
}

export async function searchTopics(
  query: string,
  page = 1,
  perPage = 20
): Promise<TopicSearchResult> {
  return githubFetch<TopicSearchResult>(
    `/search/topics?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
    {
      headers: { Accept: "application/vnd.github.mercy-preview+json" },
    }
  );
}

// ---------- Star / Unstar ----------

export async function starRepo(owner: string, repo: string): Promise<void> {
  return githubFetch<void>(`/user/starred/${owner}/${repo}`, {
    method: "PUT",
    headers: { "Content-Length": "0" },
  });
}

export async function unstarRepo(owner: string, repo: string): Promise<void> {
  return githubFetch<void>(`/user/starred/${owner}/${repo}`, {
    method: "DELETE",
  });
}

export async function isRepoStarred(owner: string, repo: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.github.com/user/starred/${owner}/${repo}`,
      { headers: getHeaders() }
    );
    return res.status === 204;
  } catch {
    return false;
  }
}

export interface TrendingRepo {
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  owner: { login: string; avatar_url: string };
}

// ---------- Vulnerability Alerts ----------

export interface DependabotAlert {
  number: number;
  state: string;
  security_advisory: {
    summary: string;
    severity: string;
    description: string;
  };
  security_vulnerability: {
    package: {
      name: string;
      ecosystem: string;
    };
    severity: string;
    vulnerable_version_range: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
}

export async function getDependabotAlerts(
  owner: string,
  repo: string,
  state = "open"
): Promise<DependabotAlert[]> {
  try {
    return await githubFetch<DependabotAlert[]>(
      `/repos/${owner}/${repo}/dependabot/alerts?state=${state}&per_page=20`
    );
  } catch {
    return [];
  }
}

// ---------- Webhooks ----------

export interface GitHubWebhook {
  id: number;
  name: string;
  active: boolean;
  events: string[];
  config: {
    url: string;
    content_type: string;
  };
  created_at: string;
  updated_at: string;
}

export async function getWebhooks(
  owner: string,
  repo: string
): Promise<GitHubWebhook[]> {
  try {
    return await githubFetch<GitHubWebhook[]>(
      `/repos/${owner}/${repo}/hooks`
    );
  } catch {
    return [];
  }
}

export async function deleteWebhook(
  owner: string,
  repo: string,
  hookId: number
): Promise<void> {
  return githubFetch<void>(`/repos/${owner}/${repo}/hooks/${hookId}`, {
    method: "DELETE",
  });
}

// ---------- File Tree & Contents ----------

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export async function getRepoTree(
  owner: string,
  repo: string,
  branch = "HEAD",
  recursive = true
): Promise<GitHubTree> {
  const suffix = recursive ? "?recursive=1" : "";
  return githubFetch<GitHubTree>(
    `/repos/${owner}/${repo}/git/trees/${branch}${suffix}`
  );
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  content: string;
  encoding: string;
  html_url: string;
  download_url: string | null;
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<GitHubFileContent> {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return githubFetch<GitHubFileContent>(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${query}`
  );
}

export async function updateFileContent(
  owner: string,
  repo: string,
  path: string,
  data: {
    message: string;
    content: string; // base64 encoded
    sha: string;
    branch?: string;
  }
): Promise<{ content: GitHubFileContent; commit: { sha: string; html_url: string } }> {
  return githubFetch<{ content: GitHubFileContent; commit: { sha: string; html_url: string } }>(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export async function createFileContent(
  owner: string,
  repo: string,
  path: string,
  data: {
    message: string;
    content: string; // base64 encoded
    branch?: string;
  }
): Promise<{ content: GitHubFileContent; commit: { sha: string; html_url: string } }> {
  return githubFetch<{ content: GitHubFileContent; commit: { sha: string; html_url: string } }>(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export async function deleteFileContent(
  owner: string,
  repo: string,
  path: string,
  data: {
    message: string;
    sha: string;
    branch?: string;
  }
): Promise<void> {
  return githubFetch<void>(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}
