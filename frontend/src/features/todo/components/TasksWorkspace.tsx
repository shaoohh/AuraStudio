import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { TaskItem, TaskStatusFilter } from "../types"

interface TasksWorkspaceProps {
  title: string
  description: string
  tasks: TaskItem[]
  search: string
  draftTitle: string
  draftDescription: string
  draftProject: string
  draftPriority: TaskItem["priority"]
  statusFilter: TaskStatusFilter
  onSearchChange: (value: string) => void
  onDraftTitleChange: (value: string) => void
  onDraftDescriptionChange: (value: string) => void
  onDraftProjectChange: (value: string) => void
  onDraftPriorityChange: (value: TaskItem["priority"]) => void
  onStatusFilterChange: (value: TaskStatusFilter) => void
  onAddTask: () => void
  onToggleTask: (taskId: string) => void
}

const statusFilters: Array<{ id: TaskStatusFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "pending", label: "待处理" },
  { id: "completed", label: "已完成" },
]

export function TasksWorkspace({
  title,
  description,
  tasks,
  search,
  draftTitle,
  draftDescription,
  draftProject,
  draftPriority,
  statusFilter,
  onSearchChange,
  onDraftTitleChange,
  onDraftDescriptionChange,
  onDraftProjectChange,
  onDraftPriorityChange,
  onStatusFilterChange,
  onAddTask,
  onToggleTask,
}: TasksWorkspaceProps) {
  const groupedTasks = {
    today: tasks.filter((task) => task.due === "today"),
    upcoming: tasks.filter((task) => task.due === "upcoming"),
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <header className="border-b border-[#E5E4E7] px-10 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#243137]">{title}</h1>
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          </div>

          <Button className="rounded-md bg-[#243137] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800" onClick={onAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            新建任务
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="搜索任务..."
              className="h-11 rounded-md border-[#e6e0d4] bg-white pl-9 text-sm text-[#243137]"
            />
          </div>

          <Input
            value={draftTitle}
            onChange={(event) => onDraftTitleChange(event.target.value)}
            placeholder="快速输入任务标题..."
            className="h-11 rounded-md border-[#e6e0d4] bg-white text-sm text-[#243137]"
          />

          <select
            value={draftPriority}
            onChange={(event) => onDraftPriorityChange(event.target.value as TaskItem["priority"])}
            className="h-11 rounded-md border border-[#e6e0d4] bg-white px-3 text-sm text-[#243137] outline-none"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_120px]">
          <Input
            value={draftDescription}
            onChange={(event) => onDraftDescriptionChange(event.target.value)}
            placeholder="补一行任务说明..."
            className="h-11 rounded-md border-[#e6e0d4] bg-white text-sm text-[#243137]"
          />

          <Input
            value={draftProject}
            onChange={(event) => onDraftProjectChange(event.target.value)}
            placeholder="项目名称"
            className="h-11 rounded-md border-[#e6e0d4] bg-white text-sm text-[#243137]"
          />

          <Button className="h-11 rounded-md bg-[#243137] text-sm font-medium text-white hover:bg-gray-800" onClick={onAddTask}>
            添加
          </Button>
        </div>

        <div className="mt-5 flex gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onStatusFilterChange(filter.id)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === filter.id ? "bg-[#243137] text-white" : "bg-[#F4F5F4] text-gray-500 hover:bg-[#ECEEEB]",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <TaskSection title="Today" meta="20 May, Wed" tasks={groupedTasks.today} onToggleTask={onToggleTask} />
          <TaskSection title="Upcoming" meta="Later this week" tasks={groupedTasks.upcoming} onToggleTask={onToggleTask} />
        </div>
      </div>
    </main>
  )
}

function TaskSection({
  title,
  meta,
  tasks,
  onToggleTask,
}: {
  title: string
  meta: string
  tasks: TaskItem[]
  onToggleTask: (taskId: string) => void
}) {
  if (tasks.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-bold text-gray-800">
        {title}
        <span className="text-xs font-normal text-gray-400">{meta}</span>
      </h2>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
            <button
              onClick={() => onToggleTask(task.id)}
              className={[
                "mt-0.5 h-5 w-5 rounded-full border-2 transition-colors",
                task.completed ? "border-[#BD9F67] bg-[#BD9F67]" : "border-gray-300 hover:border-[#BD9F67]",
              ].join(" ")}
            />

            <div className="flex-1">
              <h3 className={["text-base font-medium", task.completed ? "text-gray-400 line-through" : "text-gray-800"].join(" ")}>
                {task.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{task.description}</p>

              <div className="mt-3 flex gap-2">
                <span className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-600">{task.project}</span>
                <span
                  className={[
                    "rounded border px-2 py-1 text-xs",
                    task.priority === "High"
                      ? "border-red-100 bg-red-50 text-red-600"
                      : task.priority === "Medium"
                        ? "border-amber-100 bg-amber-50 text-amber-700"
                        : "border-emerald-100 bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// 任务区主工作台。
