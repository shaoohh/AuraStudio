export interface TaskItem {
  id: string
  title: string
  description: string
  project: string
  priority: "High" | "Medium" | "Low"
  due: "today" | "upcoming"
  completed: boolean
}

export type TaskStatusFilter = "all" | "pending" | "completed"

// 任务域类型定义。
