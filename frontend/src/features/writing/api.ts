import { useMutation, useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

import type { WritingBook, WritingChapter, WritingCharacter, WritingReviewChecklistItem } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const writingQueryKey = ['writing'] as const
export const writingBooksQueryKey = [...writingQueryKey, 'books'] as const
export const writingBookTreeQueryKey = (id: string) => [...writingBooksQueryKey, id, 'tree'] as const
export const writingChapterQueryKey = (id: string) => [...writingQueryKey, 'chapters', id] as const

export interface CreateWritingBookInput {
  id: string
  title: string
  description?: string
  cover?: string
  penName?: string
  style?: string
  styleNote?: string
  defaultVolume?: Omit<CreateWritingVolumeInput, 'bookId'> & {
    defaultChapter: Omit<CreateWritingChapterInput, 'volumeId'>
  }
}

export interface UpdateWritingBookInput {
  title?: string
  description?: string
  cover?: string | null
  penName?: string
  style?: string
  styleNote?: string
}

export interface CreateWritingVolumeInput {
  id: string
  bookId: string
  title: string
  description?: string
  marked?: boolean
  defaultChapter?: Omit<CreateWritingChapterInput, 'volumeId'>
}

export interface UpdateWritingVolumeInput {
  title?: string
  description?: string
  marked?: boolean
}

export interface CreateWritingChapterInput {
  id: string
  volumeId: string
  title: string
  summary?: string
  content?: string
  sceneNotes?: string[]
  prompt?: string
  characters?: WritingCharacter[]
  reviewChecklist?: WritingReviewChecklistItem[]
  nextActions?: string[]
  updatedAt?: string
  marked?: boolean
}

export interface UpdateWritingChapterInput {
  title?: string
  summary?: string
  content?: string
  sceneNotes?: string[]
  prompt?: string
  characters?: WritingCharacter[]
  reviewChecklist?: WritingReviewChecklistItem[]
  nextActions?: string[]
  updatedAt?: string
  marked?: boolean
}

export interface DeleteWritingVolumeInput {
  replacement?: Omit<CreateWritingVolumeInput, 'bookId'> & {
    defaultChapter: Omit<CreateWritingChapterInput, 'volumeId'>
  }
}

export interface DeleteWritingChapterInput {
  replacement?: Omit<CreateWritingChapterInput, 'volumeId'>
}

async function getAccessToken() {
  if (!supabase) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token ?? null
}

async function request<T>(path: string, init?: RequestInit) {
  const token = await getAccessToken()
  const headers = new Headers(init?.headers)

  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}/api/writing${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const data = (await response.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // ignore json parse failure
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export function fetchWritingBooks() {
  return request<WritingBook[]>('/books')
}

export function fetchWritingBookTree(id: string) {
  return request<WritingBook>(`/books/${id}/tree`)
}

export function fetchWritingChapter(id: string) {
  return request<WritingChapter>(`/chapters/${id}`)
}

export function createWritingBook(payload: CreateWritingBookInput) {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateWritingBook(id: string, payload: UpdateWritingBookInput) {
  return request(`/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function createWritingVolume(payload: CreateWritingVolumeInput) {
  return request('/volumes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateWritingVolume(id: string, payload: UpdateWritingVolumeInput) {
  return request(`/volumes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteWritingVolume(id: string, payload: DeleteWritingVolumeInput = {}) {
  return request<{ success: true }>(`/volumes/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

export function createWritingChapter(payload: CreateWritingChapterInput) {
  return request('/chapters', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateWritingChapter(id: string, payload: UpdateWritingChapterInput) {
  return request(`/chapters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteWritingChapter(id: string, payload: DeleteWritingChapterInput = {}) {
  return request<{ success: true }>(`/chapters/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

export function useWritingBooksQuery() {
  return useQuery({
    queryKey: writingBooksQueryKey,
    queryFn: fetchWritingBooks,
  })
}

export function useWritingBookTreeQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: writingBookTreeQueryKey(id),
    queryFn: () => fetchWritingBookTree(id),
    enabled: enabled && Boolean(id),
  })
}

export function useWritingChapterQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: writingChapterQueryKey(id),
    queryFn: () => fetchWritingChapter(id),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateWritingBookMutation() {
  return useMutation({
    mutationFn: createWritingBook,
  })
}

export function useUpdateWritingBookMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWritingBookInput }) => updateWritingBook(id, payload),
  })
}

export function useCreateWritingVolumeMutation() {
  return useMutation({
    mutationFn: createWritingVolume,
  })
}

export function useUpdateWritingVolumeMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWritingVolumeInput }) => updateWritingVolume(id, payload),
  })
}

export function useDeleteWritingVolumeMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: DeleteWritingVolumeInput }) => deleteWritingVolume(id, payload),
  })
}

export function useCreateWritingChapterMutation() {
  return useMutation({
    mutationFn: createWritingChapter,
  })
}

export function useUpdateWritingChapterMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWritingChapterInput }) => updateWritingChapter(id, payload),
  })
}

export function useDeleteWritingChapterMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: DeleteWritingChapterInput }) => deleteWritingChapter(id, payload),
  })
}

// 写作域前端数据访问层。
