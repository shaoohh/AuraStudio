import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface TasksSidebarProps {
  selectedView: "inbox" | "today" | "project"
  selectedProject: string | null
  projects: string[]
  totalCount: number
  todayCount: number
  projectCounts: Record<string, number>
  onSelectInbox: () => void
  onSelectToday: () => void
  onSelectProject: (project: string) => void
}

const calendarRows = [
  ["26", "27", "28", "29", "30", "1", "2"],
  ["3", "4", "5", "6", "7", "8", "9"],
  ["10", "11", "12", "13", "14", "15", "16"],
  ["17", "18", "19", "20", "21", "22", "23"],
]

const projectColors = ["bg-blue-400", "bg-purple-400", "bg-emerald-400", "bg-amber-400"]

export function TasksSidebar({
  selectedView,
  selectedProject,
  projects,
  totalCount,
  todayCount,
  projectCounts,
  onSelectInbox,
  onSelectToday,
  onSelectProject,
}: TasksSidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-[#E5E4E7] bg-gray-50">
      <div className="border-b border-[#E5E4E7] p-6">
        <div className="mb-4 flex items-center justify-between text-sm font-medium text-[#243137]">
          <span>2026 年 5 月</span>
          <div className="flex gap-1 text-gray-400">
            <button className="rounded p-1 hover:bg-white hover:text-[#243137]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded p-1 hover:bg-white hover:text-[#243137]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-700">
          {calendarRows.flat().map((date) => (
            <div
              key={date}
              className={date === "20" ? "mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#BD9F67] text-white shadow-sm" : ""}
            >
              {date}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <div className="space-y-1">
          <button
            onClick={onSelectInbox}
            className={[
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              selectedView === "inbox"
                ? "border border-gray-200 bg-white font-medium text-[#243137] shadow-sm"
                : "text-gray-600 hover:bg-gray-200",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span className="text-[#BD9F67]">•</span>
              Inbox
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{totalCount}</span>
          </button>

          <button
            onClick={onSelectToday}
            className={[
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              selectedView === "today" ? "bg-white font-medium text-[#243137] shadow-sm" : "text-gray-600 hover:bg-gray-200",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400">✓</span>
              Today
            </div>
            <span className="text-xs text-gray-400">{todayCount}</span>
          </button>
        </div>

        <section>
          <div className="mb-2 flex justify-between px-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            <span>Projects</span>
            <button className="rounded p-0.5 hover:bg-white">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((project, index) => {
              const isActive = selectedView === "project" && selectedProject === project

              return (
                <button
                  key={project}
                  onClick={() => onSelectProject(project)}
                  className={[
                    "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive ? "bg-white font-medium text-[#243137] shadow-sm" : "text-gray-600 hover:bg-gray-200",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${projectColors[index % projectColors.length]}`} />
                    {project}
                  </span>
                  <span className="text-xs text-gray-400">{projectCounts[project] ?? 0}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </aside>
  )
}

// 任务区左侧筛选与日历面板。
