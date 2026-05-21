import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BookCopy, Bookmark, Check, Clock3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import type { UpdateWritingVolumeInput } from '../api'
import type { WritingVolume } from '../types'

interface WritingVolumeInspectorProps {
  volume: WritingVolume
  isSaving?: boolean
  onSave: (payload: UpdateWritingVolumeInput) => void
  onToggleMarked: () => void
}

export function WritingVolumeInspector({ volume, isSaving = false, onSave, onToggleMarked }: WritingVolumeInspectorProps) {
  const [description, setDescription] = useState(volume.description)

  useEffect(() => {
    setDescription(volume.description)
  }, [volume.description, volume.id])

  const isDirty = useMemo(() => description !== volume.description, [description, volume.description])

  return (
    <aside className="hidden h-full w-[320px] shrink-0 border-l border-[#E5E4E7] bg-[#FCFCFA] xl:flex xl:flex-col">
      <div className="border-b border-[#E5E4E7] px-6 py-5">
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9d9385]">Volume View</div>
        <div className="mt-2 text-lg font-semibold text-[#243137]">卷册信息</div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <StatCard icon={<BookCopy className="h-4 w-4" />} label="章节数量" value={`${volume.chapters.length} 章`} />
          <StatCard icon={<Bookmark className="h-4 w-4" />} label="标记状态" value={volume.marked ? '已标记' : '未标记'} />
          <StatCard icon={<Clock3 className="h-4 w-4" />} label="当前阶段" value="卷级整理" />

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="text-sm font-medium text-[#1f1d1a]">卷简介</div>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              className="mt-3 resize-none rounded-[16px] border-[#e6dfd4] bg-[#f8faf9] px-4 py-3 text-sm leading-7 text-[#5d564d] focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-[12px] border-[#e7e2d8] text-[#7e7568]"
                disabled={!isDirty || isSaving}
                onClick={() => setDescription(volume.description)}
              >
                还原
              </Button>
              <Button
                className="rounded-[12px] bg-[#243137] text-white hover:bg-[#1d282d]"
                disabled={!isDirty || isSaving}
                onClick={() => {
                  onSave({ description: description.trim() || '作者很懒' })
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                {isSaving ? '保存中' : '保存'}
              </Button>
            </div>
          </section>

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="text-sm font-medium text-[#1f1d1a]">卷标记</div>
            <p className="mt-3 text-sm leading-7 text-gray-500">标记后会同步到左侧目录，适合暂存重点卷、待整理卷或正在推进的卷。</p>
            <Button variant="outline" className="mt-4 w-full rounded-[12px] border-[#e7e2d8] text-[#243137]" onClick={onToggleMarked}>
              <Bookmark className="mr-2 h-4 w-4" />
              {volume.marked ? '取消标记' : '标记本卷'}
            </Button>
          </section>
        </div>
      </div>
    </aside>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[18px] border border-[#e7e2d8] bg-white p-4">
      <div className="mb-2 text-[#BD9F67]">{icon}</div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#9d9385]">{label}</div>
      <div className="mt-2 text-sm font-semibold text-[#1f1d1a]">{value}</div>
    </div>
  )
}

// 卷级右侧信息面板，负责卷简介与标记状态保存。
