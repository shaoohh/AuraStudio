// backend/src/index.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// 🆕 引入我们刚刚建好的模块化路由
import { todosRoute } from './routes/todos.js'
import { categoriesRoute } from './routes/categories.js'
import{chaptersRoute} from './routes/chapters.js'
import {volumesRoute} from './routes/volumes.js'
type Variables = {
  jwtPayload: { sub: string }
}

const app = new Hono<{ Variables: Variables }>()
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// 🛡️ 全局保安：只要是访问 /api/ 开头的接口，全都要查身份证！
app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: '缺少身份凭证' }, 401)

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) return c.json({ error: '身份验证失败或已过期' }, 401)

  c.set('jwtPayload', { sub: user.id })
  await next()
})

// ==========================================
// 🛣️ 路由挂载 (指挥交通)
// ==========================================
// 这就是 Hono RPC 最性感的写法，用链式调用把路由拼在一起！
const routes = app
  .route('/api/todos', todosRoute)
  .route('/api/categories', categoriesRoute)
  .route('/api/chapters', chaptersRoute)
  .route('/api/volumes', volumesRoute)
// 导出整个应用的所有接口类型，供前端一键使用！
export type AppType = typeof routes

const port = 3000
serve({ fetch: app.fetch, port })
console.log(`Server is running on port ${port}`)