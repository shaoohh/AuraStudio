import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { and, asc, count, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../db/index.js'
import { writingBooks, writingChapters, writingVolumes } from '../db/schema.js'

type Variables = {
  jwtPayload: { sub: string }
}

const writingCharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  note: z.string(),
})

const writingReviewChecklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  checked: z.boolean(),
})

const chapterCreateSchema = z.object({
  id: z.string(),
  volumeId: z.string(),
  title: z.string(),
  summary: z.string().default(''),
  content: z.string().default(''),
  sceneNotes: z.array(z.string()).default([]),
  prompt: z.string().default(''),
  characters: z.array(writingCharacterSchema).default([]),
  reviewChecklist: z.array(writingReviewChecklistItemSchema).default([]),
  nextActions: z.array(z.string()).default([]),
  updatedAt: z.string().default(''),
  marked: z.boolean().optional().default(false),
})

const nestedChapterCreateSchema = chapterCreateSchema.omit({ volumeId: true })

const chapterUpdateSchema = z
  .object({
    title: z.string().optional(),
    summary: z.string().optional(),
    content: z.string().optional(),
    sceneNotes: z.array(z.string()).optional(),
    prompt: z.string().optional(),
    characters: z.array(writingCharacterSchema).optional(),
    reviewChecklist: z.array(writingReviewChecklistItemSchema).optional(),
    nextActions: z.array(z.string()).optional(),
    updatedAt: z.string().optional(),
    marked: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' })

const volumeCreateSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  title: z.string(),
  description: z.string().default('作者很懒'),
  marked: z.boolean().optional().default(false),
  defaultChapter: nestedChapterCreateSchema.optional(),
})

const nestedVolumeCreateSchema = volumeCreateSchema.omit({ bookId: true }).extend({
  defaultChapter: nestedChapterCreateSchema,
})

const volumeUpdateSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    marked: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' })

const bookCreateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default('作者很懒'),
  cover: z.string().optional(),
  penName: z.string().default('未命名作者'),
  style: z.string().default('风格待分析'),
  styleNote: z.string().default('先把书本架子搭起来，后面再慢慢补作者画像。'),
  defaultVolume: nestedVolumeCreateSchema.optional(),
})

const bookUpdateSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    cover: z.string().nullable().optional(),
    penName: z.string().optional(),
    style: z.string().optional(),
    styleNote: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' })

const volumeDeleteSchema = z.object({
  replacement: nestedVolumeCreateSchema.optional(),
})

const chapterDeleteSchema = z.object({
  replacement: nestedChapterCreateSchema.optional(),
})

function formatTimestampLabel(date: Date | null | undefined) {
  const target = date ?? new Date()
  const month = `${target.getMonth() + 1}`.padStart(2, '0')
  const day = `${target.getDate()}`.padStart(2, '0')
  const hours = `${target.getHours()}`.padStart(2, '0')
  const minutes = `${target.getMinutes()}`.padStart(2, '0')
  return `${target.getFullYear()}-${month}-${day} ${hours}:${minutes}`
}

function getTitleIndex(title: string) {
  const directNumber = title.match(/第\s*(\d+)\s*[卷章]/)
  if (directNumber) return Number(directNumber[1])

  const chineseNumber = title.match(/第\s*([零〇一二两三四五六七八九十]+)\s*[卷章]/)
  if (!chineseNumber) return Number.MAX_SAFE_INTEGER

  return parseChineseNumber(chineseNumber[1])
}

function parseChineseNumber(value: string) {
  const digits: Record<string, number> = {
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  }

  if (value === '十') return 10

  const [beforeTen, afterTen] = value.split('十')
  if (afterTen !== undefined) {
    const tens = beforeTen ? digits[beforeTen] ?? 0 : 1
    const ones = afterTen ? digits[afterTen] ?? 0 : 0
    return tens * 10 + ones
  }

  return digits[value] ?? Number.MAX_SAFE_INTEGER
}

function compareWritingTitles<T extends { title: string; createdAt?: Date | null }>(left: T, right: T) {
  const leftIndex = getTitleIndex(left.title)
  const rightIndex = getTitleIndex(right.title)
  if (leftIndex !== rightIndex) return leftIndex - rightIndex

  const leftTime = left.createdAt?.getTime() ?? 0
  const rightTime = right.createdAt?.getTime() ?? 0
  return leftTime - rightTime
}

