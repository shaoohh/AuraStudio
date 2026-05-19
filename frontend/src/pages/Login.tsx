// frontend/src/pages/Login.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import styled from "styled-components" 

// 🚀 引入所有的自定义高级组件
import CustomEmailInput from "../components/ui/CustomEmailInput"
import CustomPasswordInput from "../components/ui/CustomPasswordInput"
import CustomErrorToast from "../components/ui/CustomErrorToast"
import CustomAnimatedButton from "../components/ui/CustomAnimatedButton" // 👈 确保你的动效按钮放在这个路径下

import { useLoading } from "../context/LoadingContext"

// 一个简单的正则用于手动验证邮箱格式
const validateEmailFormat = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const { startLoading, authSuccess, authError } = useLoading()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null) 
    startLoading(isSignUp ? "SIGNING UP" : "VERIFYING")

    // 手动拦截邮箱格式错误
    if (!validateEmailFormat(email)) {
      authError() 
      setErrorMsg(`邮箱格式无效。“${email}” 不是一个有效的邮箱地址。`) 
      return; 
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        authError() 
        setErrorMsg(error.message) 
      } else {
        authSuccess() 
        navigate("/") 
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        authError() 
        // ❌ 密码错了：撤下黑幕，弹出自定义报错通知
        setErrorMsg("邮箱或密码错误，请重试") 
      } else {
        authSuccess() 
        navigate("/") 
      }
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#030712] flex flex-col justify-center sm:px-6 lg:px-8 font-sans selection:bg-[#45f3ff] selection:text-[#07182E] relative">
      
      {/* 报错通知组件挂载点 */}
      {errorMsg && (
        <CustomErrorToast 
          message={errorMsg} 
          onClose={() => setErrorMsg(null)} 
        />
      )}

      {/* 顶部静态 Logo 和文字 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center">
        {/* 给 Logo 增加微弱的金色呼吸阴影 shadow-[0_0_15px_rgba(189,159,103,0.15)] */}
        <div className="w-16 h-16 bg-[#243137] rounded-xl flex items-center justify-center mb-6 border border-[#bd9f67]/30 shadow-[0_0_20px_rgba(189,159,103,0.15)]">
          <span className="font-sans font-black text-2xl text-[#bd9f67] border-b-[3px] border-[#bd9f67] leading-[0.8] pb-[2px] tracking-wide">
            AS
          </span>
        </div>
        {/* 主标题反色为白色 text-slate-50，增加字母间距 tracking-wider 更显高级 */}
        <h2 className="text-center text-[28px] font-black tracking-wider text-slate-50 drop-shadow-md">
          欢迎回到 Aura Studio
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
        {/* 炫酷流光卡片底座 */}
        <AnimatedFormCard>
          {/* 稍微增强了一点卡片在暗背景下的幽蓝光晕 */}
          <div className="card shadow-[0_0_40px_rgba(0,183,255,0.1)]">
            <div className="card-content px-8 py-10 w-full">
              
              <form className="space-y-6" onSubmit={handleSubmit} noValidate> 
                
                <div className="pt-2">
                  <CustomEmailInput value={email} onChange={setEmail} label="邮箱地址 (Email)" />
                </div>

                <div className="pb-2">
                  <CustomPasswordInput value={password} onChange={setPassword} label="密码 (Password)" />
                </div>

                {/* 🚀 2. 彻底删除“或者”区块，使两个按钮紧邻 */}
                <div className="pt-6 space-y-5">
                  
                  {/* 提交按钮：无需 Hover 变字 */}
                  <CustomAnimatedButton 
                    type="submit"
                    text={isSignUp ? "立即注册账号" : "登录账号"}
                  />
                  
                  {/* 切换按钮：配置 Hover 变字动效 */}
                  <CustomAnimatedButton 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    text={isSignUp ? "已有账号？" : "没有账号？"}
                    hoverText={isSignUp ? "去登录" : "点击注册"}
                  />
                </div>
                
              </form>

            </div>
          </div>
        </AnimatedFormCard>
      </div>
    </div>
  )
}

// 完整保留的流光卡片样式
const AnimatedFormCard = styled.div`
  .card {
    width: 100%;
    min-height: 380px; 
    background: #07182E;
    position: relative;
    display: flex;
    place-content: center;
    place-items: center;
    overflow: hidden;
    border-radius: 20px;
  }

  .card-content {
    z-index: 10;
    position: relative;
    
    /* 🚀 3. 我发挥了一个更清晰且与赛博风协调的全选效果 */
    input::selection {
      background-color: #45f3ff; /* 💡 选中背景：霓虹青色 */
      color: #07182E;            /* 💡 选中文字：强制变成深卡片背景色，保证极佳对比度 */
      text-shadow: none;        /* 去除可能存在的阴影干扰 */
    }
    /* 火狐浏览器兼容 */
    input::-moz-selection {
      background-color: #45f3ff;
      color: #07182E;
      text-shadow: none;
    }
  }

  .card::before {
    content: '';
    position: absolute;
    width: 150px; 
    background-image: linear-gradient(180deg, rgb(0, 183, 255), rgb(255, 48, 255));
    height: 150%;
    animation: rotBGimg 4s linear infinite;
    transition: all 0.2s linear;
  }

  @keyframes rotBGimg {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .card::after {
    content: '';
    position: absolute;
    background: #07182E;
    inset: 4px; 
    border-radius: 16px; 
  }
`;