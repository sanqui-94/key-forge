"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Scope, UsageLog } from "@prisma/client";
import { randomBytes, createHash } from "crypto";
import { upsertUser } from "@/lib/services/user.service";

export async function getApiKeys() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Fallback: Ensure user exists in Prisma (in case webhooks didn't fire locally)
  const clerkUser = await currentUser();
  if (clerkUser) {
    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    );
    if (primaryEmail) {
      await upsertUser({
        id: clerkUser.id,
        email: primaryEmail.emailAddress,
      });
    }
  }

  const keys = await prisma.apiKey.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      expiresAt: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return keys;
}

export async function createApiKey(data: { name: string; scopes?: Scope[] }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Ensure User is definitively in Prisma DB before appending ApiKey (Resolves P2003 FK Violation)
  const clerkUser = await currentUser();
  if (clerkUser) {
    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    );
    if (primaryEmail) {
      await upsertUser({
        id: clerkUser.id,
        email: primaryEmail.emailAddress,
      });
    }
  }

  // Generate secure random key
  const randomSuffix = randomBytes(32).toString("hex");
  const fullKey = `kf_${randomSuffix}`; // Our agreed prefix
  
  // Create SHA-256 hash for storage
  const hash = createHash("sha256").update(fullKey).digest("hex");
  
  // Extract a prefix to show in the UI (e.g., kf_a1b2...)
  const displayPrefix = `kf_${randomSuffix.substring(0, 4)}...`;

  // generate unique id for the key (since schema uses String @id)
  const id = `key_${randomBytes(16).toString("hex")}`;

  const key = await prisma.apiKey.create({
    data: {
      id,
      name: data.name,
      keyHash: hash,
      keyPrefix: displayPrefix,
      scopes: data.scopes || ["READ"], // Default scope
      userId,
    },
  });

  // Only time we ever return the raw fullKey
  return {
    key: {
      id: key.id,
      name: key.name,
      createdAt: key.createdAt,
    },
    rawKey: fullKey,
  };
}

export async function revokeApiKey(keyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Ensure the key exists and belongs to the user
  const key = await prisma.apiKey.findUnique({
    where: {
      id: keyId,
      userId,
    },
  });

  if (!key) {
    throw new Error("Key not found or unauthorized");
  }

  // Revoke by setting revokedAt to current time
  await prisma.apiKey.update({
    where: {
      id: keyId,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return { success: true };
}

export async function getApiKeyDetails(keyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const key = await prisma.apiKey.findUnique({
    where: {
      id: keyId,
      userId,
    },
    include: {
      usageLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // Recent 50 logs
      },
    },
  });

  if (!key) {
    throw new Error("Key not found");
  }

  // Sanitize to not return hash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { keyHash, ...safeKeyData } = key;
  return safeKeyData as typeof safeKeyData & { UsageLog: UsageLog[] };
}
