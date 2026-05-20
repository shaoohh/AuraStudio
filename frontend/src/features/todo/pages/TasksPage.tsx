import { useMemo, useState } from "react"

import { TasksSidebar } from "../components/TasksSidebar"
import { TasksWorkspace } from "../components/TasksWorkspace"
import type { TaskItem, TaskStatusFilter } from "../types"

const initialTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "完善第一章的赛博朋克环境描写",
    description: "需要加入更多关于霓虹灯和积水反光的细节，增强代入感。",
    project: "小说大纲",
    priority: "High",
    due: "today",
    completed: false,
  },
  {
    id: "task-2",
    title: "整理角色设定卡的语气关键词",
    description: "把主角、匿名发送者和城市系统的语气标签统一一下。",
    project: "角色设定集",
    priority: "Medium",
    due: "today",
    completed: false,
  },
  {
    id: "task-3",
    title: "补第二章步行路线草图",
    description: "把高架、雨棚和广告屏的空间关系先画清楚。",
    project: "小说大纲",
    priority: "Low",
    due: "upcoming",
    completed: false,
  },
]

export function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedView, setSelectedView] = useState<"inbox" | "today" | "project">("inbox")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all")
  const [draftTitle, setDraftTitle] = useState("")
  const [draftDescription, setDraftDescription] = useState("")
  const [draftProject, setDraftProject] = useState("小说大纲")
  const [draftPriority, setDraftPriority] = useState<TaskItem["priority"]>("High")

  const projects = useMemo(() => Array.from(new Set(tasks.map((task) => task.project))), [tasks])

  const projectCounts = useMemo(
    () =>
      tasks.reduce<Record<string, number>>((accumulator, task) => {
        accumulator[task.project] = (accumulator[task.project] ?? 0) + 1
        return accumulator
      }, {}),
    [tasks]
  )

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesView =
        selectedView === "inbox"
          ? true
          : selectedView === "today"
            ? task.due === "today"
            : task.project === selectedProject

      const matchesSearch =
        keyword.length === 0 ||
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword) ||
        task.project.toLowerCase().includes(keyword)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !task.completed) ||
        (statusFilter === "completed" && task.completed)

      return matchesView && matchesSearch && matchesStatus
    })
  }, [search, selectedProject, selectedView, statusFilter, tasks])

  const title =
    selectedView === "today" ? "Today" : selectedView === "project" && selectedProject ? selectedProject : "Inbox"

  const description =
    selectedView === "today"
      ? "只看今天要处理的内容。"
      : selectedView === "project" && selectedProject
        ? "聚焦当前项目，把相关事项放在一处处理。"
        : "先把所有想法和待办收进这里，再慢慢整理。"

  const addTask = () => {
    if (!draftTitle.trim()) return

    const nextTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: draftTitle.trim(),
      description: draftDescription.trim() || "补充说明稍后再写。",
      project: draftProject.trim() || "未分类",
      priority: draftPriority,
      due: selectedView === "today" ? "today" : "upcoming",
      completed: false,
    }

    setTasks((current) => [nextTask, ...current])
    setDraftTitle("")
    setDraftDescription("")
  }

  return (
    <div className="flex h-full min-h-0 bg-[#F8FAF9]">
      <TasksSidebar
        selectedView={selectedView}
        selectedProject={selectedProject}
        projects={projects}
        totalCount={tasks.length}
        todayCount={tasks.filter((task) => task.due === "today").length}
        projectCounts={projectCounts}
        onSelectInbox={() => {
          setSelectedView("inbox")
          setSelectedProject(null)
        }}
        onSelectToday={() => {
          setSelectedView("today")
          setSelectedProject(null)
        }}
        onSelectProject={(project) => {
          setSelectedView("project")
          setSelectedProject(project)
        }}
      />

      <TasksWorkspace
        title={title}
        description={description}
        tasks={filteredTasks}
        search={search}
        draftTitle={draftTitle}
        draftDescription={draftDescription}
        draftProject={draftProject}
        draftPriority={draftPriority}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onDraftTitleChange={setDraftTitle}
        onDraftDescriptionChange={setDraftDescription}
        onDraftProjectChange={setDraftProject}
        onDraftPriorityChange={setDraftPriority}
        onStatusFilterChange={setStatusFilter}
        onAddTask={addTask}
        onToggleTask={(taskId) =>
          setTasks((current) =>
            current.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
          )
        }
      />
    </div>
  )
}

// 任务页，负责本地任务数据和筛选状态。
