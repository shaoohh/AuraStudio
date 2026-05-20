import type { WritingBook, WritingChapter, WritingVolume } from './types'

export const DEFAULT_BOOK_COVER =
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'

export function countWritingWords(text: string) {
  return text.replace(/\s+/g, '').length
}

export function makeVolumeTitle(index: number) {
  return `第 ${index} 卷`
}

export function makeChapterTitle(index: number) {
  return `第 ${index} 章`
}

export function createTimestampLabel() {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  const hours = `${now.getHours()}`.padStart(2, '0')
  const minutes = `${now.getMinutes()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day} ${hours}:${minutes}`
}

export function createDraftChapter(index: number): WritingChapter {
  const stamp = Date.now()

  return {
    id: `chapter-${stamp}`,
    title: makeChapterTitle(index),
    summary: '新章节摘要待补充。',
    content: '',
    sceneNotes: ['新的场景备注...'],
    prompt: '在这里整理这一章的 AI Prompt。',
    characters: [
      {
        id: `character-${stamp}`,
        name: '新角色',
        role: '待定',
        note: '补充角色设定。',
      },
    ],
    updatedAt: createTimestampLabel(),
    marked: false,
  }
}

export function createDraftVolume(index: number): WritingVolume {
  return {
    id: `volume-${Date.now()}`,
    title: makeVolumeTitle(index),
    description: '作者很懒',
    chapters: [createDraftChapter(1)],
    marked: false,
  }
}

export function createDraftBook({
  title,
  description,
  cover,
}: {
  title: string
  description?: string
  cover?: string
}): WritingBook {
  const stamp = Date.now()
  const firstVolume = createDraftVolume(1)

  return {
    id: `book-${stamp}`,
    title,
    description: description?.trim() || '作者很懒',
    cover: cover?.trim() || DEFAULT_BOOK_COVER,
    penName: '未命名作者',
    style: '风格待分析',
    styleNote: '先把书本架子搭起来，后面再慢慢补作者画像。',
    volumes: [
      {
        ...firstVolume,
        id: `volume-${stamp}`,
      },
    ],
  }
}

// 写作域工具方法和草稿工厂。
