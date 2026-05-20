import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  type UpdateWritingChapterInput,
  useCreateWritingBookMutation,
  useCreateWritingChapterMutation,
  useCreateWritingVolumeMutation,
  useDeleteWritingChapterMutation,
  useDeleteWritingVolumeMutation,
  useUpdateWritingChapterMutation,
  useUpdateWritingVolumeMutation,
  useWritingBooksQuery,
  writingBooksQueryKey,
} from '../api'
import { CreateBookDialog } from '../components/CreateBookDialog'
import { WritingAuthorPanel } from '../components/WritingAuthorPanel'
import { WritingCanvas } from '../components/WritingCanvas'
import { WritingInspector } from '../components/WritingInspector'
import { WritingShelf } from '../components/WritingShelf'
import { WritingSidebar } from '../components/WritingSidebar'
import { WritingVolumeInspector } from '../components/WritingVolumeInspector'
import { WritingVolumePlaceholder } from '../components/WritingVolumePlaceholder'
import type { WritingBook, WritingChapter, WritingTabId, WritingVolume } from '../types'
import { countWritingWords, createDraftBook, createDraftChapter, createDraftVolume, createTimestampLabel } from '../utils'

export function WritingStudioPage() {
  const queryClient = useQueryClient()
  const booksQuery = useWritingBooksQuery()
  const createBookMutation = useCreateWritingBookMutation()
  const createVolumeMutation = useCreateWritingVolumeMutation()
  const updateVolumeMutation = useUpdateWritingVolumeMutation()
  const deleteVolumeMutation = useDeleteWritingVolumeMutation()
  const createChapterMutation = useCreateWritingChapterMutation()
  const updateChapterMutation = useUpdateWritingChapterMutation()
  const deleteChapterMutation = useDeleteWritingChapterMutation()

  const [books, setBooks] = useState<WritingBook[]>([])
  const [search, setSearch] = useState('')
  const [expandedVolumeIds, setExpandedVolumeIds] = useState<string[]>([])
  const [activeBookId, setActiveBookId] = useState('')
  const [activeVolumeId, setActiveVolumeId] = useState('')
  const [activeChapterId, setActiveChapterId] = useState('')
  const [activeTab, setActiveTab] = useState<WritingTabId>('original')
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false)
  const [isLibraryView, setIsLibraryView] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const hydratedRef = useRef(false)
  const chapterTimersRef = useRef<Record<string, number>>({})
  const pendingChapterPatchesRef = useRef<Record<string, UpdateWritingChapterInput>>({})

  useEffect(() => {
    if (booksQuery.data === undefined) return

    setBooks(booksQuery.data)
    setExpandedVolumeIds((current) =>
      current.filter((id) => booksQuery.data.some((book) => book.volumes.some((volume) => volume.id === id)))
    )
    setActiveBookId((current) => {
      if (booksQuery.data.length === 0) return ''
      return booksQuery.data.some((book) => book.id === current) ? current : booksQuery.data[0].id
    })
    hydratedRef.current = true
  }, [booksQuery.data])

  useEffect(() => {
    return () => {
      Object.values(chapterTimersRef.current).forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    if (books.length === 0) {
      setActiveBookId('')
      setActiveVolumeId('')
      setActiveChapterId('')
      return
    }

    const nextActiveBook = books.find((book) => book.id === activeBookId) ?? books[0]
    if (nextActiveBook.id !== activeBookId) setActiveBookId(nextActiveBook.id)

    if (!activeVolumeId) return

    const nextActiveVolume = nextActiveBook.volumes.find((volume) => volume.id === activeVolumeId)
    if (!nextActiveVolume) {
      setActiveVolumeId('')
      setActiveChapterId('')
      return
    }

    if (!activeChapterId) return

    const nextActiveChapter = nextActiveVolume.chapters.find((chapter) => chapter.id === activeChapterId)
    if (!nextActiveChapter) setActiveChapterId('')
  }, [activeBookId, activeChapterId, activeVolumeId, books])

  const activeBook = books.find((book) => book.id === activeBookId) ?? books[0]
  const activeVolume = activeBook?.volumes.find((volume) => volume.id === activeVolumeId)
  const activeChapter = activeVolume?.chapters.find((chapter) => chapter.id === activeChapterId)
  const insideBook = !isLibraryView && Boolean(activeBook)
  const isChapterView = insideBook && Boolean(activeVolume) && Boolean(activeChapter)
  const isVolumeView = insideBook && Boolean(activeVolume) && !activeChapter
  const wordCount = activeChapter ? countWritingWords(`${activeChapter.title}${activeChapter.content}`) : 0
  const booksCount = useMemo(() => books.length, [books])

  function applyBooks(updater: (current: WritingBook[]) => WritingBook[]) {
    setBooks((current) => {
      const next = updater(current)
      queryClient.setQueryData(writingBooksQueryKey, next)
      return next
    })
  }

  function updateBook(bookId: string, updater: (book: WritingBook) => WritingBook) {
    applyBooks((current) => current.map((book) => (book.id === bookId ? updater(book) : book)))
  }

  function updateVolume(bookId: string, volumeId: string, updater: (volume: WritingVolume) => WritingVolume) {
    updateBook(bookId, (book) => ({
      ...book,
      volumes: book.volumes.map((volume) => (volume.id === volumeId ? updater(volume) : volume)),
    }))
  }

  function updateChapter(
    bookId: string,
    volumeId: string,
    chapterId: string,
    updater: (chapter: WritingChapter) => WritingChapter
  ) {
    updateVolume(bookId, volumeId, (volume) => ({
      ...volume,
      chapters: volume.chapters.map((chapter) => (chapter.id === chapterId ? updater(chapter) : chapter)),
    }))
  }

  function handleMutationError(error: unknown) {
    setErrorMessage((error as Error).message || '写作数据同步失败。')
    void booksQuery.refetch()
  }

  function queueChapterPatch(chapterId: string, patch: UpdateWritingChapterInput) {
    pendingChapterPatchesRef.current[chapterId] = {
      ...pendingChapterPatchesRef.current[chapterId],
      ...patch,
    }

    if (chapterTimersRef.current[chapterId]) {
      window.clearTimeout(chapterTimersRef.current[chapterId])
    }

    chapterTimersRef.current[chapterId] = window.setTimeout(() => {
      const payload = pendingChapterPatchesRef.current[chapterId]
      delete pendingChapterPatchesRef.current[chapterId]
      delete chapterTimersRef.current[chapterId]

      updateChapterMutation.mutate(
        { id: chapterId, payload },
        {
          onError: handleMutationError,
        }
      )
    }, 500)
  }

  function openBook(bookId: string, volumeId?: string, chapterId?: string) {
    const nextBook = books.find((book) => book.id === bookId)
    if (!nextBook) return

    setIsLibraryView(false)
    setActiveBookId(nextBook.id)
    setActiveVolumeId(volumeId ?? nextBook.volumes[0]?.id ?? '')
    setActiveChapterId(chapterId ?? '')

    if (volumeId) {
      setExpandedVolumeIds((current) => (current.includes(volumeId) ? current : [...current, volumeId]))
    }
  }

  function backToLibrary() {
    setIsLibraryView(true)
    setActiveVolumeId('')
    setActiveChapterId('')
  }

  async function createBook(payload: { title: string; description?: string; cover?: string }) {
    const nextBook = createDraftBook(payload)
    const firstVolume = nextBook.volumes[0]
    const firstChapter = firstVolume.chapters[0]

    setErrorMessage('')

    try {
      await createBookMutation.mutateAsync({
        id: nextBook.id,
        title: nextBook.title,
        description: nextBook.description,
        cover: nextBook.cover,
        penName: nextBook.penName,
        style: nextBook.style,
        styleNote: nextBook.styleNote,
      })

      await createVolumeMutation.mutateAsync({
        id: firstVolume.id,
        bookId: nextBook.id,
        title: firstVolume.title,
        description: firstVolume.description,
        marked: firstVolume.marked,
      })

      await createChapterMutation.mutateAsync({
        id: firstChapter.id,
        volumeId: firstVolume.id,
        title: firstChapter.title,
        summary: firstChapter.summary,
        content: firstChapter.content,
        sceneNotes: firstChapter.sceneNotes,
        prompt: firstChapter.prompt,
        characters: firstChapter.characters,
        updatedAt: firstChapter.updatedAt,
        marked: firstChapter.marked,
      })

      applyBooks((current) => [nextBook, ...current])
      setActiveBookId(nextBook.id)
      setActiveVolumeId(firstVolume.id)
      setActiveChapterId('')
      setExpandedVolumeIds((current) => (current.includes(firstVolume.id) ? current : [firstVolume.id, ...current]))
      setIsLibraryView(false)
      setIsCreateBookOpen(false)
    } catch (error) {
      handleMutationError(error)
    }
  }

  async function addVolume(bookId: string) {
    const book = books.find((item) => item.id === bookId)
    if (!book) return

    const nextVolume = createDraftVolume(book.volumes.length + 1)
    const firstChapter = nextVolume.chapters[0]
    setErrorMessage('')

    try {
      await createVolumeMutation.mutateAsync({
        id: nextVolume.id,
        bookId,
        title: nextVolume.title,
        description: nextVolume.description,
        marked: nextVolume.marked,
      })

      await createChapterMutation.mutateAsync({
        id: firstChapter.id,
        volumeId: nextVolume.id,
        title: firstChapter.title,
        summary: firstChapter.summary,
        content: firstChapter.content,
        sceneNotes: firstChapter.sceneNotes,
        prompt: firstChapter.prompt,
        characters: firstChapter.characters,
        updatedAt: firstChapter.updatedAt,
        marked: firstChapter.marked,
      })

      updateBook(bookId, (currentBook) => ({
        ...currentBook,
        volumes: [...currentBook.volumes, nextVolume],
      }))

      setExpandedVolumeIds((current) => (current.includes(nextVolume.id) ? current : [...current, nextVolume.id]))
      setActiveBookId(bookId)
      setActiveVolumeId(nextVolume.id)
      setActiveChapterId('')
      setIsLibraryView(false)
    } catch (error) {
      handleMutationError(error)
    }
  }

  async function addChapter(bookId: string, volumeId: string) {
    const volume = books.find((book) => book.id === bookId)?.volumes.find((item) => item.id === volumeId)
    if (!volume) return

    const nextChapter = createDraftChapter(volume.chapters.length + 1)
    setErrorMessage('')

    try {
      await createChapterMutation.mutateAsync({
        id: nextChapter.id,
        volumeId,
        title: nextChapter.title,
        summary: nextChapter.summary,
        content: nextChapter.content,
        sceneNotes: nextChapter.sceneNotes,
        prompt: nextChapter.prompt,
        characters: nextChapter.characters,
        updatedAt: nextChapter.updatedAt,
        marked: nextChapter.marked,
      })

      updateVolume(bookId, volumeId, (currentVolume) => ({
        ...currentVolume,
        chapters: [...currentVolume.chapters, nextChapter],
      }))

      setExpandedVolumeIds((current) => (current.includes(volumeId) ? current : [...current, volumeId]))
      setActiveBookId(bookId)
      setActiveVolumeId(volumeId)
      setActiveChapterId(nextChapter.id)
      setIsLibraryView(false)
    } catch (error) {
      handleMutationError(error)
    }
  }

  async function deleteVolume(bookId: string, volumeId: string) {
    const book = books.find((item) => item.id === bookId)
    if (!book) return

    setErrorMessage('')

    try {
      await deleteVolumeMutation.mutateAsync(volumeId)

      if (book.volumes.length === 1) {
        const replacement = createDraftVolume(1)
        const firstChapter = replacement.chapters[0]

        await createVolumeMutation.mutateAsync({
          id: replacement.id,
          bookId,
          title: replacement.title,
          description: replacement.description,
          marked: replacement.marked,
        })

        await createChapterMutation.mutateAsync({
          id: firstChapter.id,
          volumeId: replacement.id,
          title: firstChapter.title,
          summary: firstChapter.summary,
          content: firstChapter.content,
          sceneNotes: firstChapter.sceneNotes,
          prompt: firstChapter.prompt,
          characters: firstChapter.characters,
          updatedAt: firstChapter.updatedAt,
          marked: firstChapter.marked,
        })

        updateBook(bookId, (currentBook) => ({
          ...currentBook,
          volumes: [replacement],
        }))

        setExpandedVolumeIds([replacement.id])
        setActiveBookId(bookId)
        setActiveVolumeId(replacement.id)
        setActiveChapterId('')
        return
      }

      updateBook(bookId, (currentBook) => {
        const index = currentBook.volumes.findIndex((volume) => volume.id === volumeId)
        const nextVolumes = currentBook.volumes.filter((volume) => volume.id !== volumeId)
        const fallbackVolume = nextVolumes[Math.max(0, index - 1)] ?? nextVolumes[0]

        setExpandedVolumeIds((current) => current.filter((id) => id !== volumeId))
        if (activeVolumeId === volumeId) {
          setActiveBookId(bookId)
          setActiveVolumeId(fallbackVolume?.id ?? '')
          setActiveChapterId('')
        }

        return {
          ...currentBook,
          volumes: nextVolumes,
        }
      })
    } catch (error) {
      handleMutationError(error)
    }
  }

  async function deleteChapter(bookId: string, volumeId: string, chapterId: string) {
    const volume = books.find((book) => book.id === bookId)?.volumes.find((item) => item.id === volumeId)
    if (!volume) return

    setErrorMessage('')

    try {
      await deleteChapterMutation.mutateAsync(chapterId)

      if (volume.chapters.length === 1) {
        const replacement = createDraftChapter(1)

        await createChapterMutation.mutateAsync({
          id: replacement.id,
          volumeId,
          title: replacement.title,
          summary: replacement.summary,
          content: replacement.content,
          sceneNotes: replacement.sceneNotes,
          prompt: replacement.prompt,
          characters: replacement.characters,
          updatedAt: replacement.updatedAt,
          marked: replacement.marked,
        })

        updateVolume(bookId, volumeId, (currentVolume) => ({
          ...currentVolume,
          chapters: [replacement],
        }))

        setActiveBookId(bookId)
        setActiveVolumeId(volumeId)
        setActiveChapterId(replacement.id)
        return
      }

      updateVolume(bookId, volumeId, (currentVolume) => {
        const index = currentVolume.chapters.findIndex((chapter) => chapter.id === chapterId)
        const nextChapters = currentVolume.chapters.filter((chapter) => chapter.id !== chapterId)
        const fallbackChapter = nextChapters[Math.max(0, index - 1)] ?? nextChapters[0]

        if (activeChapterId === chapterId) {
          setActiveBookId(bookId)
          setActiveVolumeId(volumeId)
          setActiveChapterId(fallbackChapter?.id ?? '')
        }

        return {
          ...currentVolume,
          chapters: nextChapters,
        }
      })
    } catch (error) {
      handleMutationError(error)
    }
  }

  if (booksQuery.isLoading && !hydratedRef.current) {
    return <div className="flex h-full items-center justify-center bg-white text-sm text-gray-500">正在加载写作数据...</div>
  }

  if (booksQuery.isError && !hydratedRef.current) {
    return (
      <div className="flex h-full items-center justify-center bg-white px-6 text-center text-sm text-red-500">
        {(booksQuery.error as Error).message || '写作数据加载失败。'}
      </div>
    )
  }

  return (
    <>
      <div className="grid h-full min-h-0 bg-white [grid-template-columns:320px_minmax(0,1fr)]">
        <WritingSidebar
          books={books}
          expandedVolumeIds={expandedVolumeIds}
          activeBookId={activeBook?.id ?? ''}
          activeVolumeId={activeVolumeId}
          activeChapterId={activeChapterId}
          search={search}
          insideBook={insideBook}
          onSearchChange={setSearch}
          onOpenCreateBook={() => setIsCreateBookOpen(true)}
          onOpenBook={openBook}
          onBackToLibrary={backToLibrary}
          onToggleVolume={(volumeId) =>
            setExpandedVolumeIds((current) =>
              current.includes(volumeId) ? current.filter((id) => id !== volumeId) : [...current, volumeId]
            )
          }
          onAddVolume={addVolume}
          onRenameVolume={(bookId, volumeId, title) => {
            updateVolume(bookId, volumeId, (volume) => ({ ...volume, title }))
            updateVolumeMutation.mutate(
              { id: volumeId, payload: { title } },
              {
                onError: handleMutationError,
              }
            )
          }}
          onDeleteVolume={deleteVolume}
          onToggleVolumeMarked={(bookId, volumeId) => {
            const currentMarked =
              books.find((book) => book.id === bookId)?.volumes.find((volume) => volume.id === volumeId)?.marked ?? false
            const marked = !currentMarked

            updateVolume(bookId, volumeId, (volume) => ({ ...volume, marked }))
            updateVolumeMutation.mutate(
              { id: volumeId, payload: { marked } },
              {
                onError: handleMutationError,
              }
            )
          }}
          onAddChapter={addChapter}
          onRenameChapter={(bookId, volumeId, chapterId, title) => {
            const updatedAt = createTimestampLabel()
            updateChapter(bookId, volumeId, chapterId, (chapter) => ({ ...chapter, title, updatedAt }))
            queueChapterPatch(chapterId, { title, updatedAt })
          }}
          onDeleteChapter={deleteChapter}
          onToggleChapterMarked={(bookId, volumeId, chapterId) => {
            const currentMarked =
              books
                .find((book) => book.id === bookId)
                ?.volumes.find((volume) => volume.id === volumeId)
                ?.chapters.find((chapter) => chapter.id === chapterId)?.marked ?? false
            const marked = !currentMarked
            const updatedAt = createTimestampLabel()

            updateChapter(bookId, volumeId, chapterId, (chapter) => ({ ...chapter, marked, updatedAt }))
            queueChapterPatch(chapterId, { marked, updatedAt })
          }}
        />

        <div className="grid min-w-0 [grid-template-columns:minmax(0,1fr)_320px]">
          {isChapterView && activeBook && activeVolume && activeChapter ? (
            <>
              <WritingCanvas
                bookTitle={activeBook.title}
                volumeTitle={activeVolume.title}
                chapter={activeChapter}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onTitleChange={(value) => {
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, title: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { title: value, updatedAt })
                }}
                onContentChange={(value) => {
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, content: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { content: value, updatedAt })
                }}
                onPromptChange={(value) => {
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, prompt: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { prompt: value, updatedAt })
                }}
                onSceneNoteChange={(index, value) => {
                  const nextSceneNotes = activeChapter.sceneNotes.map((note, noteIndex) => (noteIndex === index ? value : note))
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    sceneNotes: nextSceneNotes,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { sceneNotes: nextSceneNotes, updatedAt })
                }}
                onAddSceneNote={() => {
                  const nextSceneNotes = [...activeChapter.sceneNotes, '新的场景备注...']
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    sceneNotes: nextSceneNotes,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { sceneNotes: nextSceneNotes, updatedAt })
                }}
                onCharacterChange={(id, field, value) => {
                  const nextCharacters = activeChapter.characters.map((character) =>
                    character.id === id ? { ...character, [field]: value } : character
                  )
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    characters: nextCharacters,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { characters: nextCharacters, updatedAt })
                }}
                onAddCharacter={() => {
                  const nextCharacters = [
                    ...activeChapter.characters,
                    {
                      id: `character-${Date.now()}`,
                      name: '新角色',
                      role: '待定',
                      note: '补充角色设定。',
                    },
                  ]
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    characters: nextCharacters,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { characters: nextCharacters, updatedAt })
                }}
              />

              <WritingInspector
                chapter={activeChapter}
                wordCount={wordCount}
                onSummaryChange={(value) => {
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, summary: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { summary: value, updatedAt })
                }}
              />
            </>
          ) : isVolumeView && activeBook && activeVolume ? (
            <>
              <WritingVolumePlaceholder bookTitle={activeBook.title} volume={activeVolume} />
              <WritingVolumeInspector volume={activeVolume} />
            </>
          ) : (
            <>
              <WritingShelf books={books} currentBook={activeBook} onOpenBook={(bookId) => openBook(bookId)} />
              <WritingAuthorPanel book={activeBook} worksCount={booksCount} />
            </>
          )}
        </div>
      </div>

      {errorMessage ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-[#1f1d1a] px-4 py-2 text-sm text-white shadow-lg">
          {errorMessage}
        </div>
      ) : null}

      <CreateBookDialog open={isCreateBookOpen} onClose={() => setIsCreateBookOpen(false)} onSubmit={createBook} />
    </>
  )
}

// 写作工作台页面，接入真实后端 CRUD 与本地编辑状态。
