import type { WritingBook } from '../types'

interface WritingShelfProps {
  books: WritingBook[]
  onOpenBook: (bookId: string) => void
}

export function WritingShelf({ books, onOpenBook }: WritingShelfProps) {
  const visibleBooks = books.slice(0, 9)
  const slots = Array.from({ length: 9 }, (_, index) => visibleBooks[index] ?? null)

  return (
    <section className="relative h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(189,159,103,0.16),transparent_28%),linear-gradient(180deg,#fbfbfa_0%,#f1f4f2_100%)] no-scrollbar">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(36,49,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(36,49,55,0.03)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.55),transparent_100%)]" />

      <div className="relative flex h-full min-h-0 flex-col px-5 pb-5 pt-3">
        <div className="flex h-full min-h-0 flex-1 rounded-[30px] border border-white/80 bg-white/55 p-5 shadow-[0_24px_45px_rgba(14,24,32,0.12)] backdrop-blur-xl">
          {books.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-[24px] border border-dashed border-[#d8cfbf] bg-white/70 px-8 py-14 text-center text-[#8d8478]">
              书架还是空的，先从左侧新建一本书。
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="grid h-full min-h-0 grid-cols-3 grid-rows-3 gap-x-5 gap-y-4">
                {slots.map((book, index) => (
                  <div key={book?.id ?? `empty-slot-${index}`} className="flex min-h-0 items-start justify-center">
                    {book ? (
                      <button
                        type="button"
                        aria-label={book.title}
                        onClick={() => onOpenBook(book.id)}
                        className="group relative h-full max-h-full aspect-[3/4.25] overflow-hidden rounded-[20px_12px_12px_20px] bg-[#243137] shadow-[0_25px_35px_rgba(24,32,39,0.18)] transition-[transform,box-shadow,filter] duration-500 [transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)] hover:[transform:perspective(1200px)_rotateY(-14deg)_rotateX(5deg)_translateY(-8px)] hover:shadow-[0_32px_48px_rgba(24,32,39,0.22)] hover:saturate-110"
                      >
                        {book.cover ? <img src={book.cover} alt={book.title} className="absolute inset-0 h-full w-full object-cover" /> : null}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,25,30,0.02)_0%,rgba(8,10,12,0.32)_100%)]" />
                        <div className="absolute inset-y-0 left-0 w-[10px] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(0,0,0,0.2))]" />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(5,7,9,0.22)_100%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                      </button>
                    ) : (
                      <div className="h-full max-h-full aspect-[3/4.25] rounded-[20px_12px_12px_20px] border border-dashed border-[rgba(189,159,103,0.16)] bg-[rgba(255,255,255,0.18)]" />
                    )}
                  </div>
                ))}
              </div>

              <div className="pointer-events-none mx-auto mt-3 h-6 w-[74%] rounded-full bg-[radial-gradient(circle,rgba(36,49,55,0.16)_0%,rgba(36,49,55,0.02)_72%,transparent_100%)] blur-2xl" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// 写作区首页书架。
