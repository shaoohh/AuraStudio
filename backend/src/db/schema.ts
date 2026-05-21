import { relations, sql } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

type WritingCharacterRecord = {
  id: string
  name: string
  role: string
  note: string
}

type WritingReviewChecklistItemRecord = {
  id: string
  text: string
  checked: boolean
}

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false),
  userId: uuid('user_id').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  todos: many(todos),
}))

export const todosRelations = relations(todos, ({ one }) => ({
  category: one(categories, {
    fields: [todos.categoryId],
    references: [categories.id],
  }),
}))

export const volumes = pgTable('volumes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  volumeId: uuid('volume_id')
    .references(() => volumes.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  originalText: text('original_text'),
  storyboardMd: text('storyboard_md'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  volumeId: uuid('volume_id')
    .references(() => volumes.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  type: text('type').default('character').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const volumesRelations = relations(volumes, ({ many }) => ({
  chapters: many(chapters),
  assets: many(assets),
}))

export const chaptersRelations = relations(chapters, ({ one }) => ({
  volume: one(volumes, {
    fields: [chapters.volumeId],
    references: [volumes.id],
  }),
}))

export const assetsRelations = relations(assets, ({ one }) => ({
  volume: one(volumes, {
    fields: [assets.volumeId],
    references: [volumes.id],
  }),
}))

export const writingBooks = pgTable('writing_books', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description').default('作者很懒').notNull(),
  cover: text('cover'),
  penName: text('pen_name').default('未命名作者').notNull(),
  style: text('style').default('风格待分析').notNull(),
  styleNote: text('style_note').default('先把书本架子搭起来，后面再慢慢补作者画像。').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const writingVolumes = pgTable('writing_volumes', {
  id: text('id').primaryKey(),
  bookId: text('book_id')
    .references(() => writingBooks.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description').default('作者很懒').notNull(),
  marked: boolean('marked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const writingChapters = pgTable('writing_chapters', {
  id: text('id').primaryKey(),
  volumeId: text('volume_id')
    .references(() => writingVolumes.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  summary: text('summary').default('').notNull(),
  content: text('content').default('').notNull(),
  sceneNotes: jsonb('scene_notes').$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  prompt: text('prompt').default('').notNull(),
  characters: jsonb('characters').$type<WritingCharacterRecord[]>().default(sql`'[]'::jsonb`).notNull(),
  reviewChecklist: jsonb('review_checklist').$type<WritingReviewChecklistItemRecord[]>().default(sql`'[]'::jsonb`).notNull(),
  nextActions: jsonb('next_actions').$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  updatedAtLabel: text('updated_at_label').default('').notNull(),
  marked: boolean('marked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const writingBooksRelations = relations(writingBooks, ({ many }) => ({
  volumes: many(writingVolumes),
}))

export const writingVolumesRelations = relations(writingVolumes, ({ one, many }) => ({
  book: one(writingBooks, {
    fields: [writingVolumes.bookId],
    references: [writingBooks.id],
  }),
  chapters: many(writingChapters),
}))

export const writingChaptersRelations = relations(writingChapters, ({ one }) => ({
  volume: one(writingVolumes, {
    fields: [writingChapters.volumeId],
    references: [writingVolumes.id],
  }),
}))

// 数据库表结构定义，包含 todo 与 writing 两个域。
