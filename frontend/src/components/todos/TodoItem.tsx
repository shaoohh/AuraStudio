import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "../../client"

// 📦 引入拖拽 Hook、坐标转换器，以及抓手图标
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Trash2, GripVertical } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// 接收 index 属性
export default function TodoItem({ todo, isGlobalView, index = 0 }: { todo: any, isGlobalView: boolean, index?: number }) {
  const qc = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // 🪄 激活 dnd-kit，绑定当前 id
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  // 🎨 完美融合：你的瀑布流动效 + dnd 物理形变坐标
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    animationFillMode: "both" as const,
    animationDelay: `${index * 40}ms`,
    zIndex: isDragging ? 50 : 'auto', // 拖拽时置于顶层
  }

  const toggleTodo = useMutation({
    mutationFn: async (completed: boolean) => client.api.todos[":id"].$put({ param: { id: todo.id }, json: { completed } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }) 
  })

  const deleteTodo = useMutation({
    mutationFn: async () => client.api.todos[":id"].$delete({ param: { id: todo.id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] })
  })

  return (
    <>
      {/* 最外层容器绑定 ref 和合并后的 style */}
      {/* 核心改动：加入 isDragging 动态类名，保持你的高级过渡效果 */}
      <div 
        ref={setNodeRef}
        style={style}
        className={`group flex items-start gap-3 p-4 bg-white border rounded-xl text-left animate-in fade-in slide-in-from-bottom-2 duration-500 ${
          isDragging 
            ? "shadow-xl border-indigo-500 scale-[1.02] opacity-80" // 拖拽悬浮态
            : "border-slate-200 hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all" // 默认正常态
        }`}
      >
        
        {/* 🖐️ 独立的拖拽抓手区 (仅通过这个小图标触发拖拽，防止选中文字时误拖) */}
        <div 
          {...attributes} 
          {...listeners} 
          className="mt-[3px] -ml-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="pt-[2px] shrink-0">
          <Checkbox 
            checked={todo.completed} 
            onCheckedChange={(c) => toggleTodo.mutate(c as boolean)}
            className="w-[18px] h-[18px] rounded-[4px] border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 transition-colors"
          />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <span className={`text-[15px] font-medium leading-relaxed transition-all duration-300 ${todo.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
            {todo.title}
          </span>
          {isGlobalView && todo.category && (
            <Badge variant="outline" className="mt-1.5 w-fit text-[11px] font-normal text-slate-500 border-slate-200 bg-slate-50">
              {todo.category.name}
            </Badge>
          )}
        </div>

        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-white border-slate-200 shadow-lg rounded-xl">
              <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> 删除任务
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 text-left">确认删除该任务？</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-left">
              该任务将被永久删除，无法找回。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 hover:bg-slate-50">取消</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteTodo.mutate()}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}