"use client";

import { useRouter } from "next/navigation";
import { Task } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onTaskUpdated: (updatedTask: Task) => void;
}

export default function TaskList({ tasks, loading, error, onTaskUpdated }: TaskListProps) {
  const router = useRouter();
  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "weekly":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "monthly":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "yearly":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Just now" : date.toLocaleDateString();
  };

  const toggleCompletion = async (task: Task) => {
    try {
      const response = await fetch(`http://localhost:8000/tasks/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !task.completed_today }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
    } catch (err) {
      console.error(err);
      alert("Failed to update task. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">No tasks found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => router.push(`/tasks/${task.id}`)}
            className={`bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-all p-6 border-2 cursor-pointer ${
              task.completed_today
                ? "border-green-500 dark:border-green-600"
                : "border-red-500 dark:border-red-600"
            }`}
          >
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 flex-1">
              {task.title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompletion(task);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  task.completed_today
                    ? "bg-green-600 focus:ring-green-500"
                    : "bg-red-600 focus:ring-red-500"
                }`}
                title={task.completed_today ? "Mark as incomplete" : "Mark as complete"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    task.completed_today ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  task.type
                )}`}
              >
                {task.type}
              </span>
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {task.description}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Created: {formatDate(task.created_at)}
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  task.completed_today ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {task.completed_today ? "Done" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
  );
}
