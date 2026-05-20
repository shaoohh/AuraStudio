export type WritingTabId = 'original' | 'scene' | 'prompt' | 'characters'

export interface WritingCharacter {
  id: string
  name: string
  role: string
  note: string
}

export interface WritingChapter {
  id: string
  title: string
  summary: string
  content: string
  sceneNotes: string[]
  prompt: string
  characters: WritingCharacter[]
  updatedAt: string
  marked?: boolean
}

export interface WritingVolume {
  id: string
  title: string
  description: string
  chapters: WritingChapter[]
  marked?: boolean
}

export interface WritingBook {
  id: string
  title: string
  description: string
  cover?: string
  penName: string
  style: string
  styleNote: string
  volumes: WritingVolume[]
}

// 写作域类型定义。
