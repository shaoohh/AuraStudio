import { useMemo, useState } from 'react'
import { ArrowLeft, BookMarked, BookOpen, ChevronDown, ChevronRight, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { WritingBook, WritingVolume } from '../types'
import { compareWritingTitles } from '../utils'
import { WritingActionMenu } from './WritingActionMenu'

interface WritingSidebarProps {
  books: WritingBook[]
  expandedVolumeIds: string[]
  activeBookId: string
  activeVolumeId: string
  activeChapterId: string
  search: string
  insideBook: boolean
  onSearchChange: (value: string) => void
  onOpenCreateBook: () => void
  onOpenBook: (bookId: string, volumeId?: string, chapterId?: string) => void
  onBackToLibrary: () => void
  onToggleVolume: (volumeId: string) => void
  onAddVolume: (bookId: string) => WritingVolume | undefined
  onRenameVolume: (bookId: string, volumeId: string, title: string, description: string) => void
  onDeleteVolume: (bookId: string, volumeId: string) => void
  onToggleVolumeMarked: (bookId: string, volumeId: string) => void
  onAddChapter: (bookId: string, volumeId: string) => void
  onRenameChapter: (bookId: string, volumeId: string, chapterId: string, title: string) => void
  onDeleteChapter: (bookId: string, volumeId: string, chapterId: string) => void
  onToggleChapterMarked: (bookId: string, volumeId: string, chapterId: string) => void
}

export function WritingSidebar({
  books,
  expandedVolumeIds,
  activeBookId,
  activeVolumeId,
  activeChapterId,
  search,
  insideBook,
  onSearchChange,
  onOpenCreateBook,
  onOpenBook,
  onBackToLibrary,
  onToggleVolume,
  onAddVolume,
  onRenameVolume,
  onDeleteVolume,
  onToggleVolumeMarked,
  onAddChapter,
  onRenameChapter,
  onDeleteChapter,
  onToggleChapterMarked,
}: WritingSidebarProps) {
  const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [volumeDraft, setVolumeDraft] = useState('')
  const [volumeDescriptionDraft, setVolumeDescriptionDraft] = useState('')
  const [chapterDraft, setChapterDraft] = useState('')

  const activeBook = books.find((book) => book.id === activeBookId) ?? books[0]

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return books

    return books.filter((book) =>
      [
        book.title,
        book.description,
        book.penName,
        ...book.volumes.map(
          (volume) =>
            `${volume.title} ${volume.description} ${volume.chapters.map((chapter) => `${chapter.title} ${chapter.summary}`).join(' ')}`
        ),
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    )
  }, [books, search])

  const filteredVolumes = useMemo(() => {
    if (!activeBook) return []

    const keyword = search.trim().toLowerCase()
    if (!keyword) {
      return [...activeBook.volumes].sort(compareWritingTitles).map((volume) => ({
        ...volume,
        chapters: [...volume.chapters].sort(compareWritingTitles),
      }))
    }

    return activeBook.volumes
      .map((volume) => {
        const orderedChapters = [...volume.chapters].sort(compareWritingTitles)
        const filteredChapters = orderedChapters.filter((chapter) =>
          [activeBook.title, volume.title, volume.description, chapter.title, chapter.summary].join(' ').toLowerCase().includes(keyword)
        )

        if (
          filteredChapters.length === 0 &&
          ![activeBook.title, volume.title, volume.description].join(' ').toLowerCase().includes(keyword)
        ) {
          return null
        }

        return {
          ...volume,
          chapters: filteredChapters.length > 0 ? filteredChapters : orderedChapters,
        }
      })
      .filter((volume): volume is WritingVolume => Boolean(volume))
      .sort(compareWritingTitles)
  }, [activeBook, search])

  const startVolumeEdit = (volumeId: string, title: string, description: string) => {
    setEditingChapterId(null)
    setEditingVolumeId(volumeId)
    setVolumeDraft(title)
    setVolumeDescriptionDraft(description)
  }

  const saveVolumeEdit = (bookId: string, volumeId: string) => {
    if (!volumeDraft.trim()) return

    onRenameVolume(bookId, volumeId, volumeDraft.trim(), volumeDescriptionDraft.trim() || '作者很懒')
    setEditingVolumeId(null)
  }

  const startChapterEdit = (chapterId: string, title: string) => {
    setEditingVolumeId(null)
    setEditingChapterId(chapterId)
    setChapterDraft(title)
  }

  return (
    <aside className="flex h-full flex-col border-r border-[#E5E4E7] bg-gray-50">
      <div className="border-b border-[#E5E4E7] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-medium tracking-[0.18em] text-[#a29a8d]">NOVEL</div>
            <div className="mt-1 text-[17px] font-semibold text-[#22201c]">{insideBook && activeBook ? activeBook.title : '写作工作台'}</div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-[10px] text-[#8f877a] hover:bg-white hover:text-[#1f1d1a]"
            onClick={onOpenCreateBook}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-b border-[#E5E4E7] px-5 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a59c8f]" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="搜索书本、卷册或章节"
            className="h-10 rounded-[12px] border-[#e7e1d6] bg-white pl-9 text-[13px] text-[#2f2a24] placeholder:text-[#a59c8f]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-[#E5E4E7] px-5 py-3 text-[12px] text-[#8f877a]">
        <div className="flex items-center gap-2">
          {insideBook ? <BookOpen className="h-3.5 w-3.5" /> : <BookMarked className="h-3.5 w-3.5" />}
          <span>{insideBook && activeBook ? activeBook.title : '作品目录'}</span>
        </div>

        {insideBook ? (
          <button
            type="button"
            onClick={onBackToLibrary}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f1ea] text-[#7f7669] transition-colors hover:bg-[#ece6da] hover:text-[#1f1d1a]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#1f1d1a] px-2 py-0.5 text-[11px] text-white">
            {filteredBooks.length}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {insideBook && activeBook ? (
          filteredVolumes.length === 0 ? (
            <EmptyState title="这本书里还没有内容" description="先加一个卷册，写作区就能继续往下走。" />
          ) : (
            <div className="space-y-3">
              {filteredVolumes.map((volume) => {
                const isExpanded = expandedVolumeIds.includes(volume.id)
                const isActiveVolume = volume.id === activeVolumeId

                return (
                  <div
                    key={volume.id}
                    className={[
                      'rounded-[18px] p-3 shadow-[0_0_0_1px_rgba(229,228,231,0.55)] transition-colors',
                      isActiveVolume ? 'bg-[#f6f1e7]' : 'bg-white/80',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleVolume(volume.id)}
                        className="mt-0.5 rounded-md p-1 text-[#a59c8f] transition-colors hover:bg-[#f7f4ee] hover:text-[#1f1d1a]"
                      >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        {editingVolumeId === volume.id ? (
                          <div className="space-y-2">
                            <Input
                              autoFocus
                              value={volumeDraft}
                              onChange={(event) => setVolumeDraft(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' && volumeDraft.trim()) saveVolumeEdit(activeBook.id, volume.id)
                                if (event.key === 'Escape') setEditingVolumeId(null)
                              }}
                              className="h-9 rounded-[12px] border-[#e7e1d6] bg-white text-[13px] text-[#1f1d1a]"
                            />
                            <textarea
                              value={volumeDescriptionDraft}
                              onChange={(event) => setVolumeDescriptionDraft(event.target.value)}
                              rows={3}
                              className="w-full resize-none rounded-[12px] border border-[#e7e1d6] bg-white px-3 py-2 text-[12px] leading-5 text-[#5f564a] outline-none transition-colors focus:border-[#BD9F67] focus:ring-1 focus:ring-[#BD9F67]"
                            />
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-[#e7e1d6] text-xs"
                                onClick={() => saveVolumeEdit(activeBook.id, volume.id)}
                              >
                                保存
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenBook(activeBook.id, volume.id)}
                              className="min-w-0 flex-1 rounded-[12px] px-1 py-1 text-left"
                            >
                              <div className={`truncate text-[13px] ${isActiveVolume ? 'font-semibold text-[#1f1d1a]' : 'text-[#3a342d]'}`}>
                                {volume.title}
                              </div>
                              <div className={`mt-1 text-[11px] leading-5 ${isActiveVolume ? 'text-[#73695c]' : 'text-[#8f877a]'}`}>
                                {volume.description}
                              </div>
                            </button>
                            <WritingActionMenu
                              type="volume"
                              marked={volume.marked}
                              onEdit={() => startVolumeEdit(volume.id, volume.title, volume.description)}
                              onDelete={() => onDeleteVolume(activeBook.id, volume.id)}
                              onAdd={() => onAddChapter(activeBook.id, volume.id)}
                              onToggleMark={() => onToggleVolumeMarked(activeBook.id, volume.id)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-3 space-y-2 border-l border-[#ece4d7] pl-3">
                        {volume.chapters.map((chapter) => {
                          const isActiveChapter = chapter.id === activeChapterId

                          return (
                            <div key={chapter.id} className={`flex items-start gap-2 rounded-[12px] px-3 py-2.5 ${isActiveChapter ? 'bg-[#f4efe4]' : 'hover:bg-[#f7f4ee]'}`}>
                              {editingChapterId === chapter.id ? (
                                <div className="min-w-0 flex-1 space-y-2">
                                  <Input
                                    autoFocus
                                    value={chapterDraft}
                                    onChange={(event) => setChapterDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter' && chapterDraft.trim()) {
                                        onRenameChapter(activeBook.id, volume.id, chapter.id, chapterDraft.trim())
                                        setEditingChapterId(null)
                                      }
                                      if (event.key === 'Escape') setEditingChapterId(null)
                                    }}
                                    className="h-9 rounded-[12px] border-[#e7e1d6] bg-white text-[13px] text-[#1f1d1a]"
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-xl border-[#e7e1d6] text-xs"
                                      onClick={() => {
                                        if (!chapterDraft.trim()) return
                                        onRenameChapter(activeBook.id, volume.id, chapter.id, chapterDraft.trim())
                                        setEditingChapterId(null)
                                      }}
                                    >
                                      保存
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button type="button" onClick={() => onOpenBook(activeBook.id, volume.id, chapter.id)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                                    <span className={`mt-[7px] h-1.5 w-1.5 rounded-full ${isActiveChapter ? 'bg-[#1f1d1a]' : 'bg-[#c7beb1]'}`} />
                                    <span className="min-w-0 flex-1">
                                      <span className={`block truncate text-[13px] ${isActiveChapter ? 'font-medium text-[#1f1d1a]' : 'text-[#5b544b]'}`}>{chapter.title}</span>
                                      <span className="mt-1 block truncate text-[11px] text-[#9a9388]">{chapter.summary}</span>
                                    </span>
                                  </button>
                                  <WritingActionMenu
                                    type="chapter"
                                    marked={chapter.marked}
                                    onEdit={() => startChapterEdit(chapter.id, chapter.title)}
                                    onDelete={() => onDeleteChapter(activeBook.id, volume.id, chapter.id)}
                                    onAdd={() => onAddChapter(activeBook.id, volume.id)}
                                    onToggleMark={() => onToggleChapterMarked(activeBook.id, volume.id, chapter.id)}
                                  />
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => {
                  const volume = onAddVolume(activeBook.id)
                  if (volume) startVolumeEdit(volume.id, volume.title, volume.description)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#d8cfbf] bg-white/70 px-4 py-3 text-[13px] font-medium text-[#7d7468] transition-colors hover:border-[#BD9F67] hover:bg-white hover:text-[#1f1d1a]"
              >
                <Plus className="h-4 w-4" />
                添加新卷册
              </button>
            </div>
          )
        ) : filteredBooks.length === 0 ? (
          <EmptyState title="还没有作品" description="先新建一本书，书架就会开始有东西了。" />
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => (
              <div key={book.id} className="rounded-[18px] bg-white/80 p-3 shadow-[0_0_0_1px_rgba(229,228,231,0.55)]">
                <button type="button" onClick={() => onOpenBook(book.id)} className="flex w-full items-start gap-3 text-left">
                  <div className="h-12 w-9 shrink-0 overflow-hidden rounded-[10px] border border-white/70 shadow-sm">
                    {book.cover ? <img src={book.cover} alt={book.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-[#3a342d]">{book.title}</span>
                    <span className="mt-1 block text-[11px] leading-5 text-[#8f877a]">{book.description}</span>
                  </span>
                  <span className="pt-1 text-[#b4ab9f]">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </button>
                <div className="mt-3 flex items-center justify-between border-t border-[#f0ebe2] pt-3 text-[11px] text-[#9a9388]">
                  <span>
                    {book.volumeCount ?? book.volumes.length} 卷 /{' '}
                    {book.chapterCount ?? book.volumes.reduce((count, volume) => count + volume.chapters.length, 0)} 章
                  </span>
                  <span>{book.penName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#ddd6c7] bg-white/70 px-4 py-6 text-center">
      <div className="text-sm font-medium text-[#3a342d]">{title}</div>
      <div className="mt-1 text-xs leading-5 text-[#8f877a]">{description}</div>
    </div>
  )
}

// 写作区左侧目录，承载书本列表和书内卷章列表。
