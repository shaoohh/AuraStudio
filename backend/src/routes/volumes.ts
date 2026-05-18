// backend/src/routes/volumes.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { volumes, assets, chapters } from '../db/schema.js'

type Variables = { jwtPayload: { sub: string } }
export const volumesRoute = new Hono<{ Variables: Variables }>()

  // 1️⃣ 获高性能目录树 (只拿元数据，不查正文)
  .get('/', async (c) => {
    const userId = c.get('jwtPayload').sub
    const userVolumes = await db.query.volumes.findMany({
      where: eq(volumes.userId, userId),
      orderBy: [asc(volumes.orderIndex), asc(volumes.createdAt)],
      with: {
        chapters: {
          orderBy: [asc(chapters.orderIndex), asc(chapters.createdAt)],
          columns: { id: true, title: true, orderIndex: true, volumeId: true } // 🔪 砍掉超大正文字段
        },
        assets: true
      }
    })
    return c.json(userVolumes)
  })

  // 2️⃣ 新建卷宗
  .post('/', zValidator('json', z.object({ title: z.string() })), async (c) => {
    const userId = c.get('jwtPayload').sub
    const { title } = c.req.valid('json')
    const [newVolume] = await db.insert(volumes).values({ title, userId }).returning()
    return c.json(newVolume, 201)
  })

  // 3️⃣ 修改卷宗名
  .put('/:id', zValidator('json', z.object({ title: z.string() })), async (c) => {
    const userId = c.get('jwtPayload').sub
    const id = c.req.param('id')
    const { title } = c.req.valid('json')
    const [updated] = await db.update(volumes)
      .set({ title })
      .where(and(eq(volumes.id, id), eq(volumes.userId, userId)))
      .returning()
    return c.json(updated)
  })

  // 4️⃣ 卷宗重排
  .put('/reorder/all', zValidator('json', z.object({
    updates: z.array(z.object({ id: z.string().uuid(), orderIndex: z.number() }))
  })), async (c) => {
    const userId = c.get('jwtPayload').sub
    const { updates } = c.req.valid('json')
    for (const update of updates) {
      await db.update(volumes)
        .set({ orderIndex: update.orderIndex })
        .where(and(eq(volumes.id, update.id), eq(volumes.userId, userId)))
    }
    return c.json({ success: true })
  })

  // 5️⃣ 删除卷宗 (触发级联删除)
  .delete('/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const id = c.req.param('id')
    await db.delete(volumes).where(and(eq(volumes.id, id), eq(volumes.userId, userId)))
    return c.json({ success: true })
  })

  // 6️⃣ 上传参考图到当前卷
  .post('/:id/assets', async (c) => {
    const volumeId = c.req.param('id')
    const body = await c.req.parseBody()
    const file = body.file as File
    const assetName = (body.name as string) || '未命名资产'
    
    if (!file) return c.json({ error: '没有检测到上传的文件' }, 400)

    try {
      const fileName = `${Date.now()}_${file.name}`
      const uploadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/story_assets/${fileName}`
      const fileBuffer = await file.arrayBuffer()
      
      const storageResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'apikey': `${process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': file.type
        },
        body: fileBuffer
      })

      if (!storageResponse.ok) throw new Error(await storageResponse.text())

      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/story_assets/${fileName}`
      const [newAsset] = await db.insert(assets).values({
        volumeId, url: publicUrl, name: assetName, type: 'character'
      }).returning()

      return c.json(newAsset, 201)
    } catch (error: any) {
      return c.json({ error: '云端存储写入失败', details: error.message }, 500)
    }
  })