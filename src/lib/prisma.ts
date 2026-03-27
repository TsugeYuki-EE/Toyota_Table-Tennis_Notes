import { PrismaClient } from "@prisma/client";

const databaseUrlAliases = [
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "NEON_DATABASE_URL",
  "RENDER_POSTGRESQL_URL",
];

if (!process.env.DATABASE_URL) {
  const resolved = databaseUrlAliases
    .map((key) => process.env[key])
    .find((value) => typeof value === "string" && value.length > 0);

  if (resolved) {
    process.env.DATABASE_URL = resolved;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Set DATABASE_URL or one of POSTGRES_PRISMA_URL / POSTGRES_URL / NEON_DATABASE_URL / RENDER_POSTGRESQL_URL."
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
