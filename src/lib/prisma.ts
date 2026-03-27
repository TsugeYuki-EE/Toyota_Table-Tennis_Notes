import { PrismaClient } from "@prisma/client";

const databaseUrlAliases = [
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "NEON_DATABASE_URL",
  "RENDER_POSTGRESQL_URL",
  "RENDER_DATABASE_URL",
  "RENDER_INTERNAL_DATABASE_URL",
  "POSTGRES_INTERNAL_URL",
];

if (!process.env.DATABASE_URL) {
  const resolved = databaseUrlAliases
    .map((key) => process.env[key])
    .find((value) => typeof value === "string" && value.length > 0);

  if (resolved) {
    process.env.DATABASE_URL = resolved;
  }
}

if (
  !process.env.DATABASE_URL &&
  process.env.PGHOST &&
  process.env.PGUSER &&
  process.env.PGPASSWORD &&
  process.env.PGDATABASE
) {
  const pgPort = process.env.PGPORT || "5432";
  process.env.DATABASE_URL = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${pgPort}/${process.env.PGDATABASE}?schema=public`;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Set DATABASE_URL or one of POSTGRES_PRISMA_URL / POSTGRES_URL / NEON_DATABASE_URL / RENDER_POSTGRESQL_URL / RENDER_DATABASE_URL / RENDER_INTERNAL_DATABASE_URL / POSTGRES_INTERNAL_URL (or provide PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE)."
  );
}

// 開発中のホットリロードで PrismaClient が増殖しないように global に保持します。
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
