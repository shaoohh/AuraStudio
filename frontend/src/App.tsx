// frontend/src/App.tsx
import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { supabase } from "./supabase"

// 引入我们刚刚拆分出来的页面
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

const queryClient = new QueryClient()

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 🛡️ 全局路由守卫：监听认证状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession((prevSession: any) => {
        // 只有当 session 真正改变时才更新
        const prevUserId = prevSession?.user?.id
        const newUserId = newSession?.user?.id
        return prevUserId !== newUserId ? newSession : prevSession
      })
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">系统加载中...</div>

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 🎯 路由规则设定 */}
          
          {/* 访问首页：如果已登录 -> 去 Dashboard；如果未登录 -> 强行拦截并踢回 /login */}
          <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
          
          {/* 访问登录页：如果未登录 -> 渲染 Login；如果已登录 -> 直接传送回首页 */}
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}