import type { GitHubRepo } from "@/lib/github";

interface HealthScoreProps {
  repo: GitHubRepo;
  hasReadme?: boolean;
}

function calculateScore(repo: GitHubRepo, hasReadme?: boolean): { score: number; checks: { label: string; passed: boolean }[] } {
  const checks = [
    { label: "Has description", passed: !!repo.description },
    { label: "Has README", passed: !!hasReadme },
    { label: "Has license", passed: !!repo.license },
    { label: "Has topics", passed: (repo.topics?.length || 0) > 0 },
    { label: "Issues enabled", passed: repo.has_issues },
    { label: "Recent activity", passed: isRecent(repo.pushed_at, 90) },
    { label: "Not archived", passed: !repo.archived },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

function isRecent(dateStr: string, days: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

function getGrade(score: number): { letter: string; color: string } {
  if (score >= 85) return { letter: "A", color: "text-green-400" };
  if (score >= 70) return { letter: "B", color: "text-cyan-400" };
  if (score >= 55) return { letter: "C", color: "text-yellow-400" };
  if (score >= 40) return { letter: "D", color: "text-orange-400" };
  return { letter: "F", color: "text-red-400" };
}

export function HealthScore({ repo, hasReadme }: HealthScoreProps) {
  const { score, checks } = calculateScore(repo, hasReadme);
  const grade = getGrade(score);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-muted"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={grade.color}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${score}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className={`absolute text-sm font-bold ${grade.color}`}>
            {grade.letter}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">Health Score</p>
          <p className="text-xs text-muted-foreground">{score}% ({checks.filter(c => c.passed).length}/{checks.length} checks)</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-xs">
            <span className={check.passed ? "text-green-400" : "text-muted-foreground"}>
              {check.passed ? "+" : "-"}
            </span>
            <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
