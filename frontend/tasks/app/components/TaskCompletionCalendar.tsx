"use client";

import { useEffect, useMemo, useState } from "react";

export interface TaskCompletionEntry {
  id: number;
  completed_at: string;
}

interface TaskCompletionCalendarProps {
  entries: TaskCompletionEntry[];
  className?: string;
}

export default function TaskCompletionCalendar({
  entries,
  className = "",
}: TaskCompletionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    setCurrentDate(new Date());
  }, [entries]);

  const completedDates = useMemo(() => {
    return new Set(
      entries.map((entry) => new Date(entry.completed_at).toISOString().split("T")[0])
    );
  }, [entries]);

  const goToPreviousMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const now = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  
  const isCompleted = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
    return completedDates.has(dateStr);
  };
  const completedDaysThisMonth = days.filter((day) => isCompleted(day)).length;
  const completionPercent = Math.round((completedDaysThisMonth / daysInMonth) * 100);

  const isToday = (day: number) => {
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const monthName = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`rounded-lg border border-zinc-200 dark:border-zinc-700 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-zinc-100 dark:bg-zinc-900/40 px-4 py-3">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            {completedDaysThisMonth} of {daysInMonth} days completed
          </div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {Number.isFinite(completionPercent) ? `${completionPercent}%` : "0%"}
          </div>
        </div>

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

        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map((i) => (
            <div key={`padding-${i}`} className="aspect-square" />
          ))}

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
                } ${today ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-800" : ""}`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/20" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Not completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
