"use client";

import { useEffect, useState } from "react";
import { Task } from "../types/task";

interface CompletedTask {
  id: number;
  completed_at: string;
}

interface TaskHistoryModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskHistoryModal({
  task,
  isOpen,
  onClose,
}: TaskHistoryModalProps) {
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!task || !isOpen) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/tasks/tasks/${task.id}/history`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CompletedTask[] = await response.json();
        
        // Extract just the date part (YYYY-MM-DD) from completed_at timestamps
        const dates = new Set(
          data.map((ct) => new Date(ct.completed_at).toISOString().split("T")[0])
        );
        setCompletedDates(dates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [task, isOpen]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPreviousMonth();
      } else if (e.key === "ArrowRight") {
        goToNextMonth();
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [isOpen, onClose, currentDate]);

  if (!isOpen || !task) return null;

  // Get current month's days
  const now = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = firstDay.getDay();

  // Create array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Create padding for calendar grid
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const isCompleted = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return completedDates.has(dateStr);
  };

  const isToday = (day: number) => {
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const monthName = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            title="Previous month"
          >
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {monthName}
            </span>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            title="Next month"
          >
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-zinc-600 dark:text-zinc-400">Loading history...</p>
          </div>
        ) : (
          <div>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Padding days */}
              {paddingDays.map((i) => (
                <div key={`padding-${i}`} className="aspect-square" />
              ))}

              {/* Actual days */}
              {days.map((day) => {
                const completed = isCompleted(day);
                const today = isToday(day);

                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      completed
                        ? "bg-green-500 text-white"
                        : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                    } ${
                      today
                        ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-800"
                        : ""
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/20" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Not completed
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
