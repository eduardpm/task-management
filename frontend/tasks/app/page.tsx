"use client";

import { useEffect, useState } from "react";
import { Task } from "./types/task";
import CreateTaskDialog from "./components/CreateTaskDialog";
import TaskList from "./components/TaskList";
import TaskHistoryOverview from "./components/TaskHistoryOverview";
import CompletedTasksList from "./components/CompletedTasksList";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8000/tasks/tasks/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.log(err);
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Task Management
          </h1>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
          >
            + Create Task
          </button>
        </div>

        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onTaskUpdated={handleTaskUpdated}
        />

        <TaskHistoryOverview tasks={tasks} />

        <CompletedTasksList />

        <CreateTaskDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    </div>
  );
}
