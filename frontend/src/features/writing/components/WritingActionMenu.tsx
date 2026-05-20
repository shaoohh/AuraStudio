import type { LucideIcon } from 'lucide-react'
import { Bookmark, BookmarkCheck, Pencil, Plus, Settings2, Trash2 } from 'lucide-react'

interface WritingActionMenuProps {
  type: 'volume' | 'chapter'
  marked?: boolean
  onEdit: () => void
  onDelete: () => void
  onAdd: () => void
  onToggleMark: () => void
}

interface MenuItem {
  label: string
  icon: LucideIcon
  tone?: 'default' | 'danger'
  onClick: () => void
}

export function WritingActionMenu({
  type,
  marked = false,
  onEdit,
  onDelete,
  onAdd,
  onToggleMark,
}: WritingActionMenuProps) {
  const items: MenuItem[] = [
    { label: '编辑', icon: Pencil, onClick: onEdit },
    { label: '删除', icon: Trash2, tone: 'danger', onClick: onDelete },
    { label: '添加', icon: Plus, onClick: onAdd },
    { label: marked ? '取消' : '标记', icon: marked ? BookmarkCheck : Bookmark, onClick: onToggleMark },
  ]

  return (
    <div className="group relative h-[30px] w-[30px] shrink-0">
      <div className="absolute inset-0 z-[5] flex cursor-pointer items-center justify-center text-[#8f877a] transition-all duration-300 ease-out group-hover:rotate-90 group-hover:scale-[0.6] group-hover:opacity-0 group-hover:text-[#243137]">
        {type === 'volume' ? <Settings2 className="h-4 w-4" /> : <Pencil className="h-3.5 w-3.5" />}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[4] grid w-[92px] -translate-x-[58%] -translate-y-1/2 scale-[0.72] grid-cols-2 gap-[6px] rounded-[18px] border border-[rgba(229,228,231,0.85)] bg-[rgba(255,255,255,0.78)] p-2 opacity-0 shadow-[0_20px_35px_rgba(31,29,26,0.12)] backdrop-blur-[22px] transition-all duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                item.onClick()
              }}
              className={[
                'flex min-h-9 cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border border-transparent bg-[rgba(248,250,249,0.9)] text-[10px] font-semibold text-[#6a6257] transition-all duration-200',
                'hover:-translate-y-0.5 hover:bg-white hover:text-[#243137]',
                item.tone === 'danger' ? 'hover:border-[rgba(230,108,90,0.3)] hover:text-[#c15c4d]' : 'hover:border-[rgba(189,159,103,0.45)]',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="leading-none">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// 写作区卷章的齿轮动作菜单。
