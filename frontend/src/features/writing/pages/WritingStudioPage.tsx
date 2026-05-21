import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  fetchWritingBookTree,
  fetchWritingChapter,
  type UpdateWritingBookInput,
  type UpdateWritingChapterInput,
  useCreateWritingBookMutation,
  useCreateWritingChapterMutation,
  useCreateWritingVolumeMutation,
  useDeleteWritingChapterMutation,
  useDeleteWritingVolumeMutation,
  useUpdateWritingBookMutation,
  useUpdateWritingChapterMutation,
  useUpdateWritingVolumeMutation,
  writingBookTreeQueryKey,
  useWritingBooksQuery,
  writingChapterQueryKey,
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

type WritingSnapshot = {
  books: WritingBook[]
  activeBookId: string
  activeVolumeId: string
  activeChapterId: string
  expandedVolumeIds: string[]
  isLibraryView: boolean
}

function mergeWritingBooks(incomingBooks: WritingBook[], currentBooks: WritingBook[]) {
  return incomingBooks.map((incomingBook) => {
    const currentBook = currentBooks.find((book) => book.id === incomingBook.id)
    if (!currentBook) return incomingBook

    return {
      ...incomingBook,
      volumes: incomingBook.volumes.length === 0 && currentBook.volumes.length > 0 ? currentBook.volumes : incomingBook.volumes.map((incomingVolume) => {
        const currentVolume = currentBook.volumes.find((volume) => volume.id === incomingVolume.id)
        if (!currentVolume) return incomingVolume

        return {
          ...incomingVolume,
          chapters: incomingVolume.chapters.map((incomingChapter) => {
            const currentChapter = currentVolume.chapters.find((chapter) => chapter.id === incomingChapter.id)
            return currentChapter?.detailLoaded
              ? {
                  ...incomingChapter,
                  content: currentChapter.content,
                  sceneNotes: currentChapter.sceneNotes,
                  prompt: currentChapter.prompt,
                  characters: currentChapter.characters,
                  reviewChecklist: currentChapter.reviewChecklist,
                  nextActions: currentChapter.nextActions,
                  detailLoaded: true,
                }
              : incomingChapter
          }),
        }
      }),
    }
  })
}

function mergeWritingBookTree(incomingBook: WritingBook, currentBook?: WritingBook) {
  const volumeCount = incomingBook.volumes.length
  const chapterCount = incomingBook.volumes.reduce((count, volume) => count + volume.chapters.length, 0)

  if (!currentBook) {
    return {
      ...incomingBook,
      volumeCount,
      chapterCount,
    }
  }

  return {
    ...incomingBook,
    volumeCount,
    chapterCount,
    volumes: incomingBook.volumes.map((incomingVolume) => {
      const currentVolume = currentBook.volumes.find((volume) => volume.id === incomingVolume.id)
      if (!currentVolume) return incomingVolume

      return {
        ...incomingVolume,
        chapters: incomingVolume.chapters.map((incomingChapter) => {
          const currentChapter = currentVolume.chapters.find((chapter) => chapter.id === incomingChapter.id)
          if (!currentChapter?.detailLoaded) return incomingChapter

          return {
            ...incomingChapter,
            content: currentChapter.content,
            sceneNotes: currentChapter.sceneNotes,
            prompt: currentChapter.prompt,
            characters: currentChapter.characters,
            reviewChecklist: currentChapter.reviewChecklist,
            nextActions: currentChapter.nextActions,
            detailLoaded: true,
          }
        }),
      }
    }),
  }
}

function withWritingCounts(book: WritingBook): WritingBook {
  return {
    ...book,
    volumeCount: book.volumes.length,
    chapterCount: book.volumes.reduce((count, volume) => count + volume.chapters.length, 0),
  }
}

