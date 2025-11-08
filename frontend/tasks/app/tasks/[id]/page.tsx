"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TaskCompletionCalendar, {
  TaskCompletionEntry,
} from "../../components/TaskCompletionCalendar";
import { Task } from "../../types/task";

interface CompletedTaskEntry extends TaskCompletionEntry {
  task_id: number;
  task_title: string;
  task_description: string;
}

function RadialStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const normalized = Math.min(100, Math.max(0, Math.round(value)));
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-800">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r="36" stroke="#d4d4d8" strokeWidth="8" fill="transparent" />
        <circle
          cx="48"
          cy="48"
          r="36"
          stroke="#2563eb"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="48"
          y="54"
          textAnchor="middle"
          className="fill-zinc-900 dark:fill-zinc-100 font-semibold text-lg rotate-90"
        >
          {normalized}%
        </text>
      </svg>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">{label}</p>
    </div>
  );
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = Number(params?.id);
  const [task, setTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<CompletedTaskEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId || Number.isNaN(taskId)) {
      setError("Invalid task id");
      setLoading(false);
      return;
    }

    let ignore = false;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [taskRes, historyRes] = await Promise.all([
          fetch(`http://localhost:8000/tasks/tasks/${taskId}`),
          fetch(`http://localhost:8000/tasks/tasks/${taskId}/history`),
        ]);

        if (!taskRes.ok) {
          throw new Error(`Failed to load task (status ${taskRes.status})`);
        }

        if (!historyRes.ok) {
          throw new Error(`Failed to load history (status ${historyRes.status})`);
        }

        const taskData: Task = await taskRes.json();
        const historyData: CompletedTaskEntry[] = await historyRes.json();

        if (!ignore) {
          setTask(taskData);
          setHistory(historyData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load task details");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      ignore = true;
    };
  }, [taskId]);

  const historySorted = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      ),
    [history]
  );

  const completionStats = useMemo(() => {
    if (!task) return { lifetime: 0, monthly: 0 };

    const now = new Date();
    const createdAt = new Date(task.created_at);
    const daysSinceCreation = Math.max(
      1,
      Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    );

    const lifetime = Math.min(100, (history.length / daysSinceCreation) * 100);

    const monthCount = history.filter((entry) => {
      const completedAt = new Date(entry.completed_at);
      return (
        completedAt.getMonth() === now.getMonth() && completedAt.getFullYear() === now.getFullYear()
      );
    }).length;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthly = Math.min(100, (monthCount / daysInMonth) * 100);

    return { lifetime, monthly };
  }, [history, task]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4 flex flex-col items-center gap-4">
        <p className="text-red-600 dark:text-red-400">{error ?? "Task not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to tasks
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/" className="text-blue-600 hover:underline">
                Tasks
              </Link>{" "}
              / {task.title}
            </p>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
              {task.title}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-3 max-w-3xl">{task.description}</p>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 capitalize">
            {task.type}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RadialStat label="Completion since creation" value={completionStats.lifetime} />
          <RadialStat label="Completion this month" value={completionStats.monthly} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <TaskCompletionCalendar entries={history} className="bg-white dark:bg-zinc-800" />

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Completion History
            </h2>
            {historySorted.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No completion history recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-700 flex-1 overflow-y-auto">
                {historySorted.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {new Date(entry.completed_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Marked as completed
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
