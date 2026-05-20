import type { WritingBook } from '../types'

interface WritingShelfProps {
  books: WritingBook[]
  currentBook?: WritingBook
  onOpenBook: (bookId: string) => void
}

export function WritingShelf({ books, currentBook, onOpenBook }: WritingShelfProps) {
  return (
    <section className="relative h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(189,159,103,0.16),transparent_28%),linear-gradient(180deg,#fbfbfa_0%,#f1f4f2_100%)] no-scrollbar">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(36,49,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(36,49,55,0.03)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.55),transparent_100%)]" />

      <div className="relative px-10 pb-12 pt-10">
        <div className="mb-10 flex items-end justify-between gap-8">
          <div>
            <div className="text-sm font-medium tracking-[0.14em] text-[#9c9486]">我的项目</div>
            <h1 className="mt-3 text-[42px] font-semibold leading-tight text-[#1f1d1a]">书架总览</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500">
              先把所有书本都放上来，入口做得更像一个私人写作舱。后面点封面时，再补封面飞向中间、逐步放大、翻页进入的动效。
            </p>
          </div>

          {currentBook ? (
            <div className="hidden rounded-[24px] border border-white/70 bg-white/70 px-5 py-4 text-right shadow-[0_15px_35px_rgba(31,29,26,0.08)] backdrop-blur xl:block">
              <div className="text-xs uppercase tracking-[0.16em] text-[#9d9385]">Current Focus</div>
              <div className="mt-2 text-lg font-semibold text-[#1f1d1a]">{currentBook.title}</div>
              <div className="mt-1 text-sm text-gray-500">
                {currentBook.volumes.length} 卷 · {currentBook.volumes.reduce((count, volume) => count + volume.chapters.length, 0)} 章
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white/55 px-8 py-10 shadow-[0_24px_45px_rgba(14,24,32,0.12)] backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9d9385]">Aura Shelf</div>
              <div className="mt-2 text-xl font-semibold text-[#1f1d1a]">你的作品正在这里排队发光</div>
            </div>
            <div className="rounded-full border border-[#ebe3d7] bg-[#fbfaf7] px-4 py-2 text-xs text-[#7f7669]">
              Hover 看封面质感，点击进入书内
            </div>
          </div>

          {books.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d8cfbf] bg-white/70 px-8 py-14 text-center text-[#8d8478]">
              书架还是空的，先从左侧新建一本书。
            </div>
          ) : (
            <div className="relative grid grid-cols-[repeat(auto-fit,minmax(170px,200px))] gap-7 pt-4">
              {books.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => onOpenBook(book.id)}
                  className="group relative flex min-h-[286px] flex-col justify-end overflow-hidden rounded-[20px_12px_12px_20px] bg-[#243137] p-[18px] text-left text-white shadow-[0_25px_35px_rgba(24,32,39,0.18)] transition-[transform,box-shadow,filter] duration-500 [transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)] hover:[transform:perspective(1200px)_rotateY(-14deg)_rotateX(5deg)_translateY(-8px)] hover:shadow-[0_32px_48px_rgba(24,32,39,0.22)] hover:saturate-110"
                >
                  {book.cover ? <img src={book.cover} alt={book.title} className="absolute inset-0 h-full w-full object-cover" /> : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,25,30,0.04)_0%,rgba(6,9,11,0.8)_100%)]" />
                  <div className="absolute inset-y-0 left-0 w-[10px] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(0,0,0,0.2))]" />

                  <div className="relative z-10">
                    <div className="mb-16 inline-flex rounded-full border border-white/20 bg-black/15 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
                      {book.volumes.length} 卷 / {book.volumes.reduce((count, volume) => count + volume.chapters.length, 0)} 章
                    </div>
                    <div className="text-[26px] font-semibold leading-tight">{book.title}</div>
                    <div className="mt-3 text-sm leading-6 text-white/80">{book.description}</div>
                  </div>
                </button>
              ))}

              <div className="pointer-events-none absolute inset-x-0 bottom-1 h-5 rounded-full bg-[radial-gradient(circle,rgba(36,49,55,0.16)_0%,rgba(36,49,55,0.02)_72%,transparent_100%)] blur-2xl" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// 写作区首页书架。
