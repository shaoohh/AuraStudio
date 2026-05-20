import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { and, asc, eq } from 'drizzle-orm'
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

const chapterCreateSchema = z.object({
  id: z.string(),
  volumeId: z.string(),
  title: z.string(),
  summary: z.string().default(''),
  content: z.string().default(''),
  sceneNotes: z.array(z.string()).default([]),
  prompt: z.string().default(''),
  characters: z.array(writingCharacterSchema).default([]),
  updatedAt: z.string().default(''),
  marked: z.boolean().optional().default(false),
})

const chapterUpdateSchema = z
  .object({
    title: z.string().optional(),
    summary: z.string().optional(),
    content: z.string().optional(),
    sceneNotes: z.array(z.string()).optional(),
    prompt: z.string().optional(),
    characters: z.array(writingCharacterSchema).optional(),
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

const syncBookSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default('作者很懒'),
  cover: z.string().optional(),
  penName: z.string().default('未命名作者'),
  style: z.string().default('风格待分析'),
  styleNote: z.string().default('先把书本架子搭起来，后面再慢慢补作者画像。'),
  volumes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().default('作者很懒'),
      marked: z.boolean().optional().default(false),
      chapters: z.array(chapterCreateSchema.omit({ volumeId: true })),
    })
  ),
})

