// frontend/src/App.tsx
import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { supabase } from "./supabase"

// 引入拆分出来的页面与全局加载控制
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import { LoadingProvider, useLoading } from "./context/LoadingContext"
import LoadingCard from "./components/ui/LoginCard"

const queryClient = new QueryClient()

// 💡 核心高阶组件：全局动画转场监听器
// frontend/src/App.tsx 内部的 GlobalLoadingOverlay 组件
function GlobalLoadingOverlay() {
  const { 
    isLoading, 
    isPageReady,   // 🚀 引入首页就绪锁
    isAnimDone, 
    text, 
    subText, 
    resetLoading, 
    setIsAnimDone 
  } = useLoading();

  // 🎬 终极自动放行守卫
  useEffect(() => {
    // 只有当【首页所有数据加载完渲染好】并且【1.8秒动画也播完了】，才允许自动摘掉蒙层
    if (isPageReady && isAnimDone) {
      resetLoading();
    }
  }, [isPageReady, isAnimDone, resetLoading]);

  if (!isLoading) return null;

  return (
    <LoadingCard
      text={text}
      subText={subText}
      isPageReady={isPageReady} // 🚀 传给卡片，用来控制“点击跳过”文字的显示
      onAnimationComplete={() => setIsAnimDone(true)}
      onClick={() => {
        // 🚀 只有首页数据真的渲染好了，点击屏幕才允许跳过；否则点破屏幕也雷打不动！
        if (isPageReady) {
          resetLoading();
        }
      }}
    />
  );
}

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
        const prevUserId = prevSession?.user?.id
        const newUserId = newSession?.user?.id
        return prevUserId !== newUserId ? newSession : prevSession
      })
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 font-sans tracking-wider">
        系统初始化中...
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* 💡 注入全局控制大脑 */}
      <LoadingProvider>
        <BrowserRouter>
          <Routes>
            {/* 访问首页：如果已登录 -> 去 Dashboard；如果未登录 -> 强行拦截并踢回 /login */}
            <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
            
            {/* 访问登录页：如果未登录 -> 渲染 Login；如果已登录 -> 直接传送回首页 */}
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        
        {/* 💡 挂在路由外层的全局蒙层，负责在最上层播放不中断的转场电影 */}
        <GlobalLoadingOverlay />
      </LoadingProvider>
    </QueryClientProvider>
  )
}