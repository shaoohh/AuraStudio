import type { ReactNode } from 'react'
import { BookCopy, Bookmark, Clock3 } from 'lucide-react'

import type { WritingVolume } from '../types'

interface WritingVolumeInspectorProps {
  volume: WritingVolume
}

export function WritingVolumeInspector({ volume }: WritingVolumeInspectorProps) {
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
          <StatCard icon={<Clock3 className="h-4 w-4" />} label="当前阶段" value="卷级占位中" />

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="text-sm font-medium text-[#1f1d1a]">卷简介</div>
            <p className="mt-3 text-sm leading-7 text-[#5d564d]">{volume.description || '这卷还没有简介。'}</p>
          </section>

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="text-sm font-medium text-[#1f1d1a]">后续预留</div>
            <p className="mt-3 text-sm leading-7 text-gray-500">这里后面可以接卷摘要、卷目标、卷内节奏分布，或者你想要的中间态展示逻辑。</p>
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

// 卷级右侧信息占位面板。
