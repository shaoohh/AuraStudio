// frontend/src/client.ts
import { hc } from 'hono/client'
import type { AppType } from '../../backend/src/index'
const baseUrl=import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000' // 从环境变量读取 API 基础 URL，提供默认值
import { supabase } from './supabase'

export const client = hc<AppType>('http://localhost:3000', {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    // 💡 修复点：使用标准的 Headers 对象来安全地合并请求头
    const headers = new Headers(init?.headers)
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // 将安全合并后的 headers 重新塞回请求配置中
    return fetch(input, { ...init, headers })
  }
})