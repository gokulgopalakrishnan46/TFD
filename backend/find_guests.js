const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const guests = await prisma.user.findMany({
        where: { role: 'GUEST' },
        select: { email: true }
    });
    console.log('GUEST_EMAILS:', JSON.stringify(guests));
    await prisma.$disconnect();
}

run();
