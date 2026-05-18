// backend/src/routes/chapters.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { chapters, volumes } from '../db/schema.js'

type Variables = { jwtPayload: { sub: string } }
export const chaptersRoute = new Hono<{ Variables: Variables }>()

  // 1️⃣ 获取单章详情 (查正文专用)
  .get('/:id', async (c) => {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    
    const chapterDetails = await db.query.chapters.findFirst({
      where: eq(chapters.id, id),
      with: { volume: { columns: { userId: true } } }
    })

    // 🛡️ 安全防御：不仅要检查章节是否存在，还要检查其父卷是否属于当前用户
    if (!chapterDetails || chapterDetails.volume?.userId !== userId) {
      return c.json({ error: '未找到该章节或无权访问' }, 404)
    }
    return c.json(chapterDetails)
  })

  // 2️⃣ 创建新章节
  .post('/', zValidator('json', z.object({
    volumeId: z.string().uuid(),
    title: z.string()
  })), async (c) => {
    const userId = c.get('jwtPayload').sub
    const { volumeId, title } = c.req.valid('json')

    // 🛡️ 安全防御：创建章节前，必须确认提供的 volumeId 是属于当前用户的
    const targetVolume = await db.query.volumes.findFirst({
      where: and(eq(volumes.id, volumeId), eq(volumes.userId, userId))
    })

    if (!targetVolume) {
       return c.json({ error: '目标卷宗不存在或无权操作' }, 403)
    }

    const [newChapter] = await db.insert(chapters).values({ volumeId, title }).returning()
    return c.json(newChapter, 201)
  })

  // 3️⃣ 批量重排章节 (安全版)
  .put('/reorder/all', zValidator('json', z.object({
    updates: z.array(z.object({ id: z.string().uuid(), orderIndex: z.number() }))
  })), async (c) => {
    const userId = c.get('jwtPayload').sub
    const { updates } = c.req.valid('json')
    const chapterIds = updates.map(u => u.id)

    if (chapterIds.length === 0) return c.json({ success: true })

    // 🛡️ 安全防御：一次性查出所有被请求修改的章节的真实归属
    // Drizzle 的 inArray() 非常适合做批量安全校验
    const validChapters = await db.query.chapters.findMany({
      where: inArray(chapters.id, chapterIds),
      with: { volume: { columns: { userId: true } } }
    })

    // 检查是否有越权修改的意图
    const isAuthorized = validChapters.every(ch => ch.volume?.userId === userId)
    if (!isAuthorized || validChapters.length !== chapterIds.length) {
       return c.json({ error: '请求中包含无效或越权修改的章节' }, 403)
    }

    // 只有全部校验通过，才执行批量更新
    for (const update of updates) {
      await db.update(chapters)
        .set({ orderIndex: update.orderIndex })
        .where(eq(chapters.id, update.id))
    }
    return c.json({ success: true })
  })

  // 4️⃣ 更新特定章节的标题或正文
  .put('/:id', zValidator('json', z.object({
    title: z.string().optional(),
    originalText: z.string().optional(),
    storyboardMd: z.string().optional()
  })), async (c) => {
    const userId = c.get('jwtPayload').sub
    const id = c.req.param('id')
    const { title, originalText, storyboardMd } = c.req.valid('json')

    // 🛡️ 安全防御：先连表查询，确认越权情况
    const existingChapter = await db.query.chapters.findFirst({
      where: eq(chapters.id, id),
      with: { volume: { columns: { userId: true } } }
    })

    if (!existingChapter || existingChapter.volume?.userId !== userId) {
      return c.json({ error: '未找到该章节或无权修改' }, 403)
    }

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (originalText !== undefined) updateData.originalText = originalText
    if (storyboardMd !== undefined) updateData.storyboardMd = storyboardMd

    if (Object.keys(updateData).length === 0) return c.json({ error: '无更新字段' }, 400)

    const [updated] = await db.update(chapters).set(updateData).where(eq(chapters.id, id)).returning()
    return c.json(updated)
  })

  // 5️⃣ 删除章节
  .delete('/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const id = c.req.param('id')
    
    // 🛡️ 安全防御：连表查询归属
    const existingChapter = await db.query.chapters.findFirst({
      where: eq(chapters.id, id),
      with: { volume: { columns: { userId: true } } }
    })

    if (!existingChapter || existingChapter.volume?.userId !== userId) {
      return c.json({ error: '未找到该章节或无权删除' }, 403)
    }

    await db.delete(chapters).where(eq(chapters.id, id))
    return c.json({ success: true })
  })