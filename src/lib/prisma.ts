// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances in dev
  var prisma: PrismaClient | undefined;
}

// Optional: Override DATABASE_URL (only for development)
if (process.env.NODE_ENV === "development") {
  process.env.DATABASE_URL = "postgresql://postgres:admin@localhost:5432/mydb?schema=public";
}

const client = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;
