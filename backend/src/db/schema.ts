// backend/src/db/schema.ts
import { pgTable, text, boolean, timestamp, uuid, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// =======================================
// 1. 分类/清单表 (Categories)
// =======================================
export const categories = pgTable('categories', {
  // 💡 修复点：使用 uuid 并让数据库自动生成随机的 UUID (defaultRandom)
  id: uuid('id').defaultRandom().primaryKey(), 
  name: text('name').notNull(), 
  userId: uuid('user_id').notNull(), 
  createdAt: timestamp('created_at').defaultNow(),
})

// =======================================
// 2. 待办事项表 (Todos)
// =======================================
export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(), // 💡 修复点：也改为 UUID
  title: text('title').notNull(),
  completed: boolean('completed').default(false),
  userId: uuid('user_id').notNull(),
  
  // 💡 修复点：外键也必须是 UUID 类型，才能和 categories 的 id 匹配上
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
  volumeId: uuid('volume_id').references(() => volumes.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  originalText: text('original_text'), // 允许为 null，省去默认空字符串的麻烦
  storyboardMd: text('storyboard_md'), // 允许为 null
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  volumeId: uuid('volume_id').references(() => volumes.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  type: text('type').default('character').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// 🔗 核心关系声明 (避免 Drizzle 连表查询崩溃)
export const volumesRelations = relations(volumes, ({ many }) => ({
  chapters: many(chapters),
  assets: many(assets),
}))

export const chaptersRelations = relations(chapters, ({ one }) => ({
  volume: one(volumes, { fields: [chapters.volumeId], references: [volumes.id] }),
}))

export const assetsRelations = relations(assets, ({ one }) => ({
  volume: one(volumes, { fields: [assets.volumeId], references: [volumes.id] }),
}))