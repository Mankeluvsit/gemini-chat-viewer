"use client";

import { useState, useCallback } from "react";
import {
  IconSearch,
  IconFile,
  IconGitBranch,
  IconAlertCircle,
  IconUsers,
  IconHash,
  IconStar,
  IconGitFork,
  IconCircleFilled,
  IconExternalLink,
  IconFilter,
  IconSortAscending,
  IconWorld,
  IconUser,
  IconSparkles,
  IconBulb,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLanguageColor } from "@/lib/language-colors";

type SearchType = "repos" | "code" | "issues" | "users" | "topics";
type Scope = "global" | "my";

interface SearchState {
  results: unknown[];
  totalCount: number;
  loading: boolean;
  searched: boolean;
  page: number;
}

// Quick search suggestions
const quickSearches = [
  { label: "Trending TypeScript", query: "stars:>100 language:typescript", type: "repos" as SearchType },
  { label: "React components", query: "react component", type: "repos" as SearchType },
  { label: "TODO comments", query: "TODO FIXME", type: "code" as SearchType },
  { label: "Good first issues", query: "label:good-first-issue state:open", type: "issues" as SearchType },
  { label: "API wrappers", query: "api wrapper sdk", type: "repos" as SearchType },
  { label: "Recently created", query: "created:>2025-01-01 stars:>10", type: "repos" as SearchType },
];

// Search syntax helpers
const syntaxHelpers: Record<SearchType, { label: string; syntax: string }[]> = {
  repos: [
    { label: "By language", syntax: "language:typescript" },
    { label: "By stars", syntax: "stars:>100" },
    { label: "By forks", syntax: "forks:>50" },
    { label: "By topic", syntax: "topic:react" },
    { label: "Created after", syntax: "created:>2024-01-01" },
    { label: "Pushed recently", syntax: "pushed:>2025-01-01" },
    { label: "By license", syntax: "license:mit" },
    { label: "Archived", syntax: "archived:false" },
    { label: "Has issues", syntax: "has:issues" },
    { label: "Template repos", syntax: "is:template" },
  ],
  code: [
    { label: "By extension", syntax: "extension:ts" },
    { label: "By filename", syntax: "filename:package.json" },
    { label: "By path", syntax: "path:src/" },
    { label: "By size", syntax: "size:>1000" },
    { label: "In repo", syntax: "repo:owner/name" },
  ],
  issues: [
    { label: "Open only", syntax: "state:open" },
    { label: "Closed only", syntax: "state:closed" },
    { label: "By label", syntax: "label:bug" },
    { label: "Is PR", syntax: "is:pr" },
    { label: "Is issue", syntax: "is:issue" },
    { label: "No assignee", syntax: "no:assignee" },
    { label: "Has comments", syntax: "comments:>5" },
    { label: "Is merged", syntax: "is:merged" },
  ],
  users: [
    { label: "By type", syntax: "type:user" },
    { label: "By followers", syntax: "followers:>100" },
    { label: "By repos", syntax: "repos:>10" },
    { label: "By location", syntax: "location:USA" },
  ],
  topics: [],
};

const sortOptions: Record<SearchType, { label: string; value: string }[]> = {
  repos: [
    { label: "Best match", value: "" },
    { label: "Most stars", value: "stars" },
    { label: "Most forks", value: "forks" },
    { label: "Recently updated", value: "updated" },
  ],
  code: [
    { label: "Best match", value: "" },
    { label: "Recently indexed", value: "indexed" },
  ],
  issues: [
    { label: "Best match", value: "" },
    { label: "Most comments", value: "comments" },
    { label: "Newest", value: "created" },
    { label: "Recently updated", value: "updated" },
  ],
  users: [
    { label: "Best match", value: "" },
    { label: "Most followers", value: "followers" },
    { label: "Most repos", value: "repositories" },
    { label: "Recently joined", value: "joined" },
  ],
  topics: [],
};

