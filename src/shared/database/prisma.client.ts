// src/infrastructure/database/prisma.client.ts
import { PrismaClient } from "@prisma/client";

const logQueries =
  process.env.NODE_ENV === "development" &&
  process.env.PRISMA_LOG_QUERIES === "true";

export const prisma = new PrismaClient({
  log: logQueries ? [{ emit: "event", level: "query" }] : [],
});

if (logQueries) {
  prisma.$on("query", (event) => {
    console.log("[Prisma SQL]", event.query);
    console.log("[Prisma params]", event.params);
    console.log(`[Prisma duration] ${event.duration}ms`);
  });
}
