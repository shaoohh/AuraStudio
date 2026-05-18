// backend/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'// 这是一个轻量级的 PostgreSQL 客户端库，Drizzle 会用它来连接数据库并执行 SQL 语句
import * as schema from './schema.js'
import 'dotenv/config'

// 1. 从环境变量获取超级钥匙
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL 没有设置！请检查 .env 文件')
}

// 2. 初始化底层的 PostgreSQL 客户端
const client = postgres(connectionString, { prepare: false })//为什么prepare要设置为false？因为Drizzle会自己处理预编译语句，我们不需要底层库再做一次预编译了，这样可以避免冲突和性能问题。麻烦详细一点解释一下：
// 在使用 Drizzle ORM 时，Drizzle 会自动处理 SQL 语句的预编译（prepared statements）。如果我们同时在底层的 PostgreSQL 客户端（如 postgres.js）中也启用了预编译，那么就会出现两层预编译的情况。这不仅会导致性能下降，还可能引发一些奇怪的错误，因为底层库和 Drizzle 可能会对同一条 SQL 语句进行不同的预编译处理。通过将 `prepare` 设置为 `false`，我们告诉底层库不要进行预编译，让 Drizzle 独自负责这一部分，从而确保整个系统的稳定性和性能。

// 3. 把客户端交给 Drizzle，并绑定我们写的表结构，导出为 `db`
export const db = drizzle(client, { schema })// 这样我们在其他地方导入 `db` 时，就可以直接使用 Drizzle 的查询构建器来操作数据库了！