const searchTypes: { value: SearchType; label: string; icon: typeof IconSearch }[] = [
  { value: "repos", label: "Repositories", icon: IconGitBranch },
  { value: "code", label: "Code", icon: IconFile },
  { value: "issues", label: "Issues & PRs", icon: IconAlertCircle },
  { value: "users", label: "Users", icon: IconUsers },
  { value: "topics", label: "Topics", icon: IconHash },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("repos");
  const [scope, setScope] = useState<Scope>("global");
  const [sort, setSort] = useState("");
  const [showSyntax, setShowSyntax] = useState(false);
  const [state, setState] = useState<SearchState>({
    results: [],
    totalCount: 0,
    loading: false,
    searched: false,
    page: 1,
  });

  const doSearch = useCallback(
    async (q: string, type: SearchType, pg = 1) => {
      if (!q.trim()) return;
      setState((s) => ({ ...s, loading: true, searched: true, page: pg }));

      try {
        const params = new URLSearchParams({
          q: q.trim(),
          type,
          scope,
          page: String(pg),
        });
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/github/search?${params}`);
        const data = await res.json();
        setState((s) => ({
          ...s,
          results: data.items || [],
          totalCount: data.total_count || 0,
          loading: false,
        }));
      } catch {
        setState((s) => ({ ...s, results: [], totalCount: 0, loading: false }));
      }
    },
    [scope, sort]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query, searchType);
  }

  function handleQuickSearch(q: string, type: SearchType) {
    setQuery(q);
    setSearchType(type);
    doSearch(q, type);
  }

  function insertSyntax(syntax: string) {
    setQuery((prev) => (prev ? `${prev} ${syntax}` : syntax));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconSearch className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">GitHub Search</h1>
      </div>

      {/* Search Type Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {searchTypes.map((t) => (
          <Button
            key={t.value}
            variant={searchType === t.value ? "secondary" : "ghost"}
            size="sm"
            className="shrink-0"
            onClick={() => {
              setSearchType(t.value);
              setSort("");
              if (state.searched) doSearch(query, t.value);
            }}
          >
            <t.icon className="mr-1 h-3.5 w-3.5" />
            {t.label}
          </Button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${searchType} on GitHub...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={state.loading}>
            {state.loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope toggle */}
          <div className="flex items-center rounded-md border">
            <Button
              type="button"
              variant={scope === "global" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none h-8"
              onClick={() => setScope("global")}
            >
              <IconWorld className="mr-1 h-3.5 w-3.5" />
              All GitHub
            </Button>
            <Button
              type="button"
              variant={scope === "my" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none h-8"
              onClick={() => setScope("my")}
            >
              <IconUser className="mr-1 h-3.5 w-3.5" />
              My Repos
            </Button>
          </div>

          {/* Sort */}
          {sortOptions[searchType]?.length > 0 && (
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[160px] h-8">
                <IconSortAscending className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions[searchType].map((opt) => (
                  <SelectItem key={opt.value} value={opt.value || "best-match"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Syntax helper toggle */}
          {syntaxHelpers[searchType]?.length > 0 && (
            <Button
              type="button"
              variant={showSyntax ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setShowSyntax(!showSyntax)}
            >
              <IconFilter className="mr-1 h-3.5 w-3.5" />
              Filters
            </Button>
          )}
        </div>

        {/* Syntax helpers */}
        {showSyntax && syntaxHelpers[searchType]?.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {syntaxHelpers[searchType].map((helper) => (
                  <Button
                    key={helper.syntax}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => insertSyntax(helper.syntax)}
                  >
                    <IconSparkles className="mr-1 h-3 w-3 text-primary" />
                    {helper.label}
                    <code className="ml-1 text-muted-foreground">{helper.syntax}</code>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Quick Searches */}
      {!state.searched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IconBulb className="h-4 w-4 text-yellow-400" />
              Quick Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((qs) => (
                <Button
                  key={qs.query}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickSearch(qs.query, qs.type)}
                >
                  {qs.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {state.searched && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {state.totalCount.toLocaleString()} result{state.totalCount !== 1 ? "s" : ""} found
          </p>

          {/* Repo results */}
          {searchType === "repos" && (
            <div className="flex flex-col gap-3">
              {(state.results as Array<{
                id: number; full_name: string; description: string | null;
                html_url: string; language: string | null; stargazers_count: number;
                forks_count: number; topics: string[]; owner: { avatar_url: string };
                private: boolean; updated_at: string;
              }>).map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="hover:border-primary/50 hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={repo.owner.avatar_url} />
                          <AvatarFallback>{repo.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-primary">{repo.full_name}</span>
                            <Badge variant={repo.private ? "secondary" : "outline"} className="text-[10px]">
                              {repo.private ? "Private" : "Public"}
                            </Badge>
                          </div>
                          {repo.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <IconCircleFilled className="h-2.5 w-2.5" style={{ color: getLanguageColor(repo.language) }} />
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <IconStar className="h-3 w-3" />
                              {repo.stargazers_count.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconGitFork className="h-3 w-3" />
                              {repo.forks_count.toLocaleString()}
                            </span>
                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                          </div>
                          {repo.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {repo.topics.slice(0, 5).map((t) => (
                                <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <IconExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {/* Code results */}
          {searchType === "code" && (
            <div className="flex flex-col gap-3">
              {(state.results as Array<{
                name: string; path: string; html_url: string;
                repository: { full_name: string };
                text_matches?: { fragment: string }[];
              }>).map((item, idx) => (
                <a
                  key={idx}
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="hover:border-primary/50 hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <IconFile className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.name}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {item.repository.full_name}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.path}</p>
                          {item.text_matches?.[0] && (
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-h-24">
                              {item.text_matches[0].fragment}
                            </pre>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {/* Issue/PR results */}
          {searchType === "issues" && (
            <div className="flex flex-col gap-3">
              {(state.results as Array<{
                id: number; number: number; title: string; state: string;
                html_url: string; user: { login: string; avatar_url: string };
                labels: { name: string; color: string }[];
                comments: number; created_at: string;
                repository_url: string; pull_request?: { url: string };
              }>).map((issue) => (
                <a
                  key={issue.id}
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="hover:border-primary/50 hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                          issue.state === "open" ? "bg-green-400" : "bg-purple-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{issue.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>
                              {issue.repository_url.split("/").slice(-2).join("/")}#{issue.number}
                            </span>
                            <span>{issue.pull_request ? "PR" : "Issue"}</span>
                            <span>by {issue.user.login}</span>
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                            {issue.comments > 0 && <span>{issue.comments} comments</span>}
                          </div>
                          {issue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {issue.labels.slice(0, 4).map((l) => (
                                <Badge
                                  key={l.name}
                                  variant="outline"
                                  className="text-[10px]"
                                  style={{ borderColor: `#${l.color}`, color: `#${l.color}` }}
                                >
                                  {l.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {/* User results */}
          {searchType === "users" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(state.results as Array<{
                login: string; avatar_url: string; html_url: string; type: string;
              }>).map((user) => (
                <a
                  key={user.login}
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="hover:border-primary/50 hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.login}</p>
                          <Badge variant="outline" className="text-[10px]">{user.type}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {/* Topic results */}
          {searchType === "topics" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(state.results as Array<{
                name: string; display_name: string; short_description: string;
                featured: boolean; curated: boolean;
              }>).map((topic) => (
                <a
                  key={topic.name}
                  href={`https://github.com/topics/${topic.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="hover:border-primary/50 hover:bg-accent/50 transition-colors h-full">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <IconHash className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{topic.display_name || topic.name}</p>
                          {topic.short_description && (
                            <p className="text-xs text-muted-foreground mt-1">{topic.short_description}</p>
                          )}
                          <div className="flex gap-1 mt-2">
                            {topic.featured && <Badge className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Featured</Badge>}
                            {topic.curated && <Badge variant="secondary" className="text-[10px]">Curated</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {/* Empty state */}
          {state.results.length === 0 && !state.loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No results found. Try a different query or search type.</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {state.totalCount > 20 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={state.page <= 1 || state.loading}
                onClick={() => doSearch(query, searchType, state.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {state.page} of {Math.ceil(Math.min(state.totalCount, 1000) / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={state.page >= Math.ceil(Math.min(state.totalCount, 1000) / 20) || state.loading}
                onClick={() => doSearch(query, searchType, state.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
