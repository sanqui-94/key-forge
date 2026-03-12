// src/env.ts
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1).optional(), // Optional for now, required later
    UPSTASH_REDIS_REST_URL: z.url().optional(), // Optional to not block dev if they dont have it yet
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables");
}

export const env = _env.data;
