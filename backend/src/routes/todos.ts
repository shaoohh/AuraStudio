// backend/src/routes/todos.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc ,asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { todos } from '../db/schema.js'

type Variables = {
  jwtPayload: { sub: string }
}

export const todosRoute = new Hono<{ Variables: Variables }>()
  .get('/', async (c) => {
    const userId = c.get('jwtPayload').sub

    // 🆕 连表查询魔法：获取 todos 的同时，把它的分类信息也一起带出来 (with category)
    const userTodos = await db.query.todos.findMany({
      where: eq(todos.userId, userId),
      orderBy: (todos, { desc, asc }) => [asc(todos.orderIndex),desc(todos.createdAt)],
      with: {
        category: true 
      }
    })
    return c.json(userTodos)
  })
  .put(
    '/reorder',
    zValidator('json',z.object({
      updates:z.array(z.object({
        id: z.string().uuid(),
        orderIndex: z.number()
      }))
    })),
    async(c)=>{
      const userId = c.get('jwtPayload').sub
      const { updates } = c.req.valid('json')
      for(const  update of updates){
        await db.update(todos)
          .set({ orderIndex: update.orderIndex })
          .where(and(eq(todos.id, update.id), eq(todos.userId, userId)))
      }
    }
  )
  .post(
    '/', 
    // 🆕 注意这里！新建 Todo 时，可以额外传一个可选的 categoryId
    zValidator('json', z.object({ 
      title: z.string(),
      categoryId: z.string().uuid().optional().nullable() 
    })), 
    async (c) => {
      const userId = c.get('jwtPayload').sub
      const { title, categoryId } = c.req.valid('json')
      
      const [newTodo] = await db.insert(todos).values({
        title,
        userId,
        categoryId: categoryId || null, // 存入数据库
      }).returning() 
      
      return c.json(newTodo, 201)
    }
  )
  
  .put(
    '/:id', 
    zValidator('json', z.object({
      completed: z.boolean().optional(),
      title: z.string().trim().min(1).optional(),
    }).refine(
      (data) => data.completed !== undefined || data.title !== undefined,
      { message: '至少需要提供一个更新字段' }
    )), 
    async (c) => {
      const userId = c.get('jwtPayload').sub
      const id = c.req.param('id')
      const { completed, title } = c.req.valid('json')

      const updateData: Record<string, unknown> = {}
      if (completed !== undefined) updateData.completed = completed
      if (title !== undefined) updateData.title = title

      if (Object.keys(updateData).length === 0) {
        return c.json({ error: '没有可更新的字段' }, 400)
      }
      
      const [updatedTodo] = await db.update(todos)
        .set(updateData)
        .where(and(eq(todos.id, id), eq(todos.userId, userId))) 
        .returning()
        
      if (updatedTodo) return c.json(updatedTodo)
      return c.json({ error: '无权修改' }, 404)
    }
  )
  
  .delete('/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const id = c.req.param('id')
    
    await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)))
    return c.json({ success: true })
  })
