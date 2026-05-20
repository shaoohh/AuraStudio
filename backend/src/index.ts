import { serve } from '@hono/node-server'
import { createClient } from '@supabase/supabase-js'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config'

import { categoriesRoute } from './routes/categories.js'
import { chaptersRoute } from './routes/chapters.js'
import { todosRoute } from './routes/todos.js'
import { volumesRoute } from './routes/volumes.js'
import { writingRoute } from './routes/writing.js'

type Variables = {
  jwtPayload: { sub: string }
}

const app = new Hono<{ Variables: Variables }>()

app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '缺少身份凭证。' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return c.json({ error: '身份验证失败或已过期。' }, 401)
  }

  c.set('jwtPayload', { sub: user.id })
  await next()
})

const routes = app
  .route('/api/todos', todosRoute)
  .route('/api/categories', categoriesRoute)
  .route('/api/chapters', chaptersRoute)
  .route('/api/volumes', volumesRoute)
  .route('/api/writing', writingRoute)

export type AppType = typeof routes

const port = 3000
serve({ fetch: app.fetch, port })
console.log(`Server is running on port ${port}`)
