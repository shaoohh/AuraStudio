import type { WritingBook, WritingChapter, WritingVolume } from './types'

export const DEFAULT_BOOK_COVER =
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'

export function countWritingWords(text: string) {
  return text.replace(/\s+/g, '').length
}

export function compareWritingTitles<T extends { title: string }>(left: T, right: T) {
  const leftIndex = getTitleIndex(left.title)
  const rightIndex = getTitleIndex(right.title)
  if (leftIndex !== rightIndex) return leftIndex - rightIndex

  return left.title.localeCompare(right.title, 'zh-Hans-CN', { numeric: true })
}

function getTitleIndex(title: string) {
  const directNumber = title.match(/第\s*(\d+)\s*[卷章]/)
  if (directNumber) return Number(directNumber[1])

  const chineseNumber = title.match(/第\s*([零〇一二两三四五六七八九十]+)\s*[卷章]/)
  if (!chineseNumber) return Number.MAX_SAFE_INTEGER

  return parseChineseNumber(chineseNumber[1])
}

function parseChineseNumber(value: string) {
  const digits: Record<string, number> = {
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  }

  if (value === '十') return 10

  const [beforeTen, afterTen] = value.split('十')
  if (afterTen !== undefined) {
    const tens = beforeTen ? digits[beforeTen] ?? 0 : 1
    const ones = afterTen ? digits[afterTen] ?? 0 : 0
    return tens * 10 + ones
  }

  return digits[value] ?? Number.MAX_SAFE_INTEGER
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
    reviewChecklist: [
      { id: `review-${stamp}-1`, text: '这一章是否明确推进冲突', checked: false },
      { id: `review-${stamp}-2`, text: '场景切换是否足够顺滑', checked: false },
      { id: `review-${stamp}-3`, text: '角色动机是否有新的信息', checked: false },
      { id: `review-${stamp}-4`, text: '结尾是否留下继续阅读的牵引', checked: false },
    ],
    nextActions: ['补足关键冲突的压迫感', '检查本章结尾的牵引力'],
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
