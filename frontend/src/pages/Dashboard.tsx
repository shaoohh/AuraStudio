// frontend/src/pages/Dashboard.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { LogOut, MonitorSmartphone } from "lucide-react"

import Sidebar from "../components/layout/Sidebar"
import TodoContent from "../components/todos/TodoContent"
import CreativeStudio from "../components/creative/CreativeStudio" // 🆕 引入工作室

export type ModuleType = 'todos' | 'studio' // 🆕 定义模块类型

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // 🆕 全局一级模块状态
  const [activeModule, setActiveModule] = useState<ModuleType>('todos')
  
  // Todo 状态
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // 🆕 Studio 状态 (控制右侧编辑器到底显示哪一卷、哪一章)
  const [selectedVolumeId, setSelectedVolumeId] = useState<string | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate("/login")
  }

  return (
    // 整个屏幕没有多余的留白
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 👈 左侧工具栏 (飞书风格的极浅灰背景) */}
      <div className="w-[260px] bg-white/80 backdrop-blur-sm border-r border-slate-200/80 flex flex-col shrink-0 z-10 shadow-sm">
        <div className="h-14 px-5 flex items-center shrink-0">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <MonitorSmartphone className="w-5 h-5 text-indigo-600" />
            <span>Workspace</span>
          </div>
        </div>
        
        {/* 导航控制区 */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <Sidebar 
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            activeCategoryId={selectedCategory} 
            onSelectCategory={setSelectedCategory}
            activeVolumeId={selectedVolumeId}
            onSelectVolume={setSelectedVolumeId}
            activeChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
          />
        </div>

        <div className="p-3 mt-auto shrink-0 border-t border-slate-200/60">
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-200/50" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> 退出当前账号
          </Button>
        </div>
      </div>

      {/* 👉 右侧主内容区 (彻底流式展开，撑满剩余空间) */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* 顶部状态栏 */}
        <header className="h-14 shrink-0 border-b border-slate-200/70 bg-white/80 backdrop-blur-sm flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-[15px] font-medium text-slate-800">
            {activeModule === 'todos' 
              ? (selectedCategory ? "专项清单" : "全局任务总览") 
              : "AIGC 剧本创作台"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-500 font-medium">实时同步中</span>
          </div>
        </header>
        
        {/* 内容展示区：W-FULL，无拘无束 */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 w-full animate-in fade-in duration-500 bg-slate-50/30">
          <div className="mx-auto w-full max-w-6xl h-full">
            {/* 🚀 终极路由分发：基于 activeModule 渲染对应的庞大平行应用 */}
            {activeModule === 'todos' ? (
              <TodoContent categoryId={selectedCategory} />
            ) : (
              <CreativeStudio volumeId={selectedVolumeId} chapterId={selectedChapterId} />
            )}
          </div>
        </main>
      </div>
      
    </div>
  )
}