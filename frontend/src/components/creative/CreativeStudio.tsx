// frontend/src/components/creative/CreativeStudio.tsx
import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "../../client"

import { Image as ImageIcon, FileText, Loader2, UploadCloud, AlignLeft, LayoutTemplate } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
const baseurl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000' // 从环境变量读取 API 基础 URL，提供默认值
export default function CreativeStudio({
  volumeId,
  chapterId,
}: {
  volumeId: string | null
  chapterId: string | null
}) {
  const qc = useQueryClient()

  // 1. 获取全局卷宗列表（为了拿到当前选中卷宗的名字和它下面所有的资产）
  const { data: volumes = [] } = useQuery({
    queryKey: ["volumes"],
    queryFn: async () => (await client.api.volumes.$get()).json()
  })

  // 2. 独立拉取选中章节的【完整详情】（包含长文本）
  const { data: activeChapterDetail, isLoading: isChapterLoading } = useQuery({
    queryKey: ["chapterDetail", chapterId],
    queryFn: async () => (await client.api.chapters[":id"].$get({ param: { id: chapterId! } })).json(),
    enabled: !!chapterId // 只有选中了章节才去发请求
  })

  const activeVolume = volumes.find((v: any) => v.id === volumeId)

  // 默认空状态 UI
  if (!volumeId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <BookOpenIcon className="w-12 h-12 mb-4 opacity-20" />
        <p>请在左侧选择或新建一个故事卷宗</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* 顶部标题区：显示 卷名 > 章名 */}
      <div className="px-8 py-5 border-b border-slate-100 flex items-center shrink-0 bg-slate-50/30">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-500">{activeVolume?.title}</span>
          {chapterId && activeChapterDetail && 'title' in activeChapterDetail && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">{activeChapterDetail.title}</span>
            </>
          )}
        </div>
      </div>

      {/* 核心分屏区域 */}
      <Tabs defaultValue="script" className="flex-1 flex flex-col overflow-hidden">
        
        {/* Tab 导航条 */}
        <div className="px-8 pt-4 border-b border-slate-100 shrink-0">
          <TabsList className="bg-slate-100/50">
            {/* 只有选中了具体章节，才允许进入剧本编辑模式 */}
            <TabsTrigger value="script" disabled={!chapterId} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4 mr-2"/> 章节编辑
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ImageIcon className="w-4 h-4 mr-2"/> 卷宗级资产 ({activeVolume?.assets?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ================= 视图 1：章节双字段编辑器 ================= */}
        <TabsContent value="script" className="flex-1 p-0 m-0 focus-visible:outline-none overflow-hidden flex flex-col">
          {isChapterLoading ? (
             <div className="flex-1 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2"/> 加载正文...</div>
          ) : activeChapterDetail && 'title' in activeChapterDetail ? (
             // 将获取到的章节详情塞给编辑器子组件
             <DualFieldEditor chapter={activeChapterDetail} qc={qc} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">请在左侧选择一个章节</div>
          )}
        </TabsContent>

        {/* ================= 视图 2：卷级多媒体资产画廊 ================= */}
        <TabsContent value="assets" className="flex-1 overflow-y-auto p-8 m-0 focus-visible:outline-none bg-slate-50/50">
          <VolumeAssetsGallery volume={activeVolume} qc={qc} />
        </TabsContent>

      </Tabs>
    </div>
  )
}

// 占位图标组件
const BookOpenIcon = (props: any) => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>


