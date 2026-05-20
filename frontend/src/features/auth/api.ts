import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

const authSessionQueryKey = ['auth', 'session'] as const

async function requireSupabase() {
  if (!supabase) {
    throw new Error('缺少 Supabase 前端环境变量配置。')
  }

  return supabase
}

export async function fetchAuthSession() {
  const client = await requireSupabase()
  const {
    data: { session },
  } = await client.auth.getSession()
  return session
}

export async function signInWithPassword(email: string, password: string) {
  const client = await requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function signUpWithPassword(email: string, password: string) {
  const client = await requireSupabase()
  const { data, error } = await client.auth.signUp({ email, password })
  if (error) throw error
  return data.session ?? null
}

export async function signOut() {
  const client = await requireSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export function useAuthSessionQuery() {
  return useQuery({
    queryKey: authSessionQueryKey,
    queryFn: fetchAuthSession,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signInWithPassword(email, password),
    onSuccess: (session) => {
      queryClient.setQueryData(authSessionQueryKey, session)
    },
  })
}

export function useSignUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signUpWithPassword(email, password),
    onSuccess: (session) => {
      queryClient.setQueryData(authSessionQueryKey, session)
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(authSessionQueryKey, null)
      queryClient.removeQueries()
    },
  })
}

export { authSessionQueryKey }

// 认证域数据访问层。
