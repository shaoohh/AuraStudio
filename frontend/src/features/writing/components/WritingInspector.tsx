import type { ReactNode } from 'react'
import { BookText, Clock3, FileText, Plus, Trash2, UsersRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { WritingChapter, WritingReviewChecklistItem } from '../types'

interface WritingInspectorProps {
  chapter: WritingChapter
  wordCount: number
  isLoading?: boolean
  onSummaryChange: (value: string) => void
  onReviewChecklistChange: (items: WritingReviewChecklistItem[]) => void
  onNextActionsChange: (items: string[]) => void
}

export function WritingInspector({
  chapter,
  wordCount,
  isLoading = false,
  onSummaryChange,
  onReviewChecklistChange,
  onNextActionsChange,
}: WritingInspectorProps) {
  const reviewChecklist = chapter.reviewChecklist.length > 0 ? chapter.reviewChecklist : createDefaultReviewChecklist(chapter.id)
  const nextActions = chapter.nextActions

  function updateReviewItem(id: string, patch: Partial<WritingReviewChecklistItem>) {
    onReviewChecklistChange(reviewChecklist.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function addReviewItem() {
    onReviewChecklistChange([
      ...reviewChecklist,
      {
        id: `review-${Date.now()}`,
        text: '新的检查项',
        checked: false,
      },
    ])
  }

  function removeReviewItem(id: string) {
    onReviewChecklistChange(reviewChecklist.filter((item) => item.id !== id))
  }

  function updateNextAction(index: number, value: string) {
    onNextActionsChange(nextActions.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  function addNextAction() {
    onNextActionsChange([...nextActions, '新的行动项'])
  }

  function removeNextAction(index: number) {
    onNextActionsChange(nextActions.filter((_, itemIndex) => itemIndex !== index))
  }

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
              disabled={isLoading}
              className="min-h-[120px] resize-none rounded-[16px] border-[#E5E4E7] bg-white text-sm leading-7 text-gray-700"
            />
            {isLoading ? <div className="mt-2 text-xs text-[#9d9385]">正在加载章节详情...</div> : null}
          </section>

          <section>
            <div className="mb-2 text-sm font-medium text-[#243137]">检视清单</div>
            <div className="space-y-3 rounded-[16px] border border-[#E5E4E7] bg-white p-4">
              {reviewChecklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    disabled={isLoading}
                    onChange={(event) => updateReviewItem(item.id, { checked: event.target.checked })}
                    className="h-4 w-4 rounded border-[#d7cdbf]"
                  />
                  <Input
                    value={item.text}
                    disabled={isLoading}
                    onChange={(event) => updateReviewItem(item.id, { text: event.target.value })}
                    className="h-9 flex-1 rounded-[12px] border-[#E5E4E7] bg-[#F8FAF9] text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-[10px] text-[#b2a89b] hover:bg-[#f6efea] hover:text-[#c15c4d]"
                    disabled={isLoading || reviewChecklist.length <= 1}
                    onClick={() => removeReviewItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-[12px] border-[#E5E4E7] text-[#243137]" disabled={isLoading} onClick={addReviewItem}>
                <Plus className="mr-2 h-4 w-4" />
                添加检查项
              </Button>
            </div>
          </section>

          <section>
            <div className="mb-2 text-sm font-medium text-[#243137]">下一步动作</div>
            <div className="space-y-2 rounded-[16px] border border-[#E5E4E7] bg-white p-4">
              {nextActions.map((item, index) => (
                <div key={`${chapter.id}-next-action-${index}`} className="flex items-center gap-2">
                  <Input
                    value={item}
                    disabled={isLoading}
                    onChange={(event) => updateNextAction(index, event.target.value)}
                    className="h-10 flex-1 rounded-[12px] border-[#E5E4E7] bg-[#F8FAF9] text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-[10px] text-[#b2a89b] hover:bg-[#f6efea] hover:text-[#c15c4d]"
                    disabled={isLoading}
                    onClick={() => removeNextAction(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="mt-2 w-full rounded-[12px] border-[#E5E4E7] text-[#243137]" disabled={isLoading} onClick={addNextAction}>
                <Plus className="mr-2 h-4 w-4" />
                添加行动项
              </Button>
            </div>
          </section>
        </div>
      </div>
    </aside>
  )
}

function createDefaultReviewChecklist(chapterId: string): WritingReviewChecklistItem[] {
  return [
    { id: `${chapterId}-review-conflict`, text: '这一章是否明确推进冲突', checked: false },
    { id: `${chapterId}-review-scene`, text: '场景切换是否足够顺滑', checked: false },
    { id: `${chapterId}-review-motive`, text: '角色动机是否有新的信息', checked: false },
    { id: `${chapterId}-review-ending`, text: '结尾是否留下继续阅读的牵引', checked: false },
  ]
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
