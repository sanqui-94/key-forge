import { NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { ratelimit } from "@/lib/rate-limit";
import { z } from "zod";

const validateBodySchema = z.object({
  requiredScope: z.enum(["READ", "WRITE", "ADMIN"]).optional(),
}).optional();

export async function POST(request: Request) {
  try {
    // 1. Extract the API Key
    const authHeader = request.headers.get("Authorization");
    const fallbackHeader = request.headers.get("x-api-key");
    
    let rawKey = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      rawKey = authHeader.replace("Bearer ", "").trim();
    } else if (fallbackHeader) {
      rawKey = fallbackHeader.trim();
    }

    if (!rawKey) {
      return NextResponse.json(
        { error: "Missing API Key. Provide it via 'Authorization: Bearer <key>' or 'x-api-key' header." },
        { status: 401 }
      );
    }

    // 2. Hash the key to look it up
    const hash = createHash("sha256").update(rawKey).digest("hex");

    // 3. Database Lookup
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash: hash }
    });

    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    // 4. Validate Key State
    if (apiKey.revokedAt) {
      return NextResponse.json({ error: "API Key has been revoked" }, { status: 401 });
    }

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return NextResponse.json({ error: "API Key has expired" }, { status: 401 });
    }

    // Optional Scope Validation
    let bodyData;
    try {
      bodyData = await request.json();
    } catch (e) {
      // Body is not valid JSON or doesn't exist, ignore
    }

    const { data: parsedBody, success } = validateBodySchema.safeParse(bodyData);
    
    // Check scopes if the caller explicitly demanded one
    if (success && parsedBody?.requiredScope) {
      if (!apiKey.scopes.includes(parsedBody.requiredScope)) {
        return NextResponse.json(
          { error: `Insufficient permissions. Key requires scope: ${parsedBody.requiredScope}` },
          { status: 403 }
        );
      }
    }

    // 5. Rate Limiting
    // Make sure Upstash variables are present before trying to use it
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { success, limit, remaining, reset } = await ratelimit.limit(apiKey.id);
      
      if (!success) {
        // We log the 429 asynchronously
        logUsage(apiKey.id, apiKey.userId, 429);
        
        return NextResponse.json(
          { error: "Too Many Requests. Rate limit exceeded." },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString()
            }
          }
        );
      }
    }

    // 6. Usage Logging (Asynchronous to not block Response)
    logUsage(apiKey.id, apiKey.userId, 200);

    // Also update the `lastUsedAt` metadata
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() }
    }).catch(e => console.error("Failed to update lastUsedAt", e));

    // 7. Successful Response
    return NextResponse.json({
      success: true,
      message: "API Key is valid.",
      keyId: apiKey.id,
      scopes: apiKey.scopes
    }, { status: 200 });

  } catch (error) {
    console.error("API Validation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Fire and forget usage logging wrapper 
function logUsage(keyId: string, userId: string, status: number) {
  const id = crypto.randomUUID();
  prisma.usageLog.create({
    data: {
      id,
      keyId,
      userId,
      endpoint: "/api/validate",
      status
    }
  }).catch(e => console.error("Failed to log usage:", e));
}
