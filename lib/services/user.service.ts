import "server-only";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function upsertUser(data: {
    id: string;
    email: string;
    organizationId?: string | null;
}) {
    return prisma.user.upsert({
        where: { id: data.id },
        create: {
            id: data.id,
            email: data.email,
            organizationId: data.organizationId || null,
        },
        update: {
            email: data.email,
            organizationId: data.organizationId || null,
        },
    });
}
