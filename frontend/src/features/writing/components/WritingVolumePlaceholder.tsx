import { BookOpen, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { WritingVolume } from '../types'
import { compareWritingTitles } from '../utils'

interface WritingVolumePlaceholderProps {
  bookTitle: string
  volume: WritingVolume
  onOpenChapter: (chapterId: string) => void
  onAddChapter: () => void
}

export function WritingVolumePlaceholder({ bookTitle, volume, onOpenChapter, onAddChapter }: WritingVolumePlaceholderProps) {
  const chapters = [...volume.chapters].sort(compareWritingTitles)

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <header className="border-b border-[#E5E4E7] bg-white px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>我的项目</span>
          <span>/</span>
          <span>{bookTitle}</span>
          <span>/</span>
          <span className="font-medium text-[#243137]">{volume.title}</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto">
        <div className="w-full max-w-4xl px-10 py-12">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a59b8d]">Volume</div>
          <h1 className="mt-4 text-[42px] font-semibold leading-tight text-[#1f1d1a]">{volume.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#8d8478]">
            <span>{volume.chapters.length} 章</span>
            <span>{volume.marked ? '已标记' : '未标记'}</span>
          </div>

          <p className="mt-8 max-w-2xl text-[15px] leading-8 text-[#5f564a]">{volume.description || '这卷还没有简介。'}</p>

          <div className="mt-12 border-t border-[#ece7de] pt-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-[#2c2822]">本卷章节</div>
              <Button variant="outline" className="rounded-[12px] border-[#E5E4E7] text-[#243137]" onClick={onAddChapter}>
                <Plus className="mr-2 h-4 w-4" />
                新增章节
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onOpenChapter(chapter.id)}
                  className="group flex w-full items-start justify-between gap-6 border-b border-[#f3eee6] pb-3 text-left transition-colors hover:border-[#e2d8c7]"
                >
                  <div className="flex min-w-0 gap-4">
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7f2e8] text-[12px] font-medium text-[#9a8a70]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#1f1d1a] transition-colors group-hover:text-[#BD9F67]">{chapter.title}</span>
                      <span className="mt-1 block truncate text-sm text-[#8d8478]">{chapter.summary || '暂无摘要'}</span>
                    </span>
                  </div>
                  <BookOpen className="mt-1 h-4 w-4 shrink-0 text-[#c0b6a8] transition-colors group-hover:text-[#BD9F67]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// 卷级主工作区。