export function WritingStudioPage() {
  const queryClient = useQueryClient()
  const booksQuery = useWritingBooksQuery()
  const createBookMutation = useCreateWritingBookMutation()
  const updateBookMutation = useUpdateWritingBookMutation()
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
  const [loadingChapterId, setLoadingChapterId] = useState('')

  const hydratedRef = useRef(false)
  const chapterTimersRef = useRef<Record<string, number>>({})
  const toastTimerRef = useRef<number | null>(null)
  const pendingChapterPatchesRef = useRef<Record<string, UpdateWritingChapterInput>>({})
  const pendingChapterSnapshotsRef = useRef<Record<string, WritingSnapshot>>({})

  useEffect(() => {
    if (booksQuery.data === undefined) return

    setBooks((current) => mergeWritingBooks(booksQuery.data, current))
    setActiveBookId((current) => {
      if (booksQuery.data.length === 0) return ''
      return booksQuery.data.some((book) => book.id === current) ? current : booksQuery.data[0].id
    })
    hydratedRef.current = true
  }, [booksQuery.data])

  useEffect(() => {
    return () => {
      Object.values(chapterTimersRef.current).forEach((timer) => window.clearTimeout(timer))
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
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
      const next = updater(current).map(withWritingCounts)
      queryClient.setQueryData(writingBooksQueryKey, next)
      return next
    })
  }

  function createSnapshot(): WritingSnapshot {
    return {
      books,
      activeBookId,
      activeVolumeId,
      activeChapterId,
      expandedVolumeIds,
      isLibraryView,
    }
  }

  function restoreSnapshot(snapshot: WritingSnapshot) {
    setBooks(snapshot.books)
    queryClient.setQueryData(writingBooksQueryKey, snapshot.books)
    setActiveBookId(snapshot.activeBookId)
    setActiveVolumeId(snapshot.activeVolumeId)
    setActiveChapterId(snapshot.activeChapterId)
    setExpandedVolumeIds(snapshot.expandedVolumeIds)
    setIsLibraryView(snapshot.isLibraryView)
  }

  function showSyncFailure() {
    setErrorMessage('操作失败，网络异常')
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setErrorMessage('')
      toastTimerRef.current = null
    }, 2600)
  }

  function rollbackMutation(snapshot: WritingSnapshot) {
    restoreSnapshot(snapshot)
    showSyncFailure()
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
    console.error(error)
    showSyncFailure()
  }

  function queueChapterPatch(chapterId: string, patch: UpdateWritingChapterInput, snapshot: WritingSnapshot) {
    pendingChapterSnapshotsRef.current[chapterId] = pendingChapterSnapshotsRef.current[chapterId] ?? snapshot
    pendingChapterPatchesRef.current[chapterId] = {
      ...pendingChapterPatchesRef.current[chapterId],
      ...patch,
    }

    if (chapterTimersRef.current[chapterId]) {
      window.clearTimeout(chapterTimersRef.current[chapterId])
    }

    chapterTimersRef.current[chapterId] = window.setTimeout(() => {
      const payload = pendingChapterPatchesRef.current[chapterId]
      const rollbackSnapshot = pendingChapterSnapshotsRef.current[chapterId]
      delete pendingChapterPatchesRef.current[chapterId]
      delete pendingChapterSnapshotsRef.current[chapterId]
      delete chapterTimersRef.current[chapterId]

      updateChapterMutation.mutate(
        { id: chapterId, payload },
        {
          onError: () => {
            if (rollbackSnapshot) rollbackMutation(rollbackSnapshot)
            else showSyncFailure()
          },
        }
      )
    }, 500)
  }

  async function ensureBookTree(bookId: string) {
    const book = books.find((item) => item.id === bookId)
    const needsTree = !book || book.volumes.length === 0
    if (!needsTree) return book

    const tree = await refreshBookTree(bookId)
    return tree
  }

  async function refreshBookTree(bookId: string) {
    const tree = await queryClient.fetchQuery({
      queryKey: writingBookTreeQueryKey(bookId),
      queryFn: () => fetchWritingBookTree(bookId),
    })
    const mergedTree = mergeWritingBookTree(tree, books.find((item) => item.id === bookId))

    applyBooks((current) => {
      if (!current.some((item) => item.id === bookId)) return [...current, mergedTree]
      return current.map((item) => (item.id === bookId ? mergeWritingBookTree(tree, item) : item))
    })

    return mergedTree
  }

  async function refreshWritingBooksList() {
    await booksQuery.refetch()
  }

  async function ensureChapterDetail(bookId: string, volumeId: string, chapterId: string) {
    const chapter = books
      .find((book) => book.id === bookId)
      ?.volumes.find((volume) => volume.id === volumeId)
      ?.chapters.find((item) => item.id === chapterId)

    if (chapter?.detailLoaded) return

    setLoadingChapterId(chapterId)
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: writingChapterQueryKey(chapterId),
        queryFn: () => fetchWritingChapter(chapterId),
      })
      updateChapter(bookId, volumeId, chapterId, () => detail)
    } finally {
      setLoadingChapterId((current) => (current === chapterId ? '' : current))
    }
  }

  async function openBook(bookId: string, volumeId?: string, chapterId?: string) {
    const nextBook = books.find((book) => book.id === bookId)
    if (!nextBook) return

    try {
      const tree = await ensureBookTree(bookId)
      const nextVolumeId = volumeId ?? tree?.volumes[0]?.id ?? ''
      const nextChapterId = chapterId ?? ''

      setIsLibraryView(false)
      setActiveBookId(bookId)
      setActiveVolumeId(nextVolumeId)
      setActiveChapterId(nextChapterId)

      if (nextVolumeId) {
        setExpandedVolumeIds((current) => (current.includes(nextVolumeId) ? current : [...current, nextVolumeId]))
      }

      if (nextVolumeId && nextChapterId) {
        await ensureChapterDetail(bookId, nextVolumeId, nextChapterId)
      }
    } catch (error) {
      handleMutationError(error)
    }
  }

  function backToLibrary() {
    setIsLibraryView(true)
    setActiveVolumeId('')
    setActiveChapterId('')
  }

  function saveBook(bookId: string, payload: UpdateWritingBookInput) {
    const snapshot = createSnapshot()

    updateBook(bookId, (book) => ({
      ...book,
      title: payload.title ?? book.title,
      description: payload.description ?? book.description,
      cover: payload.cover === undefined ? book.cover : payload.cover ?? undefined,
      penName: payload.penName ?? book.penName,
      style: payload.style ?? book.style,
      styleNote: payload.styleNote ?? book.styleNote,
    }))

    updateBookMutation.mutate(
      { id: bookId, payload },
      {
        onError: () => rollbackMutation(snapshot),
      }
    )
  }

  function createBook(payload: { title: string; description?: string; cover?: string }) {
    const snapshot = createSnapshot()
    const nextBook = withWritingCounts(createDraftBook(payload))
    const firstVolume = nextBook.volumes[0]
    const firstChapter = firstVolume.chapters[0]

    applyBooks((current) => [nextBook, ...current])
    setActiveBookId(nextBook.id)
    setActiveVolumeId(firstVolume.id)
    setActiveChapterId('')
    setExpandedVolumeIds((current) => (current.includes(firstVolume.id) ? current : [firstVolume.id, ...current]))
    setIsLibraryView(false)
    setIsCreateBookOpen(false)

    createBookMutation.mutate(
      {
        id: nextBook.id,
        title: nextBook.title,
        description: nextBook.description,
        cover: nextBook.cover,
        penName: nextBook.penName,
        style: nextBook.style,
        styleNote: nextBook.styleNote,
        defaultVolume: {
          id: firstVolume.id,
          title: firstVolume.title,
          description: firstVolume.description,
          marked: firstVolume.marked,
          defaultChapter: {
            id: firstChapter.id,
            title: firstChapter.title,
            summary: firstChapter.summary,
            content: firstChapter.content,
            sceneNotes: firstChapter.sceneNotes,
            prompt: firstChapter.prompt,
            characters: firstChapter.characters,
            reviewChecklist: firstChapter.reviewChecklist,
            nextActions: firstChapter.nextActions,
            updatedAt: firstChapter.updatedAt,
            marked: firstChapter.marked,
          },
        },
      },
      {
        onError: () => rollbackMutation(snapshot),
      }
    )
  }

  function addVolume(bookId: string) {
    const book = books.find((item) => item.id === bookId)
    if (!book) return undefined

    const snapshot = createSnapshot()
    const nextVolume = {
      ...createDraftVolume(book.volumes.length + 1),
      chapters: [],
    }

    updateBook(bookId, (currentBook) => ({
      ...currentBook,
      volumes: [...currentBook.volumes, nextVolume],
    }))
    setExpandedVolumeIds((current) => (current.includes(nextVolume.id) ? current : [...current, nextVolume.id]))
    setActiveBookId(bookId)
    setActiveVolumeId(nextVolume.id)
    setActiveChapterId('')
    setIsLibraryView(false)

    createVolumeMutation.mutate(
      {
        id: nextVolume.id,
        bookId,
        title: nextVolume.title,
        description: nextVolume.description,
        marked: nextVolume.marked,
      },
      {
        onError: () => rollbackMutation(snapshot),
      }
    )

    return nextVolume
  }

  function addChapter(bookId: string, volumeId: string) {
    const volume = books.find((book) => book.id === bookId)?.volumes.find((item) => item.id === volumeId)
    if (!volume) return

    const snapshot = createSnapshot()
    const nextChapter = createDraftChapter(volume.chapters.length + 1)

    updateVolume(bookId, volumeId, (currentVolume) => ({
      ...currentVolume,
      chapters: [...currentVolume.chapters, nextChapter],
    }))
    setExpandedVolumeIds((current) => (current.includes(volumeId) ? current : [...current, volumeId]))
    setActiveBookId(bookId)
    setActiveVolumeId(volumeId)
    setActiveChapterId(nextChapter.id)
    setIsLibraryView(false)

    createChapterMutation.mutate(
      {
        id: nextChapter.id,
        volumeId,
        title: nextChapter.title,
        summary: nextChapter.summary,
        content: nextChapter.content,
        sceneNotes: nextChapter.sceneNotes,
        prompt: nextChapter.prompt,
        characters: nextChapter.characters,
        reviewChecklist: nextChapter.reviewChecklist,
        nextActions: nextChapter.nextActions,
        updatedAt: nextChapter.updatedAt,
        marked: nextChapter.marked,
      },
      {
        onError: () => rollbackMutation(snapshot),
      }
    )
  }

  function deleteVolume(bookId: string, volumeId: string) {
    const book = books.find((item) => item.id === bookId)
    if (!book) return

    const snapshot = createSnapshot()
    const volumeIndex = book.volumes.findIndex((volume) => volume.id === volumeId)
    const nextVolumes = book.volumes.filter((volume) => volume.id !== volumeId)
    const fallbackVolume = nextVolumes[Math.max(0, volumeIndex - 1)] ?? nextVolumes[0]

    updateBook(bookId, (currentBook) => ({
      ...currentBook,
      volumes: currentBook.volumes.filter((volume) => volume.id !== volumeId),
    }))
    setExpandedVolumeIds((current) => current.filter((id) => id !== volumeId))
    if (activeVolumeId === volumeId) {
      setActiveBookId(bookId)
      setActiveVolumeId(fallbackVolume?.id ?? '')
      setActiveChapterId('')
    }

    deleteVolumeMutation.mutate(
      { id: volumeId },
      {
        onError: () => rollbackMutation(snapshot),
      }
    )
  }

  function deleteChapter(bookId: string, volumeId: string, chapterId: string) {
    const volume = books.find((book) => book.id === bookId)?.volumes.find((item) => item.id === volumeId)
    if (!volume) return

    const snapshot = createSnapshot()
    const chapterIndex = volume.chapters.findIndex((chapter) => chapter.id === chapterId)
    const nextChapters = volume.chapters.filter((chapter) => chapter.id !== chapterId)
    const fallbackChapter = nextChapters[Math.max(0, chapterIndex - 1)] ?? nextChapters[0]

    updateVolume(bookId, volumeId, (currentVolume) => ({
      ...currentVolume,
      chapters: currentVolume.chapters.filter((chapter) => chapter.id !== chapterId),
    }))
    if (activeChapterId === chapterId) {
      setActiveBookId(bookId)
      setActiveVolumeId(volumeId)
      setActiveChapterId(fallbackChapter?.id ?? '')
    }

    deleteChapterMutation.mutate(
      { id: chapterId },
      {
        onError: () => rollbackMutation(snapshot),
      }
    )
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
          onRenameVolume={(bookId, volumeId, title, description) => {
            const snapshot = createSnapshot()
            updateVolume(bookId, volumeId, (volume) => ({ ...volume, title, description }))
            updateVolumeMutation.mutate(
              { id: volumeId, payload: { title, description } },
              {
                onError: () => rollbackMutation(snapshot),
              }
            )
          }}
          onDeleteVolume={deleteVolume}
          onToggleVolumeMarked={(bookId, volumeId) => {
            const snapshot = createSnapshot()
            const currentMarked =
              books.find((book) => book.id === bookId)?.volumes.find((volume) => volume.id === volumeId)?.marked ?? false
            const marked = !currentMarked

            updateVolume(bookId, volumeId, (volume) => ({ ...volume, marked }))
            updateVolumeMutation.mutate(
              { id: volumeId, payload: { marked } },
              {
                onError: () => rollbackMutation(snapshot),
              }
            )
          }}
          onAddChapter={addChapter}
          onRenameChapter={(bookId, volumeId, chapterId, title) => {
            const snapshot = createSnapshot()
            const updatedAt = createTimestampLabel()
            updateChapter(bookId, volumeId, chapterId, (chapter) => ({ ...chapter, title, updatedAt }))
            queueChapterPatch(chapterId, { title, updatedAt }, snapshot)
          }}
          onDeleteChapter={deleteChapter}
          onToggleChapterMarked={(bookId, volumeId, chapterId) => {
            const snapshot = createSnapshot()
            const currentMarked =
              books
                .find((book) => book.id === bookId)
                ?.volumes.find((volume) => volume.id === volumeId)
                ?.chapters.find((chapter) => chapter.id === chapterId)?.marked ?? false
            const marked = !currentMarked
            const updatedAt = createTimestampLabel()

            updateChapter(bookId, volumeId, chapterId, (chapter) => ({ ...chapter, marked, updatedAt }))
            queueChapterPatch(chapterId, { marked, updatedAt }, snapshot)
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
                isLoading={loadingChapterId === activeChapter.id}
                onTabChange={setActiveTab}
                onTitleChange={(value) => {
                  const snapshot = createSnapshot()
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, title: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { title: value, updatedAt }, snapshot)
                }}
                onContentChange={(value) => {
                  const snapshot = createSnapshot()
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, content: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { content: value, updatedAt }, snapshot)
                }}
                onPromptChange={(value) => {
                  const snapshot = createSnapshot()
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, prompt: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { prompt: value, updatedAt }, snapshot)
                }}
                onSceneNoteChange={(index, value) => {
                  const snapshot = createSnapshot()
                  const nextSceneNotes = activeChapter.sceneNotes.map((note, noteIndex) => (noteIndex === index ? value : note))
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    sceneNotes: nextSceneNotes,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { sceneNotes: nextSceneNotes, updatedAt }, snapshot)
                }}
                onAddSceneNote={() => {
                  const snapshot = createSnapshot()
                  const nextSceneNotes = [...activeChapter.sceneNotes, '新的场景备注...']
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    sceneNotes: nextSceneNotes,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { sceneNotes: nextSceneNotes, updatedAt }, snapshot)
                }}
                onCharacterChange={(id, field, value) => {
                  const snapshot = createSnapshot()
                  const nextCharacters = activeChapter.characters.map((character) =>
                    character.id === id ? { ...character, [field]: value } : character
                  )
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    characters: nextCharacters,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { characters: nextCharacters, updatedAt }, snapshot)
                }}
                onAddCharacter={() => {
                  const snapshot = createSnapshot()
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
                  queueChapterPatch(activeChapter.id, { characters: nextCharacters, updatedAt }, snapshot)
                }}
              />

              <WritingInspector
                chapter={activeChapter}
                wordCount={wordCount}
                isLoading={loadingChapterId === activeChapter.id}
                onSummaryChange={(value) => {
                  const snapshot = createSnapshot()
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({ ...chapter, summary: value, updatedAt }))
                  queueChapterPatch(activeChapter.id, { summary: value, updatedAt }, snapshot)
                }}
                onReviewChecklistChange={(reviewChecklist) => {
                  const snapshot = createSnapshot()
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    reviewChecklist,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { reviewChecklist, updatedAt }, snapshot)
                }}
                onNextActionsChange={(nextActions) => {
                  const snapshot = createSnapshot()
                  const updatedAt = createTimestampLabel()
                  updateChapter(activeBook.id, activeVolume.id, activeChapter.id, (chapter) => ({
                    ...chapter,
                    nextActions,
                    updatedAt,
                  }))
                  queueChapterPatch(activeChapter.id, { nextActions, updatedAt }, snapshot)
                }}
              />
            </>
          ) : isVolumeView && activeBook && activeVolume ? (
            <>
              <WritingVolumePlaceholder
                bookTitle={activeBook.title}
                volume={activeVolume}
                onOpenChapter={(chapterId) => openBook(activeBook.id, activeVolume.id, chapterId)}
                onAddChapter={() => addChapter(activeBook.id, activeVolume.id)}
              />
              <WritingVolumeInspector
                volume={activeVolume}
                onSave={(payload) => {
                  const snapshot = createSnapshot()
                  updateVolume(activeBook.id, activeVolume.id, (volume) => ({
                    ...volume,
                    description: payload.description ?? volume.description,
                    title: payload.title ?? volume.title,
                    marked: payload.marked ?? volume.marked,
                  }))
                  updateVolumeMutation.mutate(
                    { id: activeVolume.id, payload },
                    {
                      onError: () => rollbackMutation(snapshot),
                    }
                  )
                }}
                onToggleMarked={() => {
                  const snapshot = createSnapshot()
                  const marked = !activeVolume.marked
                  updateVolume(activeBook.id, activeVolume.id, (volume) => ({ ...volume, marked }))
                  updateVolumeMutation.mutate(
                    { id: activeVolume.id, payload: { marked } },
                    {
                      onError: () => rollbackMutation(snapshot),
                    }
                  )
                }}
              />
            </>
          ) : (
            <>
              <WritingShelf books={books} onOpenBook={(bookId) => openBook(bookId)} />
              <WritingAuthorPanel
                book={activeBook}
                worksCount={booksCount}
                onSave={(payload) => saveBook(activeBook.id, payload)}
              />
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

// 写作工作台页面，接入真实后端 CRUD 与书本资料保存。
