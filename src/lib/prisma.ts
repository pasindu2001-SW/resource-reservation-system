import { PrismaClient } from '@prisma/client';

//Declare global variable for prisma to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

//Reuse existing prisma client if it exists, otherwise create a new one
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

//Store the instance ofin the global object
if (process.env.NODE_ENV !== 'development') {

} else {
    globalForPrisma.prisma = prisma;
};

export default prisma;