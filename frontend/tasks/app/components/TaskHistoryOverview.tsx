"use client";

import { useEffect, useState } from "react";
import { Task } from "../types/task";
import styles from "./TaskHistoryOverview.module.css";

interface CompletedTask {
  id: number;
  completed_at: string;
}

interface TaskHistoryOverviewProps {
  tasks: Task[];
}

export default function TaskHistoryOverview({ tasks }: TaskHistoryOverviewProps) {
  const [history, setHistory] = useState<Record<number, CompletedTask[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (!tasks.length) {
      setHistory({});
      setLoading(false);
      setError(null);
      return;
    }

    let ignore = false;

    const fetchHistories = async () => {
      setLoading(true);
      setError(null);

      try {
        const requests = tasks.map(async (task) => {
          const response = await fetch(
            `http://localhost:8000/tasks/tasks/${task.id}/history`
          );

          if (!response.ok) {
            throw new Error(`Failed to load history for ${task.title}`);
          }

          const entries: CompletedTask[] = await response.json();
          return { taskId: task.id, entries };
        });

        const results = await Promise.allSettled(requests);
        if (ignore) return;

        const nextHistory: Record<number, CompletedTask[]> = {};
        const failedTasks: string[] = [];

        results.forEach((result, index) => {
          const task = tasks[index];

          if (result.status === "fulfilled") {
            nextHistory[result.value.taskId] = result.value.entries;
          } else {
            failedTasks.push(task.title);
          }
        });

        setHistory(nextHistory);

        if (failedTasks.length) {
          setError(`Unable to load history for: ${failedTasks.join(", ")}`);
        } else {
          setError(null);
        }
      } catch (err) {
        if (ignore) return;
        setHistory({});
        setError(err instanceof Error ? err.message : "Failed to load task history");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchHistories();
    return () => {
      ignore = true;
    };
  }, [tasks, refreshCounter]);

  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const formatDate = (dateString: string, withTime = false) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return withTime
      ? date.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : date.toLocaleDateString(undefined, { dateStyle: "medium" });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.headingGroup}>Task Completion History</h2>
          <p className={styles.headingSubtext}>
            Review every time a task was marked as completed.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !tasks.length}
          className={styles.refreshButton}
        >
          Refresh history
        </button>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {loading ? (
        <div className={styles.loadingState}>Loading task history...</div>
      ) : !tasks.length ? (
        <div className={styles.emptyState}>
          Create a task to start tracking its completion history.
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {tasks.map((task) => {
            const entries = [...(history[task.id] ?? [])].sort((a, b) => {
              return (
                new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
              );
            });

            return (
              <div
                key={task.id}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {task.title}
                    </h3>
                    <p className={styles.cardMeta}>
                      {task.type} • Created {formatDate(task.created_at)}
                    </p>
                  </div>
                  <span className={styles.entryBadge}>
                    {entries.length} {entries.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  {entries.length ? (
                    <ul className={styles.entryList}>
                      {entries.map((entry) => (
                        <li
                          key={entry.id}
                          className={styles.entryRow}
                        >
                          <span>{formatDate(entry.completed_at, true)}</span>
                          <span className={styles.entryStatus}>
                            Completed
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.entryEmpty}>
                      No completion history recorded yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
