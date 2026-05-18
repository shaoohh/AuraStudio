// backend/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import 'dotenv/config' // 这一步是为了让工具能读到你的 .env 文件

export default defineConfig({
  schema: './src/db/schema.ts', // 告诉 Drizzle 你的表结构代码在哪里
  out: './drizzle',             // 如果需要生成历史迁移文件，放在哪里
  dialect: 'postgresql',        // 我们使用的是 Postgres 数据库
  dbCredentials: {
    url: process.env.DATABASE_URL!, // 你的数据库超级钥匙
  },
})