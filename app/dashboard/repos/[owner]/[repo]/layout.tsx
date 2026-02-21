import { getRepo } from "@/lib/github";
import { RepoHeader } from "@/components/repo-header";
import { RepoTabs } from "@/components/repo-tabs";

interface RepoLayoutProps {
  children: React.ReactNode;
  params: Promise<{ owner: string; repo: string }>;
}

export default async function RepoLayout({
  children,
  params,
}: RepoLayoutProps) {
  const { owner, repo } = await params;
  const repoData = await getRepo(owner, repo);

  return (
    <div className="flex flex-col gap-6">
      <RepoHeader repo={repoData} />
      <RepoTabs owner={owner} repo={repo} />
      <div>{children}</div>
    </div>
  );
}
