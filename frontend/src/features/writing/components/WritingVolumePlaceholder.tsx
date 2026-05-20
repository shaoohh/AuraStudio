import type { WritingVolume } from '../types'

interface WritingVolumePlaceholderProps {
  bookTitle: string
  volume: WritingVolume
}

export function WritingVolumePlaceholder({ bookTitle, volume }: WritingVolumePlaceholderProps) {
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
        <div className="w-full max-w-4xl px-10 py-16">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a59b8d]">Volume</div>
          <h1 className="mt-4 text-[42px] font-semibold leading-tight text-[#1f1d1a]">{volume.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#8d8478]">
            <span>{volume.chapters.length} 章</span>
            <span>卷级视图占位</span>
          </div>

          <p className="mt-8 max-w-2xl text-[15px] leading-8 text-[#5f564a]">
            {volume.description || '这一卷的展示逻辑先占位，后面再接你真正想要的卷内工作台。'}
          </p>

          <div className="mt-12 border-t border-[#ece7de] pt-8">
            <div className="text-sm font-medium text-[#2c2822]">本卷章节</div>

            <div className="mt-5 space-y-3">
              {volume.chapters.map((chapter, index) => (
                <div key={chapter.id} className="flex items-start justify-between gap-6 border-b border-[#f3eee6] pb-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#1f1d1a]">{chapter.title}</div>
                    <div className="mt-1 truncate text-sm text-[#8d8478]">{chapter.summary}</div>
                  </div>
                  <div className="shrink-0 text-[12px] text-[#b0a89c]">{String(index + 1).padStart(2, '0')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// 卷级主工作区占位视图。