function createChapterUpdatePayload(payload: z.infer<typeof chapterUpdateSchema>) {
  const updatePayload: Partial<typeof writingChapters.$inferInsert> = {
    updatedAt: new Date(),
  }

  if (payload.title !== undefined) updatePayload.title = payload.title
  if (payload.summary !== undefined) updatePayload.summary = payload.summary
  if (payload.content !== undefined) updatePayload.content = payload.content
  if (payload.sceneNotes !== undefined) updatePayload.sceneNotes = payload.sceneNotes
  if (payload.prompt !== undefined) updatePayload.prompt = payload.prompt
  if (payload.characters !== undefined) updatePayload.characters = payload.characters
  if (payload.reviewChecklist !== undefined) updatePayload.reviewChecklist = payload.reviewChecklist
  if (payload.nextActions !== undefined) updatePayload.nextActions = payload.nextActions
  if (payload.updatedAt !== undefined) updatePayload.updatedAtLabel = payload.updatedAt
  if (payload.marked !== undefined) updatePayload.marked = payload.marked

  return updatePayload
}

function createChapterInsertPayload(
  volumeId: string,
  payload: z.infer<typeof nestedChapterCreateSchema>
): typeof writingChapters.$inferInsert {
  return {
    id: payload.id,
    volumeId,
    title: payload.title,
    summary: payload.summary,
    content: payload.content,
    sceneNotes: payload.sceneNotes,
    prompt: payload.prompt,
    characters: payload.characters,
    updatedAtLabel: payload.updatedAt || formatTimestampLabel(new Date()),
    marked: payload.marked ?? false,
    updatedAt: new Date(),
  }
}

async function getOwnedBook(userId: string, bookId: string) {
  return db.query.writingBooks.findFirst({
    where: and(eq(writingBooks.id, bookId), eq(writingBooks.userId, userId)),
  })
}

async function getOwnedVolume(userId: string, volumeId: string) {
  const volume = await db.query.writingVolumes.findFirst({
    where: eq(writingVolumes.id, volumeId),
    with: {
      book: {
        columns: { id: true, userId: true },
      },
    },
  })

  return volume?.book.userId === userId ? volume : null
}

async function getOwnedChapter(userId: string, chapterId: string) {
  const chapter = await db.query.writingChapters.findFirst({
    where: eq(writingChapters.id, chapterId),
    with: {
      volume: {
        with: {
          book: {
            columns: { id: true, userId: true },
          },
        },
      },
    },
  })

  return chapter?.volume.book.userId === userId ? chapter : null
}

async function getOwnedChapterMeta(userId: string, chapterId: string) {
  const chapter = await db.query.writingChapters.findFirst({
    where: eq(writingChapters.id, chapterId),
    columns: {
      id: true,
      volumeId: true,
    },
    with: {
      volume: {
        columns: {
          id: true,
          bookId: true,
        },
        with: {
          book: {
            columns: { id: true, userId: true },
          },
        },
      },
    },
  })

  return chapter?.volume.book.userId === userId ? chapter : null
}

