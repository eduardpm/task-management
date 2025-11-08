"use client";

import { useEffect, useMemo, useState } from "react";

interface CompletedHistoryEntry {
  id: number;
  completed_at: string;
  task_id: number;
  task_title: string;
  task_description: string;
}

export default function CompletedTasksList() {
  const [entries, setEntries] = useState<CompletedHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchCompleted = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/tasks/tasks/history");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CompletedHistoryEntry[] = await response.json();
        if (!ignore) {
          setEntries(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load completed tasks");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchCompleted();
    return () => {
      ignore = true;
    };
  }, []);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      ),
    [entries]
  );

  const formatCompletedAt = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <section className="mt-12">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Completed Tasks
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Latest completions ordered by completion time.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-zinc-600 dark:text-zinc-400">
          Loading completed tasks...
        </div>
      ) : sortedEntries.length === 0 ? (
        <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          No completed tasks recorded yet.
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          {sortedEntries.map((entry) => (
            <li
              key={entry.id}
              className="px-4 py-3 flex items-center justify-between gap-4 text-sm text-zinc-800 dark:text-zinc-100"
              title={entry.task_description}
            >
              <div className="flex flex-col">
                <span className="font-medium">{entry.task_title}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Completed {formatCompletedAt(entry.completed_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
