import type { ReactNode } from 'react'
import { BookText, Clock3, FileText, UsersRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { WritingChapter } from '../types'

interface WritingInspectorProps {
  chapter: WritingChapter
  wordCount: number
  onSummaryChange: (value: string) => void
}

export function WritingInspector({ chapter, wordCount, onSummaryChange }: WritingInspectorProps) {
  return (
    <aside className="hidden h-full w-[320px] shrink-0 border-l border-[#E5E4E7] bg-[#FCFCFA] xl:flex xl:flex-col">
      <div className="border-b border-[#E5E4E7] px-6 py-5">
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9d9385]">Inspector</div>
        <div className="mt-2 text-lg font-semibold text-[#243137]">章节信息</div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="字数" value={`${wordCount} 字`} icon={<FileText className="h-4 w-4" />} />
            <StatCard label="角色" value={`${chapter.characters.length} 个`} icon={<UsersRound className="h-4 w-4" />} />
            <StatCard label="场景" value={`${chapter.sceneNotes.length} 段`} icon={<BookText className="h-4 w-4" />} />
            <StatCard label="更新时间" value={chapter.updatedAt} icon={<Clock3 className="h-4 w-4" />} compact />
          </div>

          <section>
            <div className="mb-2 text-sm font-medium text-[#243137]">章节摘要</div>
            <Textarea
              value={chapter.summary}
              onChange={(event) => onSummaryChange(event.target.value)}
              className="min-h-[120px] resize-none rounded-[16px] border-[#E5E4E7] bg-white text-sm leading-7 text-gray-700"
            />
          </section>

          <section>
            <div className="mb-2 text-sm font-medium text-[#243137]">检视清单</div>
            <div className="space-y-2 rounded-[16px] border border-[#E5E4E7] bg-white p-4">
              {[
                '这一章是否明确推进冲突',
                '场景切换是否足够顺滑',
                '角色动机是否有新的信息',
                '结尾是否留下继续阅读的牵引',
              ].map((item) => (
                <label key={item} className="flex items-start gap-2 text-sm text-[#5f564a]">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#d7cdbf]" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 text-sm font-medium text-[#243137]">下一步动作</div>
            <div className="space-y-2 rounded-[16px] border border-[#E5E4E7] bg-white p-4">
              <Input value="补足匿名发送者的压迫感" readOnly className="h-10 rounded-[12px] border-[#E5E4E7] bg-[#F8FAF9] text-sm" />
              <Input value="把第二幕的步行路线再拉长一点" readOnly className="h-10 rounded-[12px] border-[#E5E4E7] bg-[#F8FAF9] text-sm" />
              <Button variant="outline" className="mt-2 w-full rounded-[12px] border-[#E5E4E7] text-[#243137]">
                添加行动项
              </Button>
            </div>
          </section>
        </div>
      </div>
    </aside>
  )
}

function StatCard({
  label,
  value,
  icon,
  compact = false,
}: {
  label: string
  value: string
  icon: ReactNode
  compact?: boolean
}) {
  return (
    <div className={`rounded-[16px] border border-[#E5E4E7] bg-white p-4 ${compact ? 'col-span-2' : ''}`}>
      <div className="mb-2 flex items-center gap-2 text-[#BD9F67]">{icon}</div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#9d9385]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#243137]">{value}</div>
    </div>
  )
}

// 书内章节右侧检视面板。