export const writingRoute = new Hono<{ Variables: Variables }>()
  .get('/books', async (c) => {
    const userId = c.get('jwtPayload').sub

    const books = await db.query.writingBooks.findMany({
      where: eq(writingBooks.userId, userId),
      orderBy: [asc(writingBooks.createdAt)],
    })
    const bookIds = books.map((book) => book.id)
    const volumeCounts =
      bookIds.length === 0
        ? []
        : await db
            .select({ bookId: writingVolumes.bookId, count: count() })
            .from(writingVolumes)
            .where(inArray(writingVolumes.bookId, bookIds))
            .groupBy(writingVolumes.bookId)
    const volumes = bookIds.length === 0 ? [] : await db.query.writingVolumes.findMany({ where: inArray(writingVolumes.bookId, bookIds) })
    const volumeIds = volumes.map((volume) => volume.id)
    const chapterCounts =
      volumeIds.length === 0
        ? []
        : await db
            .select({ volumeId: writingChapters.volumeId, count: count() })
            .from(writingChapters)
            .where(inArray(writingChapters.volumeId, volumeIds))
            .groupBy(writingChapters.volumeId)
    const volumeCountByBook = new Map(volumeCounts.map((item) => [item.bookId, item.count]))
    const chapterCountByVolume = new Map(chapterCounts.map((item) => [item.volumeId, item.count]))

    return c.json(
      books.map((book) => ({
        id: book.id,
        title: book.title,
        description: book.description,
        cover: book.cover ?? undefined,
        penName: book.penName,
        style: book.style,
        styleNote: book.styleNote,
        volumes: [],
        volumeCount: volumeCountByBook.get(book.id) ?? 0,
        chapterCount: volumes
          .filter((volume) => volume.bookId === book.id)
          .reduce((total, volume) => total + (chapterCountByVolume.get(volume.id) ?? 0), 0),
      }))
    )
  })
  .get('/books/:id/tree', async (c) => {
    const userId = c.get('jwtPayload').sub
    const bookId = c.req.param('id')

    const book = await db.query.writingBooks.findFirst({
      where: and(eq(writingBooks.id, bookId), eq(writingBooks.userId, userId)),
      with: {
        volumes: {
          orderBy: [asc(writingVolumes.createdAt)],
          with: {
            chapters: {
              columns: {
                id: true,
                title: true,
                summary: true,
                createdAt: true,
                updatedAtLabel: true,
                updatedAt: true,
                marked: true,
              },
              orderBy: [asc(writingChapters.createdAt)],
            },
          },
        },
      },
    })

    if (!book) return c.json({ error: '未找到该书本或无权操作。' }, 404)

    const sortedVolumes = [...book.volumes].sort(compareWritingTitles)

    return c.json({
      id: book.id,
      title: book.title,
      description: book.description,
      cover: book.cover ?? undefined,
      penName: book.penName,
      style: book.style,
      styleNote: book.styleNote,
      volumes: sortedVolumes.map((volume) => ({
        id: volume.id,
        title: volume.title,
        description: volume.description,
        marked: volume.marked,
        chapters: [...volume.chapters].sort(compareWritingTitles).map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          summary: chapter.summary,
          content: '',
          sceneNotes: [],
          prompt: '',
          characters: [],
          reviewChecklist: [],
          nextActions: [],
          updatedAt: chapter.updatedAtLabel || formatTimestampLabel(chapter.updatedAt),
          marked: chapter.marked,
          detailLoaded: false,
        })),
      })),
    })
  })
  .post('/books', zValidator('json', bookCreateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const payload = c.req.valid('json')

    const created = await db.transaction(async (tx) => {
      const [book] = await tx
        .insert(writingBooks)
        .values({
          id: payload.id,
          userId,
          title: payload.title,
          description: payload.description,
          cover: payload.cover ?? null,
          penName: payload.penName,
          style: payload.style,
          styleNote: payload.styleNote,
        })
        .returning()

      if (payload.defaultVolume) {
        await tx.insert(writingVolumes).values({
          id: payload.defaultVolume.id,
          bookId: payload.id,
          title: payload.defaultVolume.title,
          description: payload.defaultVolume.description,
          marked: payload.defaultVolume.marked ?? false,
        })

        await tx.insert(writingChapters).values(createChapterInsertPayload(payload.defaultVolume.id, payload.defaultVolume.defaultChapter))
      }

      return book
    })

    return c.json(created, 201)
  })
  .patch('/books/:id', zValidator('json', bookUpdateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const bookId = c.req.param('id')
    const payload = c.req.valid('json')

    const existingBook = await getOwnedBook(userId, bookId)
    if (!existingBook) return c.json({ error: '未找到该书本或无权操作。' }, 404)

    const [updated] = await db
      .update(writingBooks)
      .set({
        title: payload.title ?? existingBook.title,
        description: payload.description ?? existingBook.description,
        cover: payload.cover === undefined ? existingBook.cover : payload.cover,
        penName: payload.penName ?? existingBook.penName,
        style: payload.style ?? existingBook.style,
        styleNote: payload.styleNote ?? existingBook.styleNote,
      })
      .where(eq(writingBooks.id, bookId))
      .returning()

    return c.json(updated)
  })
  .post('/volumes', zValidator('json', volumeCreateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const payload = c.req.valid('json')

    const book = await getOwnedBook(userId, payload.bookId)
    if (!book) return c.json({ error: '目标书本不存在或无权操作。' }, 404)

    const [created] = await db
      .insert(writingVolumes)
      .values({
        id: payload.id,
        bookId: payload.bookId,
        title: payload.title,
        description: payload.description,
        marked: payload.marked ?? false,
      })
      .returning({
        id: writingVolumes.id,
        bookId: writingVolumes.bookId,
        title: writingVolumes.title,
        description: writingVolumes.description,
        marked: writingVolumes.marked,
      })

    if (payload.defaultChapter) {
      try {
        await db.insert(writingChapters).values(createChapterInsertPayload(payload.id, payload.defaultChapter))
      } catch (error) {
        console.error('[writing] failed to create default chapter for volume', payload.id, error)
      }
    }

    return c.json(created, 201)
  })
  .patch('/volumes/:id', zValidator('json', volumeUpdateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const volumeId = c.req.param('id')
    const payload = c.req.valid('json')

    const existingVolume = await getOwnedVolume(userId, volumeId)
    if (!existingVolume) return c.json({ error: '未找到该卷册或无权操作。' }, 404)

    const [updated] = await db
      .update(writingVolumes)
      .set({
        title: payload.title ?? existingVolume.title,
        description: payload.description ?? existingVolume.description,
        marked: payload.marked ?? existingVolume.marked,
      })
      .where(eq(writingVolumes.id, volumeId))
      .returning()

    return c.json(updated)
  })
  .delete('/volumes/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const volumeId = c.req.param('id')
    const payload = volumeDeleteSchema.parse(await c.req.json().catch(() => ({})))

    const existingVolume = await getOwnedVolume(userId, volumeId)
    if (!existingVolume) return c.json({ error: '未找到该卷册或无权操作。' }, 404)

    await db.transaction(async (tx) => {
      await tx.delete(writingVolumes).where(eq(writingVolumes.id, volumeId))

      if (payload.replacement) {
        await tx.insert(writingVolumes).values({
          id: payload.replacement.id,
          bookId: existingVolume.bookId,
          title: payload.replacement.title,
          description: payload.replacement.description,
          marked: payload.replacement.marked ?? false,
        })

        await tx.insert(writingChapters).values(createChapterInsertPayload(payload.replacement.id, payload.replacement.defaultChapter))
      }
    })

    return c.json({ success: true })
  })
  .post('/chapters', zValidator('json', chapterCreateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const payload = c.req.valid('json')

    const volume = await getOwnedVolume(userId, payload.volumeId)
    if (!volume) return c.json({ error: '目标卷册不存在或无权操作。' }, 404)

    const [created] = await db
      .insert(writingChapters)
      .values(createChapterInsertPayload(payload.volumeId, payload))
      .returning({
        id: writingChapters.id,
      })

    return c.json(created, 201)
  })
  .patch('/chapters/:id', zValidator('json', chapterUpdateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const chapterId = c.req.param('id')
    const payload = c.req.valid('json')

    const existingChapter = await getOwnedChapterMeta(userId, chapterId)
    if (!existingChapter) return c.json({ error: '未找到该章节或无权操作。' }, 404)

    const [updated] = await db
      .update(writingChapters)
      .set(createChapterUpdatePayload(payload))
      .where(eq(writingChapters.id, chapterId))
      .returning({
        id: writingChapters.id,
      })

    return c.json(updated)
  })
  .delete('/chapters/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const chapterId = c.req.param('id')
    const payload = chapterDeleteSchema.parse(await c.req.json().catch(() => ({})))

    const existingChapter = await getOwnedChapterMeta(userId, chapterId)
    if (!existingChapter) return c.json({ error: '未找到该章节或无权操作。' }, 404)

    await db.transaction(async (tx) => {
      await tx.delete(writingChapters).where(eq(writingChapters.id, chapterId))

      if (payload.replacement) {
        await tx.insert(writingChapters).values(createChapterInsertPayload(existingChapter.volumeId, payload.replacement))
      }
    })

    return c.json({ success: true })
  })
  .get('/chapters/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const chapterId = c.req.param('id')

    const chapter = await getOwnedChapter(userId, chapterId)
    if (!chapter) return c.json({ error: '未找到该章节或无权操作。' }, 404)

    return c.json({
      id: chapter.id,
      title: chapter.title,
      summary: chapter.summary,
      content: chapter.content,
      sceneNotes: chapter.sceneNotes ?? [],
      prompt: chapter.prompt,
      characters: chapter.characters ?? [],
      reviewChecklist: chapter.reviewChecklist ?? [],
      nextActions: chapter.nextActions ?? [],
      updatedAt: chapter.updatedAtLabel || formatTimestampLabel(chapter.updatedAt),
      marked: chapter.marked,
      detailLoaded: true,
    })
  })

// 写作域路由，只处理书本、卷册、章节的固定顺序内容管理。
