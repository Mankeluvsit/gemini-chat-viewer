"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconArrowLeft,
  IconDeviceFloppy,
  IconChevronRight,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  sha: string;
  size?: number;
  children?: FileNode[];
}

function buildTree(items: TreeItem[]): FileNode[] {
  const root: FileNode[] = [];
  const map: Record<string, FileNode> = {};

  // Sort: directories first, then alphabetically
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const item of sorted) {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    const node: FileNode = {
      name,
      path: item.path,
      type: item.type === "tree" ? "dir" : "file",
      sha: item.sha,
      size: item.size,
      children: item.type === "tree" ? [] : undefined,
    };
    map[item.path] = node;

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = map[parentPath];
      if (parent?.children) {
        parent.children.push(node);
      }
    }
  }

  return root;
}

function getFileExtension(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function isMarkdown(path: string): boolean {
  const ext = getFileExtension(path);
  return ["md", "mdx", "markdown"].includes(ext);
}

function isTextFile(path: string): boolean {
  const textExts = [
    "txt", "md", "mdx", "markdown", "json", "yaml", "yml", "toml",
    "js", "jsx", "ts", "tsx", "css", "scss", "html", "xml", "svg",
    "py", "rb", "go", "rs", "java", "kt", "swift", "c", "cpp", "h",
    "sh", "bash", "zsh", "fish", "ps1", "bat",
    "dockerfile", "makefile", "gitignore", "env", "ini", "cfg", "conf",
    "sql", "graphql", "prisma", "lua", "r", "dart", "ex", "exs",
  ];
  const ext = getFileExtension(path);
  const name = path.split("/").pop()?.toLowerCase() || "";
  return textExts.includes(ext) || ["dockerfile", "makefile", ".gitignore", ".env", "license", "readme"].some(n => name.includes(n));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TreeView({
  nodes,
  onSelect,
  expanded,
  toggleExpand,
}: {
  nodes: FileNode[];
  onSelect: (node: FileNode) => void;
  expanded: Set<string>;
  toggleExpand: (path: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {nodes.map((node) => (
        <div key={node.path}>
          <button
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent text-left"
            onClick={() => {
              if (node.type === "dir") {
                toggleExpand(node.path);
              } else {
                onSelect(node);
              }
            }}
          >
            {node.type === "dir" ? (
              <>
                {expanded.has(node.path) ? (
                  <IconFolderOpen className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <IconFolder className="h-4 w-4 text-primary shrink-0" />
                )}
              </>
            ) : (
              <IconFile className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
            {node.size != null && node.type === "file" && (
              <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                {formatSize(node.size)}
              </span>
            )}
          </button>
          {node.type === "dir" && expanded.has(node.path) && node.children && (
            <div className="pl-4 border-l border-border ml-3">
              <TreeView
                nodes={node.children}
                onSelect={onSelect}
                expanded={expanded}
                toggleExpand={toggleExpand}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FilesPage() {
  const params = useParams<{ owner: string; repo: string }>();
  const owner = params.owner;
  const repo = params.repo;

  const [tree, setTree] = useState<FileNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Editor state
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [editedContent, setEditedContent] = useState<string>("");
  const [fileSha, setFileSha] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

  const hasChanges = fileContent !== editedContent;

  // Load tree
  useEffect(() => {
    async function loadTree() {
      setLoadingTree(true);
      try {
        const res = await fetch(`/api/github/repos/${owner}/${repo}/tree`);
        const data = await res.json();
        if (data.tree) {
          setTree(buildTree(data.tree));
        }
      } catch {
        toast.error("Failed to load file tree");
      } finally {
        setLoadingTree(false);
      }
    }
    loadTree();
  }, [owner, repo]);

  // Load file
  const loadFile = useCallback(
    async (node: FileNode) => {
      if (!isTextFile(node.path)) {
        toast.error("Binary files cannot be edited");
        return;
      }

      setSelectedFile(node);
      setLoadingFile(true);
      try {
        const res = await fetch(
          `/api/github/repos/${owner}/${repo}/files?path=${encodeURIComponent(node.path)}`
        );
        const data = await res.json();

        if (data.content && data.encoding === "base64") {
          const decoded = atob(data.content.replace(/\n/g, ""));
          setFileContent(decoded);
          setEditedContent(decoded);
          setFileSha(data.sha);
          setCommitMessage(`Update ${node.name}`);
        } else {
          toast.error("Unable to decode file content");
        }
      } catch {
        toast.error("Failed to load file");
      } finally {
        setLoadingFile(false);
      }
    },
    [owner, repo]
  );

  // Save file
  async function saveFile() {
    if (!selectedFile || !hasChanges) return;

    setSaving(true);
    try {
      const encoded = btoa(unescape(encodeURIComponent(editedContent)));
      const res = await fetch(`/api/github/repos/${owner}/${repo}/files`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedFile.path,
          message: commitMessage || `Update ${selectedFile.name}`,
          content: encoded,
          sha: fileSha,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const result = await res.json();
      setFileSha(result.content.sha);
      setFileContent(editedContent);
      toast.success(`Committed: ${commitMessage}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save file");
    } finally {
      setSaving(false);
    }
  }

  function toggleExpand(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* File Tree */}
      <Card className="lg:max-h-[calc(100vh-220px)] overflow-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTree ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : tree.length === 0 ? (
            <p className="text-sm text-muted-foreground">Empty repository</p>
          ) : (
            <TreeView
              nodes={tree}
              onSelect={loadFile}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          )}
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="lg:max-h-[calc(100vh-220px)] flex flex-col overflow-hidden">
        {selectedFile ? (
          <>
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileContent("");
                      setEditedContent("");
                    }}
                  >
                    <IconArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                    {selectedFile.path.split("/").map((part, i, arr) => (
                      <span key={i} className="flex items-center gap-1 text-xs">
                        {i > 0 && <IconChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                        <span className={i === arr.length - 1 ? "font-medium" : "text-muted-foreground"}>
                          {part}
                        </span>
                      </span>
                    ))}
                  </div>
                  {hasChanges && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      Modified
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
              {loadingFile ? (
                <Skeleton className="flex-1" />
              ) : (
                <>
                  {/* Editor area */}
                  <div className="flex-1 overflow-auto rounded border" data-color-mode="dark">
                    {isMarkdown(selectedFile.path) ? (
                      <MDEditor
                        value={editedContent}
                        onChange={(val) => setEditedContent(val || "")}
                        height="100%"
                        preview="live"
                        className="!bg-background !border-0"
                      />
                    ) : (
                      <textarea
                        className="h-full w-full resize-none bg-background p-3 font-mono text-sm focus:outline-none"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        spellCheck={false}
                      />
                    )}
                  </div>

                  {/* Commit bar */}
                  {hasChanges && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        placeholder="Commit message..."
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="flex-1 text-sm"
                      />
                      <Button onClick={saveFile} disabled={saving} size="sm">
                        <IconDeviceFloppy className="mr-1 h-4 w-4" />
                        {saving ? "Committing..." : "Commit"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">
              Select a file from the tree to view and edit
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
