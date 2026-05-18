// frontend/src/components/layout/Sidebar.tsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "../../client"
import { Kanban, BookOpen, Inbox, Plus, Folder, Trash2, Library, ChevronDown, ChevronRight, FileText, Edit2 } from "lucide-react"
import type { ModuleType } from "../../pages/Dashboard"

interface SidebarProps {
  activeModule: ModuleType
  setActiveModule: (module: ModuleType) => void
  activeCategoryId: string | null
  onSelectCategory: (id: string | null) => void
  activeVolumeId: string | null
  onSelectVolume: (id: string | null) => void
  activeChapterId: string | null
  onSelectChapter: (id: string | null) => void
}

export default function Sidebar({ 
  activeModule, setActiveModule, 
  activeCategoryId, onSelectCategory,
  activeVolumeId, onSelectVolume,
  activeChapterId, onSelectChapter 
}: SidebarProps) {
  const qc = useQueryClient()
  const [newCategoryName, setNewCategoryName] = useState("")
  
  // 局部 UI 状态：控制卷宗的展开与收起
  const [expandedVolumes, setExpandedVolumes] = useState<string[]>([])
  
  const toggleVolume = (volumeId: string) => {
    setExpandedVolumes(prev => prev.includes(volumeId) ? prev.filter(id => id !== volumeId) : [...prev, volumeId])
  }

  // ================= Todo 模块 API =================
  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await client.api.categories.$get()).json()
  })

  const addCategory = useMutation({
    mutationFn: async (name: string) => client.api.categories.$post({ json: { name } }),
    onSuccess: () => {
      setNewCategoryName("")
      qc.invalidateQueries({ queryKey: ["categories"] })
    }
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => client.api.categories[":id"].$delete({ param: { id } }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      if (activeCategoryId === id) onSelectCategory(null)
    }
  })

  // ================= Studio 模块 API =================
  const { data: volumes = [], isLoading: isVolLoading } = useQuery({
    queryKey: ["volumes"],
    queryFn: async () => (await client.api.volumes.$get()).json(),
    enabled: activeModule === 'studio' // 只有切到 Studio 模式才去拉取，优化性能
  })

  const addVolume = useMutation({
    mutationFn: async () => {
      const res = await client.api.volumes.$post({ json: { title: `第 ${volumes.length + 1} 卷：未命名` } })
      return await res.json()
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["volumes"] })
      if ('id' in data) {
        setExpandedVolumes(prev => [...prev, data.id])
        onSelectVolume(data.id)
      }
    }
  })

  const deleteVolume = useMutation({
    mutationFn: async (id: string) => client.api.volumes[":id"].$delete({ param: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volumes"] })
      onSelectVolume(null)
      onSelectChapter(null)
    }
  })

  const renameVolume = useMutation({
    mutationFn: async ({ id, title }: { id: string, title: string }) => client.api.volumes[":id"].$put({ param: { id }, json: { title } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["volumes"] })
  })

  // 为特定卷新建章
  const addChapter = useMutation({
    mutationFn: async (volumeId: string) => {
      const volume = volumes.find((v: any) => v.id === volumeId)
      const chapterCount = volume?.chapters?.length || 0
      const res = await client.api.chapters.$post({ json: { volumeId, title: `第 ${chapterCount + 1} 章` } })
      return await res.json()
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["volumes"] })
      if ('id' in data) {
        onSelectChapter(data.id)
      }
    }
  })


  if (isCatLoading || (activeModule === 'studio' && isVolLoading)) {
    return <div className="text-sm text-slate-400 p-4">同步数据中...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* 模块切换器 (保留你的精致样式) */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/50 rounded-lg mb-2">
        <button
          onClick={() => setActiveModule("todos")}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${
            activeModule === "todos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Kanban className="w-3.5 h-3.5" /> 任务
        </button>
        <button
          onClick={() => { setActiveModule("studio"); onSelectCategory(null) }}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${
            activeModule === "studio" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 创作
        </button>
      </div>

      {activeModule === "todos" ? (
        // ================= 模块 A：任务清单 (完全保留你的原生代码) =================
        <div className="space-y-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategoryId === null ? "bg-slate-200/60 text-slate-900" : "text-slate-600 hover:bg-slate-200/40"
            }`}
          >
            <Inbox className="w-4 h-4" /> <span>全部任务</span>
          </button>

          <div className="pt-4 pb-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">快捷清单</p>
          </div>

          {categories.map((cat: any) => (
            <div key={cat.id} className="group flex items-center justify-between w-full rounded-md transition-colors hover:bg-slate-200/40">
              <button
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2 text-sm font-medium truncate ${
                  activeCategoryId === cat.id ? "bg-slate-200/60 text-slate-900" : "text-slate-600"
                }`}
              >
                <Folder className="w-4 h-4 text-slate-400" />
                <span className="truncate">{cat.name}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteCategory.mutate(cat.id) }}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="px-3 pt-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && newCategoryName.trim()) { e.preventDefault(); addCategory.mutate(newCategoryName) } }}
              placeholder="新建清单 (Enter)..."
              className="w-full text-sm bg-transparent border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
          </div>
        </div>
      ) : (
        // ================= 模块 B：卷-章 树形目录 (完美融合你的样式) =================
        <div className="space-y-1 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="px-3 py-1 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">小说卷宗 / 剧本线</p>
          </div>
          
          <div className="space-y-2 mt-1">
            {/* 动态渲染从后端拉取的卷宗树 */}
            {volumes.map((volume: any) => {
              const isExpanded = expandedVolumes.includes(volume.id)
              const isVolSelected = activeVolumeId === volume.id
              
              return (
                <div key={volume.id} className="space-y-0.5">
                  {/* 第一级：卷宗节点 */}
                  <div className={`group flex items-center justify-between w-full rounded-md transition-colors ${isVolSelected ? "bg-indigo-50/60 border border-indigo-100/50" : "hover:bg-slate-200/40 border border-transparent"}`}>
                    <button 
                      onClick={() => { toggleVolume(volume.id); onSelectVolume(volume.id); onSelectChapter(null) }} 
                      className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 text-[13px] font-semibold truncate ${isVolSelected ? "text-indigo-900" : "text-slate-700"}`}
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                      <Library className={`w-3.5 h-3.5 shrink-0 ${isVolSelected ? "text-indigo-500" : "text-slate-400"}`} />
                      <span className="truncate">{volume.title}</span>
                    </button>
                    
                    {/* 悬停出现的操作按钮组 */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center pr-1 shrink-0 bg-gradient-to-l from-white/90 via-white/80 to-transparent pl-2">
                      <button onClick={() => {
                        const newTitle = prompt("修改卷宗名", volume.title);
                        if (newTitle && newTitle.trim()) renameVolume.mutate({ id: volume.id, title: newTitle.trim() });
                      }} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => deleteVolume.mutate(volume.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                      <button onClick={() => { setExpandedVolumes(prev => [...prev, volume.id]); addChapter.mutate(volume.id) }} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>

                  {/* 第二级：章节节点 (展开时显示) */}
                  {isExpanded && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 relative">
                      {/* 左侧的视觉辅助连接线 */}
                      <div className="absolute left-[13px] top-0 bottom-2 w-[1.5px] bg-slate-200/70 rounded-full"></div>
                      
                      {volume.chapters?.map((chapter: any) => (
                        <button
                          key={chapter.id}
                          onClick={() => { onSelectChapter(chapter.id); onSelectVolume(volume.id) }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-all relative ${activeChapterId === chapter.id ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/60 text-indigo-700 font-medium z-10" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent"}`}
                        >
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${activeChapterId === chapter.id ? "text-indigo-500" : "text-slate-400"}`} />
                          <span className="truncate">{chapter.title}</span>
                        </button>
                      ))}
                      {volume.chapters?.length === 0 && (
                        <div className="px-2.5 py-1 text-[11px] text-slate-400 italic">空空如也，点击卷宗右侧 + 创建</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 底部固定的新建卷宗按钮 */}
          <div className="pt-2">
            <button
              onClick={() => addVolume.mutate()}
              disabled={addVolume.isPending}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-100 text-[13px] font-medium transition-colors border border-transparent border-dashed hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>新建故事卷宗...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}