// frontend/src/pages/Dashboard.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { useQueryClient, useIsFetching } from "@tanstack/react-query" // 🚀 新增引入 useIsFetching
import { Button } from "@/components/ui/button"
import { LogOut, MonitorSmartphone } from "lucide-react"

import Sidebar from "../components/layout/Sidebar"
import TodoContent from "../components/todos/TodoContent"
import CreativeStudio from "../components/creative/CreativeStudio" 

// 引入全局加载控制器
import { useLoading } from "../context/LoadingContext"

export type ModuleType = 'todos' | 'studio'

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [activeModule, setActiveModule] = useState<ModuleType>('todos')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const [selectedVolumeId, setSelectedVolumeId] = useState<string | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)

  // 💡 获取全局路由过场的放行钥匙
  const { resolvePageReady } = useLoading()

  // 🚀 核心大招：动态监控全局正在请求的接口数量（返回一个数字，0 代表当前没有任何请求在加载）
  const isFetching = useIsFetching()
  const [hasStartedLoading, setHasStartedLoading] = useState(false)

  // 🎬 自动化数据就绪监听
  useEffect(() => {
    // 1. 如果检测到工作台内部组件（如 TodoContent）开始向 Hono 后端拉取数据
    if (isFetching > 0) {
      setHasStartedLoading(true)
    }

    // 2. 只有当内部组件【曾经启动过请求】，且【当前所有请求已 100% 落地完成（isFetching 归零）】
    // 此时说明页面所有核心 API 数据已全部渲染就绪，立即呼叫大闸放行！
    if (hasStartedLoading && isFetching === 0) {
      resolvePageReady()
    }
  }, [isFetching, hasStartedLoading, resolvePageReady])

  // 🛡️ 极端边界情况保底机制：万一用户是个老账号，本地有缓存或者初次进来没有任何网络请求
  useEffect(() => {
    const backupTimer = setTimeout(() => {
      resolvePageReady() // 1.2秒后强制放行，防止页面被数据锁死
    }, 1200)
    return () => clearTimeout(backupTimer)
  }, [resolvePageReady])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 👈 左侧工具栏 */}
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

      {/* 👉 右侧主内容区 */}
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
        
        {/* 内容展示区 */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 w-full animate-in fade-in duration-500 bg-slate-50/30">
          <div className="mx-auto w-full max-w-6xl h-full">
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