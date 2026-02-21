"use client";

import { useState } from "react";
import { IconSearch, IconFile } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  name: string;
  path: string;
  html_url: string;
  repository: { full_name: string };
  text_matches?: { fragment: string }[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/github/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      setResults(data.items || []);
      setTotalCount(data.total_count || 0);
    } catch {
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <IconSearch className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Code Search</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search code across your repositories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {totalCount} result{totalCount !== 1 ? "s" : ""} found
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {loading ? "Searching..." : "No results found"}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {results.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-1 rounded-md border p-3 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <IconFile className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {item.repository.full_name}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.path}
                    </p>
                    {item.text_matches?.[0] && (
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {item.text_matches[0].fragment}
                      </pre>
                    )}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
