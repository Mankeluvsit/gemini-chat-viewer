"use client";

import { getLanguageColor } from "@/lib/language-colors";

interface LanguageChartProps {
  languages: Record<string, number>;
}

export function LanguageChart({ languages }: LanguageChartProps) {
  const total = Object.values(languages).reduce((sum, v) => sum + v, 0);
  if (total === 0) return null;

  const entries = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: ((bytes / total) * 100).toFixed(1),
      color: getLanguageColor(name),
    }));

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Languages</h3>
      {/* Bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {entries.map((lang) => (
          <div
            key={lang.name}
            className="h-full"
            style={{
              width: `${lang.percent}%`,
              backgroundColor: lang.color,
            }}
            title={`${lang.name}: ${lang.percent}%`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map((lang) => (
          <span key={lang.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="font-medium">{lang.name}</span>
            <span className="text-muted-foreground">{lang.percent}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