function formatTimestampLabel(date: Date | null | undefined) {
  const target = date ?? new Date()
  const month = `${target.getMonth() + 1}`.padStart(2, '0')
  const day = `${target.getDate()}`.padStart(2, '0')
  const hours = `${target.getHours()}`.padStart(2, '0')
  const minutes = `${target.getMinutes()}`.padStart(2, '0')
  return `${target.getFullYear()}-${month}-${day} ${hours}:${minutes}`
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

export const writingRoute = new Hono<{ Variables: Variables }>()
  .get('/books', async (c) => {
    const userId = c.get('jwtPayload').sub

    const books = await db.query.writingBooks.findMany({
      where: eq(writingBooks.userId, userId),
      orderBy: [asc(writingBooks.orderIndex), asc(writingBooks.createdAt)],
      with: {
        volumes: {
          orderBy: [asc(writingVolumes.orderIndex), asc(writingVolumes.createdAt)],
          with: {
            chapters: {
              orderBy: [asc(writingChapters.orderIndex), asc(writingChapters.createdAt)],
            },
          },
        },
      },
    })

    return c.json(
      books.map((book) => ({
        id: book.id,
        title: book.title,
        description: book.description,
        cover: book.cover ?? undefined,
        penName: book.penName,
        style: book.style,
        styleNote: book.styleNote,
        volumes: book.volumes.map((volume) => ({
          id: volume.id,
          title: volume.title,
          description: volume.description,
          marked: volume.marked,
          chapters: volume.chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            summary: chapter.summary,
            content: chapter.content,
            sceneNotes: chapter.sceneNotes ?? [],
            prompt: chapter.prompt,
            characters: chapter.characters ?? [],
            updatedAt: chapter.updatedAtLabel || formatTimestampLabel(chapter.updatedAt),
            marked: chapter.marked,
          })),
        })),
      }))
    )
  })
  .put(
    '/books/sync',
    zValidator(
      'json',
      z.object({
        books: z.array(syncBookSchema),
      })
    ),
    async (c) => {
      const userId = c.get('jwtPayload').sub
      const { books } = c.req.valid('json')

      await db.transaction(async (tx) => {
        await tx.delete(writingBooks).where(eq(writingBooks.userId, userId))

        if (books.length === 0) return

        await tx.insert(writingBooks).values(
          books.map((book, index) => ({
            id: book.id,
            userId,
            title: book.title,
            description: book.description,
            cover: book.cover ?? null,
            penName: book.penName,
            style: book.style,
            styleNote: book.styleNote,
            orderIndex: index,
          }))
        )

        const volumeRows = books.flatMap((book) =>
          book.volumes.map((volume, index) => ({
            id: volume.id,
            bookId: book.id,
            title: volume.title,
            description: volume.description,
            marked: volume.marked ?? false,
            orderIndex: index,
          }))
        )

        if (volumeRows.length > 0) {
          await tx.insert(writingVolumes).values(volumeRows)
        }

        const now = new Date()
        const chapterRows = books.flatMap((book) =>
          book.volumes.flatMap((volume) =>
            volume.chapters.map((chapter, index) => ({
              id: chapter.id,
              volumeId: volume.id,
              title: chapter.title,
              summary: chapter.summary,
              content: chapter.content,
              sceneNotes: chapter.sceneNotes,
              prompt: chapter.prompt,
              characters: chapter.characters,
              updatedAtLabel: chapter.updatedAt || formatTimestampLabel(now),
              marked: chapter.marked ?? false,
              orderIndex: index,
              updatedAt: now,
            }))
          )
        )

        if (chapterRows.length > 0) {
          await tx.insert(writingChapters).values(chapterRows)
        }
      })

      return c.json({ success: true })
    }
  )
  .post('/books', zValidator('json', bookCreateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const payload = c.req.valid('json')
    const existingBooks = await db.query.writingBooks.findMany({
      where: eq(writingBooks.userId, userId),
      columns: { id: true },
    })

    const [created] = await db
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
        orderIndex: existingBooks.length,
      })
      .returning()

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

    const existingVolumes = await db.query.writingVolumes.findMany({
      where: eq(writingVolumes.bookId, payload.bookId),
      columns: { id: true },
    })

    const [created] = await db
      .insert(writingVolumes)
      .values({
        id: payload.id,
        bookId: payload.bookId,
        title: payload.title,
        description: payload.description,
        marked: payload.marked ?? false,
        orderIndex: existingVolumes.length,
      })
      .returning()

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

    const existingVolume = await getOwnedVolume(userId, volumeId)
    if (!existingVolume) return c.json({ error: '未找到该卷册或无权操作。' }, 404)

    await db.delete(writingVolumes).where(eq(writingVolumes.id, volumeId))
    return c.json({ success: true })
  })
  .post('/chapters', zValidator('json', chapterCreateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const payload = c.req.valid('json')

    const volume = await getOwnedVolume(userId, payload.volumeId)
    if (!volume) return c.json({ error: '目标卷册不存在或无权操作。' }, 404)

    const existingChapters = await db.query.writingChapters.findMany({
      where: eq(writingChapters.volumeId, payload.volumeId),
      columns: { id: true },
    })

    const [created] = await db
      .insert(writingChapters)
      .values({
        id: payload.id,
        volumeId: payload.volumeId,
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        sceneNotes: payload.sceneNotes,
        prompt: payload.prompt,
        characters: payload.characters,
        updatedAtLabel: payload.updatedAt || formatTimestampLabel(new Date()),
        marked: payload.marked ?? false,
        orderIndex: existingChapters.length,
        updatedAt: new Date(),
      })
      .returning()

    return c.json(created, 201)
  })
  .patch('/chapters/:id', zValidator('json', chapterUpdateSchema), async (c) => {
    const userId = c.get('jwtPayload').sub
    const chapterId = c.req.param('id')
    const payload = c.req.valid('json')

    const existingChapter = await getOwnedChapter(userId, chapterId)
    if (!existingChapter) return c.json({ error: '未找到该章节或无权操作。' }, 404)

    const [updated] = await db
      .update(writingChapters)
      .set({
        title: payload.title ?? existingChapter.title,
        summary: payload.summary ?? existingChapter.summary,
        content: payload.content ?? existingChapter.content,
        sceneNotes: payload.sceneNotes ?? existingChapter.sceneNotes,
        prompt: payload.prompt ?? existingChapter.prompt,
        characters: payload.characters ?? existingChapter.characters,
        updatedAtLabel: payload.updatedAt ?? existingChapter.updatedAtLabel,
        marked: payload.marked ?? existingChapter.marked,
        updatedAt: new Date(),
      })
      .where(eq(writingChapters.id, chapterId))
      .returning()

    return c.json(updated)
  })
  .delete('/chapters/:id', async (c) => {
    const userId = c.get('jwtPayload').sub
    const chapterId = c.req.param('id')

    const existingChapter = await getOwnedChapter(userId, chapterId)
    if (!existingChapter) return c.json({ error: '未找到该章节或无权操作。' }, 404)

    await db.delete(writingChapters).where(eq(writingChapters.id, chapterId))
    return c.json({ success: true })
  })

// 写作域路由，提供书本、卷册、章节的细粒度 CRUD。
