// frontend/src/pages/Login.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutGrid, ArrowRight } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)
    if (error) {
      alert("登录失败：" + error.message)
    } else {
      navigate("/")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setIsLoading(false)
    if (error) {
      alert("注册失败：" + error.message)
    } else {
      alert("注册成功！可以直接登录了。")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-slate-200">
      
      {/* 顶部 Logo 区域 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 flex flex-col items-center">
        <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center mb-6">
          <LayoutGrid className="w-6 h-6 text-slate-900" />
        </div>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          欢迎回到 Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          请输入您的工作邮箱和密码继续
        </p>
      </div>

      {/* 表单主卡片 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="bg-white/95 py-8 px-4 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)] sm:rounded-[28px] sm:px-10 border border-slate-200/70">
          <form className="space-y-5" onSubmit={handleLogin}>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                邮箱地址
              </label>
              <Input 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
                className="h-10 text-sm bg-white border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  密码
                </label>
              </div>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                className="h-10 text-sm bg-white border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-900"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-200/50 transition-all"
              >
                {isLoading ? "验证中..." : "登录账号"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">或者</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSignUp}
                disabled={isLoading}
                className="w-full h-10 bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium group"
              >
                创建新账号
                <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
            
          </form>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-[13px] text-slate-500">
          <p>测试账号：test1@abc.com</p>
          <p className="mt-1">密码：12345678</p>
        </div>
      </div>

    </div>
  )
}