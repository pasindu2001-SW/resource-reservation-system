import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);
  const name = args[0] || 'System Administrator';
  const email = args[1] || 'super.admin@org.com';
  const rawPassword = args[2] || 'Admin@Secure2026';
  const department = args[3] || 'IT Security';

  console.log(`Creating Admin account for: ${email}`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User with email ${email} already exists.`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      department,
      role: Role.ADMIN,
    },
  });

  console.log(`Admin created successfully!`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
  console.log(`Password: ${rawPassword}`);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());