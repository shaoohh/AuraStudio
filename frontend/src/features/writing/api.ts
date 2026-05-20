import { useMutation, useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

import type { WritingBook, WritingCharacter } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const writingBooksQueryKey = ['writing', 'books'] as const

export interface CreateWritingBookInput {
  id: string
  title: string
  description?: string
  cover?: string
  penName?: string
  style?: string
  styleNote?: string
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
  updatedAt?: string
  marked?: boolean
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

export function deleteWritingVolume(id: string) {
  return request<{ success: true }>(`/volumes/${id}`, {
    method: 'DELETE',
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

export function deleteWritingChapter(id: string) {
  return request<{ success: true }>(`/chapters/${id}`, {
    method: 'DELETE',
  })
}

export function useWritingBooksQuery() {
  return useQuery({
    queryKey: writingBooksQueryKey,
    queryFn: fetchWritingBooks,
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
    mutationFn: deleteWritingVolume,
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
    mutationFn: deleteWritingChapter,
  })
}

// 写作域前端数据访问层。
