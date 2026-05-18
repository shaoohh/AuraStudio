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
  const [isSignUp, setIsSignUp] = useState(false) // 核心：用它控制当前是登录还是注册
  const navigate = useNavigate()

  // 统一的表单提交处理器
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (isSignUp) {
      // 注册逻辑
      const { error } = await supabase.auth.signUp({ email, password })
      setIsLoading(false)
      if (error) {
        alert("注册失败：" + error.message)
      } else {
        alert("注册成功！已为您自动登录。")
        navigate("/")
      }
    } else {
      // 登录逻辑
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setIsLoading(false)
      if (error) {
        alert("登录失败：" + error.message)
      } else {
        navigate("/")
      }
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
          {/* 💡 动态主标题 */}
          {isSignUp ? "创建您的新账号" : "欢迎回到 Workspace"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {/* 💡 动态副标题 */}
          {isSignUp ? "输入您的工作邮箱和密码完成注册" : "请输入您的工作邮箱和密码继续"}
        </p>
      </div>

      {/* 表单主卡片 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="bg-white/95 py-8 px-4 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.2)] sm:rounded-[28px] sm:px-10 border border-slate-200/70">
          {/* 💡 统一通过 onSubmit 触发 */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
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
              {/* 💡 唯一的主提交按钮，文案动态切换 */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-200/50 transition-all"
              >
                {isLoading ? "验证中..." : isSignUp ? "立即注册账号" : "登录账号"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">或者</span>
                </div>
              </div>

              {/* 💡 模式切换按钮：点击它不提交，只是来回切换模式 */}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className="w-full h-10 bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium group"
              >
                {isSignUp ? "已有账号？去登录" : "没有账号？点击注册"}
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