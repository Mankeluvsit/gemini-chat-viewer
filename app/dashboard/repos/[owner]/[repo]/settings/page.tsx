import { getRepo } from "@/lib/github";
import { RepoSettingsForm } from "@/components/repo-settings-form";

interface SettingsPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function RepoSettingsPage({
  params,
}: SettingsPageProps) {
  const { owner, repo } = await params;
  const repoData = await getRepo(owner, repo);

  return <RepoSettingsForm repo={repoData} />;
}
