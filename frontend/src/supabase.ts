// frontend/src/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 环境变量缺失！请检查 frontend/.env 文件')
}

// 创建并导出一个供全局使用的 supabase 实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)