import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "../../client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TodoItem from "./TodoItem"

// 📦 引入 dnd-kit 核心物理引擎与排序器
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'

export default function TodoContent({ categoryId }: { categoryId: string | null }) {
  const qc = useQueryClient()
  const [newTodo, setNewTodo] = useState("")

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => (await client.api.todos.$get()).json()
  })

  const addTodo = useMutation({
    mutationFn: async (title: string) => client.api.todos.$post({ json: { title, categoryId } }),
    onSuccess: () => {
      setNewTodo("")
      qc.invalidateQueries({ queryKey: ["todos"] }) 
    }
  })
  const reorderTodos = useMutation({
    mutationFn: async(updates:{id:string,orderIndex:number}[])=>
        client.api.todos.reorder.$put({ json: { updates } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] })
  })
  // 🎮 配置拖拽传感器 (设定滑动 5 像素才判定为拖拽，防止误触点击)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ⚡ 拖拽结束：乐观更新本地缓存，实现 0 延迟排序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    qc.setQueryData(["todos"], (oldData: any[]) => {
      if (!oldData) return []
      const oldIndex = oldData.findIndex(t => t.id === active.id)
      const newIndex = oldData.findIndex(t => t.id === over.id)
      const newData = arrayMove(oldData, oldIndex, newIndex)
      const updates = newData.map((t, index) => ({ id: t.id, orderIndex: index }))
      reorderTodos.mutate(updates) // 发送排序更新到后端
      return newData
    })
  }

  if (isLoading) return <div className="text-sm text-slate-400 mt-8 ml-2">数据同步中...</div>

  const displayTodos = categoryId ? todos.filter((t: any) => t.categoryId === categoryId) : todos

  return (
    <div className="w-full max-w-4xl text-left flex flex-col h-full">
      
      <div className="mb-8 transform transition-all duration-500 translate-x-0 opacity-100">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          {categoryId ? "专项目标" : "所有任务"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {displayTodos.length > 0 ? `当前共 ${displayTodos.length} 项任务待处理` : "准备开始新的工作"}
        </p>
      </div>

      <div className="mb-8 relative w-full group">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="按下回车键，快速添加新任务..."
          className="w-full h-12 pl-4 pr-24 text-[15px] bg-slate-50/50 border-slate-200 rounded-xl transition-all duration-300 focus:bg-white focus:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] focus:border-indigo-400"
          onKeyDown={(e) => { if (e.key === 'Enter' && newTodo.trim()) addTodo.mutate(newTodo) }}
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center">
          <Button 
            onClick={() => newTodo.trim() && addTodo.mutate(newTodo)} 
            disabled={addTodo.isPending || !newTodo.trim()} 
            size="sm"
            className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
          >
            添加
          </Button>
        </div>
      </div>

      <div className="w-full space-y-2 pb-20">
        {displayTodos.length === 0 ? (
          <div className="py-20 text-center rounded-xl bg-slate-50/50 border border-slate-100">
            <p className="text-slate-400 text-sm">清单空空如也，来点挑战吧！</p>
          </div>
        ) : (
          // 🪄 注入物理空间与排序上下文
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayTodos.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
              {displayTodos.map((todo: any, index: number) => (
                // 将 index 传给子组件，完美保留你的瀑布流动画
                <TodoItem key={todo.id} todo={todo} isGlobalView={categoryId === null} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}