import { PrismaClient, Role, ResourceCategory, ResourceStatus, ReservationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with secure hashed passwords...');

  // Clean existing records
  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // Hash standard demo passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const memberPassword = await bcrypt.hash('Member@123', 10);

  // 1. Seed Admin User
  console.log('Creating Admin account...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.admin@org.com',
      password: adminPassword,
      department: 'Operations',
      role: Role.ADMIN,
    },
  });

  // 2. Seed Team Members (Normal Users)
  console.log('Creating Team Member accounts...');
  const devUser = await prisma.user.create({
    data: {
      name: 'Pasindu Balasuriya',
      email: 'pasindu.dev@org.com',
      password: memberPassword,
      department: 'Engineering',
      role: Role.MEMBER,
    },
  });

  const pmUser = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.pm@org.com',
      password: memberPassword,
      department: 'Product',
      role: Role.MEMBER,
    },
  });

  const marketingUser = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.mkt@org.com',
      password: memberPassword,
      department: 'Marketing',
      role: Role.MEMBER,
    },
  });

  // 3. Seed Resources
  console.log('Creating shared organization resources...');
  const boardroom = await prisma.resource.create({
    data: {
      name: 'Boardroom Alpha',
      category: ResourceCategory.MEETING_ROOM,
      location: 'Floor 3 - Executive Wing',
      capacity: 16,
      description: 'Executive boardroom with dual displays, conferencing mic, and whiteboard.',
      status: ResourceStatus.AVAILABLE,
    },
  });

  const huddleRoom = await prisma.resource.create({
    data: {
      name: 'Huddle Room Beta',
      category: ResourceCategory.MEETING_ROOM,
      location: 'Floor 2 - Engineering Wing',
      capacity: 6,
      description: 'Quick sync space with a 55" TV and HDMI hookup.',
      status: ResourceStatus.AVAILABLE,
    },
  });

  const projector = await prisma.resource.create({
    data: {
      name: 'Portable 4K Laser Projector',
      category: ResourceCategory.EQUIPMENT,
      location: 'IT Equipment Locker #4',
      capacity: null,
      description: 'High-lumen portable laser projector with wireless casting kit.',
      status: ResourceStatus.AVAILABLE,
    },
  });

  const companyVan = await prisma.resource.create({
    data: {
      name: 'Toyota HiAce Crew Van',
      category: ResourceCategory.VEHICLE,
      location: 'Basement Parking Bay B-12',
      capacity: 10,
      description: 'Organization shuttle van for client visits and events.',
      status: ResourceStatus.AVAILABLE,
    },
  });

  const brokenRoom = await prisma.resource.create({
    data: {
      name: 'Meeting Room Gamma',
      category: ResourceCategory.MEETING_ROOM,
      location: 'Floor 1 - Reception',
      capacity: 8,
      description: 'Currently undergoing AC maintenance and repainting.',
      status: ResourceStatus.MAINTENANCE,
    },
  });

  // 4. Seed Reservations
  console.log('Creating sample reservations...');
  const today = new Date();
  const slot1Start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0);
  const slot1End = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30, 0);

  const slot2Start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0, 0);
  const slot2End = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0);

  await prisma.reservation.create({
    data: {
      title: 'Sprint Planning & Backlog Grooming',
      purpose: 'Bi-weekly sprint kick-off with engineering.',
      startTime: slot1Start,
      endTime: slot1End,
      attendeeCount: 12,
      status: ReservationStatus.CONFIRMED,
      resourceId: boardroom.id,
      userId: devUser.id,
    },
  });

  await prisma.reservation.create({
    data: {
      title: 'Q4 Product Roadmap Sync',
      purpose: 'Review roadmap milestones with stakeholders.',
      startTime: slot2Start,
      endTime: slot2End,
      attendeeCount: 5,
      status: ReservationStatus.CONFIRMED,
      resourceId: huddleRoom.id,
      userId: pmUser.id,
    },
  });

  console.log('✅ Database seeded with hashed passwords successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });