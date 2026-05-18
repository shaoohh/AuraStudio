// backend/src/routes/categories.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { categories } from '../db/schema.js'

// 告诉 TypeScript：我们的上下文中一定有 jwtPayload 这个变量
type Variables = {
  jwtPayload: { sub: string }// 这个 sub 就是用户的 ID，我们在 auth.ts 中把它放进 JWT 里了，所以这里可以直接用来识别用户身份，确保每个人只能访问和修改自己的分类和待办事项！
}

// 实例化一个专属的迷你 Hono 路由
export const categoriesRoute = new Hono<{ Variables: Variables }>()// 这个路由的基础路径是 /api/categories，所以我们在 app.ts 中会把它挂载到那个路径上
  
  // 1. 获取当前用户的所有分类
  .get('/', async (c) => {
    const userId = c.get('jwtPayload').sub
    const userCategories = await db.query.categories.findMany({
      where: eq(categories.userId, userId),
    })
    return c.json(userCategories)
  })

  // 2. 新建分类
  .post(
    '/',
    zValidator('json', z.object({ name: z.string() })),
    async (c) => {
      const userId = c.get('jwtPayload').sub
      const { name } = c.req.valid('json')

      const [newCategory] = await db.insert(categories).values({
        name,
        userId,
      }).returning()

      return c.json(newCategory, 201)
    }
  )

  // 3. 删除分类
  .delete('/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const id = c.req.param('id')
    
    // 💡 记得吗？我们在数据库里设置了 cascade (级联删除)。
    // 只要执行了这行代码，这个分类下的所有 Todos 会被数据库自动销毁！
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)))
    return c.json({ success: true })
  })
  //这个路由的作用是处理与分类相关的 API 请求。它提供了三个接口：一个 GET 接口用于获取当前用户的所有分类，一个 POST 接口用于创建新的分类，和一个 DELETE 接口用于删除指定的分类。每个接口都通过 JWT 验证用户身份，确保用户只能访问和修改自己的数据。同时，删除分类时会触发数据库的级联删除机制，自动删除该分类下的所有待办事项。