// ============================================================================
// 🚀 子组件 A：双字段防抖编辑器 (Original Text & Storyboard MD)
// ============================================================================
function DualFieldEditor({ chapter, qc }: { chapter: any, qc: any }) {
  // 🎓 知识点：维护两个独立的本地状态，保证两边打字都不卡
  const [localTxt, setLocalTxt] = useState(chapter.originalText || "")
  const [localMd, setLocalMd] = useState(chapter.storyboardMd || "")
  const [isSaving, setIsSaving] = useState(false)

  // 当外部点击切换了另一个章节时，重置本地输入框
  useEffect(() => {
    setLocalTxt(chapter.originalText || "")
    setLocalMd(chapter.storyboardMd || "")
  }, [chapter.id])

  const updateChapter = useMutation({
    mutationFn: async (data: any) => client.api.chapters[":id"].$put({ param: { id: chapter.id }, json: data }),
    onSuccess: () => {
      setIsSaving(false)
      // 刷新单章详情和左侧目录树
      qc.invalidateQueries({ queryKey: ["chapterDetail", chapter.id] })
    }
  })

  // 🎓 防抖保存逻辑：同时监听两个字段的变化
  useEffect(() => {
    if (localTxt === (chapter.originalText || "") && localMd === (chapter.storyboardMd || "")) return 

    setIsSaving(true)
    const timeoutId = setTimeout(() => {
      updateChapter.mutate({ originalText: localTxt, storyboardMd: localMd })
    }, 1200) // 1.2秒停顿后保存

    return () => clearTimeout(timeoutId)
  }, [localTxt, localMd, chapter])

  return (
    <div className="flex flex-col h-full relative">
      {/* 绝对定位的右上角保存状态指示器 */}
      <div className="absolute top-4 right-8 z-10 text-xs text-slate-400 flex items-center bg-white/80 px-2 py-1 rounded backdrop-blur shadow-sm">
        {isSaving ? <><Loader2 className="w-3 h-3 animate-spin mr-1.5" /> 云端同步中...</> : "已存云端"}
      </div>

      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-100">
        {/* 左侧：原文本 (TXT) */}
        <div className="flex flex-col">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
             <AlignLeft className="w-3.5 h-3.5 mr-2" /> 原文文本 (TXT)
          </div>
          <Textarea 
            value={localTxt}
            onChange={(e) => setLocalTxt(e.target.value)}
            placeholder="在这里尽情倾泻你的小说原文..."
            className="flex-1 resize-none border-0 rounded-none shadow-none focus-visible:ring-0 p-6 text-[15px] leading-loose text-slate-700 bg-transparent"
          />
        </div>

        {/* 右侧：分镜要求 (MD) */}
        <div className="flex flex-col bg-slate-50/30">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center text-xs font-semibold text-indigo-500 uppercase tracking-wider bg-indigo-50/50">
            <LayoutTemplate className="w-3.5 h-3.5 mr-2" /> 分镜脚本 (Markdown)
          </div>
          <Textarea 
            value={localMd}
            onChange={(e) => setLocalMd(e.target.value)}
            placeholder="为短剧导演编写详细的分镜指示..."
            className="flex-1 resize-none border-0 rounded-none shadow-none focus-visible:ring-0 p-6 text-[14px] leading-relaxed font-mono text-slate-700 bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}


// ============================================================================
// 🚀 子组件 B：卷宗级资产画廊 (Volume Level Assets)
// ============================================================================
function VolumeAssetsGallery({ volume, qc }: { volume: any, qc: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !volume) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("name", file.name)
    formData.append("type", "character")

    try {
      // 🎓 发送到新的卷宗级上传接口
      const res = await fetch(`${baseurl}/api/volumes/${volume.id}/assets`, {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["volumes"] }) 
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = "" 
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-base font-semibold text-slate-800">【{volume?.title}】所属资产</h3>
          <p className="text-xs text-slate-500 mt-1">这里上传的角色参考图可供本卷所有章节查阅。</p>
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading || !volume} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9">
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
          {isUploading ? "云端处理中..." : "上传角色参考图"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {isUploading && (
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-2 animate-pulse">
             <AspectRatio ratio={9 / 16}>
                <Skeleton className="w-full h-full rounded-lg bg-slate-100" />
             </AspectRatio>
             <div className="mt-4 px-1"><Skeleton className="h-4 w-2/3" /></div>
          </div>
        )}
        
        {volume?.assets?.map((asset: any) => (
          <div key={asset.id} className="group border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all p-2">
            <AspectRatio ratio={9 / 16} className="bg-slate-100 rounded-lg overflow-hidden relative">
              <img src={asset.url} alt={asset.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                {asset.type === 'character' ? '角色设定' : '场景'}
              </div>
            </AspectRatio>
            <div className="mt-3 px-1 pb-1">
              <p className="text-[13px] font-medium text-slate-800 truncate" title={asset.name}>{asset.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">AIGC 资产文件</p>
            </div>
          </div>
        ))}

        {volume?.assets?.length === 0 && !isUploading && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium text-slate-500">该卷宗下暂无参考图</p>
            <p className="text-xs mt-1">点击右上角上传第一张 AIGC 资产</p>
          </div>
        )}
      </div>
    </>
  )
}