export interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  completed_today: boolean;
}
