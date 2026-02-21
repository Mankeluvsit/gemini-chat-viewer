"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  IconSparkles,
  IconX,
  IconStar,
  IconStarFilled,
  IconCircleFilled,
  IconGitFork,
  IconExternalLink,
  IconDownload,
  IconDeviceFloppy,
  IconTrash,
  IconPlayerPlay,
  IconAdjustments,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getLanguageColor } from "@/lib/language-colors";

interface DiscoveredRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  starred: boolean;
}

interface DiscoveryProfile {
  id: string;
  name: string;
  topics: string[];
  temperature: number;
  minStars: number;
  language: string;
  freshOnly: boolean;
  createdAt: string;
}

const STORAGE_KEY = "github-discovery-profiles";

function loadProfiles(): DiscoveryProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveProfiles(profiles: DiscoveryProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

// Temperature controls how the search query is built:
// Low (0-0.3): exact topic match, high stars, well-established repos
// Medium (0.3-0.7): topic keywords, moderate stars, broader results
// High (0.7-1.0): loose keywords, low star threshold, exploratory
function buildQueries(topics: string[], temperature: number, minStars: number, language: string, freshOnly: boolean): string[] {
  const queries: string[] = [];

  // Compute effective min stars based on temperature
  const effectiveMinStars = Math.max(
    minStars,
    temperature < 0.3 ? 50 : temperature < 0.7 ? 10 : 0
  );

  const starQuery = effectiveMinStars > 0 ? ` stars:>=${effectiveMinStars}` : "";
  const langQuery = language && language !== "any" ? ` language:${language}` : "";
  const freshQuery = freshOnly ? ` pushed:>2024-06-01` : "";

  if (temperature < 0.3) {
    // Focused: exact topic searches
    for (const topic of topics) {
      queries.push(`topic:${topic.replace(/\s+/g, "-")}${starQuery}${langQuery}${freshQuery}`);
    }
  } else if (temperature < 0.7) {
    // Balanced: combine topics as keywords + topic qualifier
    queries.push(`${topics.join(" ")}${starQuery}${langQuery}${freshQuery}`);
    if (topics.length > 0) {
      queries.push(`topic:${topics[0].replace(/\s+/g, "-")} ${topics.slice(1).join(" ")}${starQuery}${langQuery}${freshQuery}`);
    }
  } else {
    // Exploratory: loose keyword combinations, creative expansions
    queries.push(`${topics.join(" OR ")}${langQuery}${freshQuery}`);
    // Add related-ish terms
    const expansions = ["awesome", "toolkit", "framework", "library", "cli", "api"];
    const randomExpansion = expansions[Math.floor(Math.random() * expansions.length)];
    queries.push(`${topics[0]} ${randomExpansion}${langQuery}${freshQuery}`);
    if (topics.length > 1) {
      queries.push(`${topics.slice(1).join(" ")} ${topics[0]}${langQuery}${freshQuery}`);
    }
  }

  return queries;
}

const temperatureLabels = [
  { range: [0, 0.3], label: "Focused", desc: "Exact topic matches, popular repos only" },
  { range: [0.3, 0.7], label: "Balanced", desc: "Good mix of relevance and discovery" },
  { range: [0.7, 1.01], label: "Exploratory", desc: "Broader results, hidden gems, creative combos" },
];

function getTemperatureLabel(temp: number) {
  return temperatureLabels.find(l => temp >= l.range[0] && temp < l.range[1]) || temperatureLabels[1];
}

const popularLanguages = [
  "any", "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C++",
  "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Shell", "C#",
];

export default function DiscoverPage() {
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(0.5);
  const [minStars, setMinStars] = useState(10);
  const [language, setLanguage] = useState("any");
  const [freshOnly, setFreshOnly] = useState(false);
  const [results, setResults] = useState<DiscoveredRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>(loadProfiles);
  const [profileName, setProfileName] = useState("");

  function addTopic() {
    const t = topicInput.trim().toLowerCase();
    if (t && !topics.includes(t)) {
      setTopics([...topics, t]);
      setTopicInput("");
    }
  }

  function removeTopic(topic: string) {
    setTopics(topics.filter((t) => t !== topic));
  }

  function handleTopicKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
    if (e.key === "Backspace" && !topicInput && topics.length > 0) {
      setTopics(topics.slice(0, -1));
    }
  }

  const discover = useCallback(async () => {
    if (topics.length === 0) {
      toast.error("Add at least one topic");
      return;
    }

    setLoading(true);
    setSearched(true);

    const queries = buildQueries(topics, temperature, minStars, language, freshOnly);
    const allResults: Map<number, DiscoveredRepo> = new Map();

    try {
      // Run all queries in parallel
      const responses = await Promise.allSettled(
        queries.map((q) =>
          fetch(`/api/github/search?type=repos&q=${encodeURIComponent(q)}&sort=stars`)
            .then((r) => r.json())
        )
      );

      for (const res of responses) {
        if (res.status === "fulfilled" && res.value.items) {
          for (const repo of res.value.items) {
            if (!allResults.has(repo.id)) {
              allResults.set(repo.id, { ...repo, starred: false });
            }
          }
        }
      }

      // Sort by stars descending, then deduplicate
      const sorted = Array.from(allResults.values()).sort(
        (a, b) => b.stargazers_count - a.stargazers_count
      );

      setResults(sorted.slice(0, 50));
    } catch {
      toast.error("Discovery failed");
    } finally {
      setLoading(false);
    }
  }, [topics, temperature, minStars, language, freshOnly]);

  async function toggleStar(repo: DiscoveredRepo) {
    const [owner, name] = repo.full_name.split("/");
    try {
      const method = repo.starred ? "DELETE" : "PUT";
      const res = await fetch("/api/github/star", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo: name }),
      });
      if (!res.ok) throw new Error();
      setResults((prev) =>
        prev.map((r) =>
          r.id === repo.id ? { ...r, starred: !r.starred } : r
        )
      );
      toast.success(repo.starred ? `Unstarred ${repo.full_name}` : `Starred ${repo.full_name}`);
    } catch {
      toast.error("Failed to update star");
    }
  }

  async function batchStar() {
    const unstarred = results.filter((r) => !r.starred);
    if (unstarred.length === 0) return;

    let count = 0;
    for (const repo of unstarred) {
      const [owner, name] = repo.full_name.split("/");
      try {
        await fetch("/api/github/star", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo: name }),
        });
        count++;
        setResults((prev) =>
          prev.map((r) => (r.id === repo.id ? { ...r, starred: true } : r))
        );
      } catch {
        // Continue with next
      }
    }
    toast.success(`Starred ${count} repositories`);
  }

  function exportAwesomeList() {
    const lines = [
      `# Awesome ${topics.join(" + ")}`,
      "",
      `> Discovered with GitHub Dashboard (temperature: ${temperature}, min stars: ${minStars})`,
      "",
    ];

    // Group by language
    const byLang: Record<string, DiscoveredRepo[]> = {};
    for (const repo of results) {
      const lang = repo.language || "Other";
      if (!byLang[lang]) byLang[lang] = [];
      byLang[lang].push(repo);
    }

    for (const [lang, repos] of Object.entries(byLang).sort()) {
      lines.push(`## ${lang}`, "");
      for (const repo of repos) {
        lines.push(
          `- [**${repo.full_name}**](${repo.html_url}) - ${repo.description || "No description"} ` +
          `(${repo.stargazers_count.toLocaleString()} stars)`
        );
      }
      lines.push("");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `awesome-${topics.join("-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported awesome list");
  }

  function saveProfile() {
    const name = profileName.trim() || `${topics.join(", ")} discovery`;
    const profile: DiscoveryProfile = {
      id: Date.now().toString(),
      name,
      topics,
      temperature,
      minStars,
      language,
      freshOnly,
      createdAt: new Date().toISOString(),
    };
    const updated = [...profiles, profile];
    setProfiles(updated);
    saveProfiles(updated);
    setProfileName("");
    toast.success(`Saved profile "${name}"`);
  }

  function loadProfile(profile: DiscoveryProfile) {
    setTopics(profile.topics);
    setTemperature(profile.temperature);
    setMinStars(profile.minStars);
    setLanguage(profile.language);
    setFreshOnly(profile.freshOnly);
    toast.success(`Loaded profile "${profile.name}"`);
  }

  function deleteProfile(id: string) {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    saveProfiles(updated);
  }

  const tempLabel = getTemperatureLabel(temperature);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconSparkles className="h-5 w-5 text-yellow-400" />
        <h1 className="text-xl font-bold">Repo Discovery</h1>
        <Badge variant="secondary" className="text-xs">Star List Generator</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main controls */}
        <div className="flex flex-col gap-6">
          {/* Topic input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topics</CardTitle>
              <CardDescription>What are you looking for? Add topics and keywords.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 rounded-md border p-2 min-h-[42px]">
                {topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="gap-1 pr-1">
                    {topic}
                    <button
                      onClick={() => removeTopic(topic)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder={topics.length === 0 ? "Type a topic and press Enter..." : "Add more..."}
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleTopicKeyDown}
                  className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 h-8 px-1"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {["react", "nextjs", "ai", "cli", "api", "database", "devtools", "security", "monitoring", "automation"].map((t) => (
                  <Button
                    key={t}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      if (!topics.includes(t)) setTopics([...topics, t]);
                    }}
                  >
                    +{t}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Temperature + Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconAdjustments className="h-4 w-4" />
                Discovery Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Temperature slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Temperature</label>
                  <span className="text-sm text-primary font-medium">{tempLabel.label} ({temperature.toFixed(1)})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Exploratory</span>
                </div>
                <p className="text-xs text-muted-foreground">{tempLabel.desc}</p>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Min stars */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Min Stars</label>
                  <Input
                    type="number"
                    min={0}
                    value={minStars}
                    onChange={(e) => setMinStars(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Language */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {popularLanguages.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l === "any" ? "Any language" : l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fresh only */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Freshness</label>
                  <Button
                    variant={freshOnly ? "secondary" : "outline"}
                    className="justify-start"
                    onClick={() => setFreshOnly(!freshOnly)}
                  >
                    {freshOnly ? "Recently active only" : "All time"}
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                onClick={discover}
                disabled={loading || topics.length === 0}
                className="w-full"
              >
                <IconPlayerPlay className="mr-2 h-4 w-4" />
                {loading ? "Discovering..." : "Discover Repos"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {results.length} repos discovered
                  {results.filter(r => r.starred).length > 0 && (
                    <span className="text-primary ml-1">
                      ({results.filter(r => r.starred).length} starred)
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={batchStar}>
                    <IconStarFilled className="mr-1 h-3.5 w-3.5 text-yellow-400" />
                    Star All ({results.filter(r => !r.starred).length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportAwesomeList}>
                    <IconDownload className="mr-1 h-3.5 w-3.5" />
                    Export Awesome List
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {results.map((repo) => (
                  <Card key={repo.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleStar(repo)}
                          className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                        >
                          {repo.starred ? (
                            <IconStarFilled className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <IconStar className="h-5 w-5 text-muted-foreground hover:text-yellow-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {repo.full_name}
                            </a>
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
                          </div>
                          {repo.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {repo.topics.slice(0, 6).map((t) => (
                                <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <IconExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Saved Profiles */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Save Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Input
                placeholder="Profile name..."
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={saveProfile}
                disabled={topics.length === 0}
              >
                <IconDeviceFloppy className="mr-1 h-3.5 w-3.5" />
                Save Current Settings
              </Button>
            </CardContent>
          </Card>

          {profiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Saved Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-2 rounded-md border p-2"
                    >
                      <button
                        className="flex-1 text-left"
                        onClick={() => loadProfile(profile)}
                      >
                        <p className="text-xs font-medium">{profile.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {profile.topics.join(", ")} | T:{profile.temperature}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => deleteProfile(profile.id)}
                      >
                        <IconTrash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground flex flex-col gap-2">
              <p><strong>1.</strong> Add topics that interest you</p>
              <p><strong>2.</strong> Adjust temperature to control discovery range</p>
              <p><strong>3.</strong> Set language and star filters</p>
              <p><strong>4.</strong> Hit Discover to find matching repos</p>
              <p><strong>5.</strong> Star individually or batch star all results</p>
              <p><strong>6.</strong> Export as an Awesome List markdown file</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
