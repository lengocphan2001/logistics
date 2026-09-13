#!/usr/bin/env node
/**
 * One command to bring any database to the current schema: `npm run db:sync`.
 *
 * It is safe to run on every deploy, on a brand new database, and on one that
 * was previously managed with `prisma db push` and therefore has a migration
 * history that never matched reality.
 *
 * What it does, in order:
 *
 *   1. Empty database — runs `migrate deploy`, which creates everything.
 *   2. Existing database — drops rows in `_prisma_migrations` that no longer
 *      correspond to a folder (the stale history), records the baseline as
 *      already applied if it is missing, then runs `migrate deploy` for any
 *      migration added after the baseline.
 *
 * It never drops a table or a column, and never touches business data.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function runPrisma(args) {
  execFileSync('npx', ['prisma', ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

function migrationFolders() {
  return fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function inspect(prisma) {
  const [{ count: tableCount }] = await prisma.$queryRawUnsafe(
    `select count(*)::int as count
       from information_schema.tables
      where table_schema = 'public'
        and table_name <> '_prisma_migrations'`,
  );

  const [{ count: historyExists }] = await prisma.$queryRawUnsafe(
    `select count(*)::int as count
       from information_schema.tables
      where table_schema = 'public'
        and table_name = '_prisma_migrations'`,
  );

  const applied = historyExists
    ? await prisma.$queryRawUnsafe(
        `select migration_name from _prisma_migrations where rolled_back_at is null`,
      )
    : [];

  return {
    hasTables: tableCount > 0,
    hasHistory: historyExists > 0,
    applied: applied.map((row) => row.migration_name),
  };
}

async function main() {
  const folders = migrationFolders();
  if (folders.length === 0) {
    throw new Error('Không tìm thấy migration nào trong prisma/migrations');
  }
  const baseline = folders[0];

  const prisma = new PrismaClient();
  let state;
  try {
    state = await inspect(prisma);

    if (!state.hasTables) {
      console.log('Database trống. Chạy migrate deploy để dựng toàn bộ schema.');
    } else {
      // Rows for folders that no longer exist are the leftovers of a history
      // that was squashed or never matched the database. They would make
      // `migrate deploy` refuse to run.
      const stale = state.applied.filter((name) => !folders.includes(name));
      if (stale.length > 0) {
        const deleted = await prisma.$executeRawUnsafe(
          `delete from _prisma_migrations
            where migration_name = any($1::text[])`,
          stale,
        );
        console.log(
          `Đã xoá ${deleted} bản ghi lịch sử không còn migration tương ứng: ${stale.join(', ')}`,
        );
      }

      if (!state.applied.includes(baseline)) {
        console.log(
          `Database đã có dữ liệu nhưng chưa ghi nhận mốc ${baseline}. Đánh dấu đã áp dụng.`,
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  // resolve must happen after the client is disconnected: the Prisma CLI opens
  // its own connection and an advisory lock.
  if (state.hasTables && !state.applied.includes(baseline)) {
    runPrisma(['migrate', 'resolve', '--applied', baseline]);
  }

  runPrisma(['migrate', 'deploy']);
  // `prisma generate` is deliberately not run here: postinstall and prebuild
  // already do it, and on Windows it fails while a dev server holds the query
  // engine open.
  runPrisma(['migrate', 'status']);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
