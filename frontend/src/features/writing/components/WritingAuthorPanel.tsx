import type { WritingBook } from '../types'

interface WritingAuthorPanelProps {
  book?: WritingBook
  worksCount: number
}

export function WritingAuthorPanel({ book, worksCount }: WritingAuthorPanelProps) {
  const chapterCount = book ? book.volumes.reduce((count, volume) => count + volume.chapters.length, 0) : 0
  const penName = book?.penName ?? '未命名作者'

  return (
    <aside className="hidden h-full w-[320px] shrink-0 border-l border-[#E5E4E7] bg-[#FCFCFA] xl:flex xl:flex-col">
      <div className="border-b border-[#E5E4E7] px-6 py-5">
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9d9385]">Author View</div>
        <div className="mt-2 text-lg font-semibold text-[#243137]">作者信息</div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#e7e2d8] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#ede5d9] bg-[#f7f5ef]">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(penName)}`}
                  alt={penName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#9d9385]">Pen Name</div>
                <div className="mt-1 text-lg font-semibold text-[#1f1d1a]">{penName}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="已有作品" value={String(worksCount)} />
            <StatCard label="当前章节" value={String(chapterCount)} />
          </div>

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="text-sm font-medium text-[#1f1d1a]">风格分析</div>
            <p className="mt-3 text-sm leading-7 text-[#5d564d]">{book?.style ?? '风格待分析'}</p>
            <p className="mt-3 text-sm leading-7 text-gray-500">{book?.styleNote ?? '等你写作数据更多一点，这里再慢慢长出作者画像。'}</p>
          </section>

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="text-sm font-medium text-[#1f1d1a]">当前作品摘要</div>
            <p className="mt-3 text-sm leading-7 text-[#5d564d]">{book?.description ?? '先创建一本书，右侧作者面板会跟着丰富起来。'}</p>
          </section>
        </div>
      </div>
    </aside>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#e7e2d8] bg-white p-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#9d9385]">{label}</div>
      <div className="mt-2 text-xl font-semibold text-[#1f1d1a]">{value}</div>
    </div>
  )
}

// 写作区首页右侧作者信息面板。
