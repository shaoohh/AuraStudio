import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthSessionQuery } from '../api'

export function AuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  const sessionQuery = useAuthSessionQuery()

  if (sessionQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#030712] text-sm text-slate-400">正在验证登录状态...</div>
  }

  if (!sessionQuery.data) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

// 登录守卫，未登录时跳回登录页。
