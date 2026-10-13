import { PrismaClient, Role, ResourceCategory, ResourceStatus, ReservationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing records in reverse dependency order (to avoid foreign key constraint errors)
  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log('Creating users across departments...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.admin@org.com',
      department: 'Operations',
      role: Role.ADMIN,
    },
  });

  const devUser = await prisma.user.create({
    data: {
      name: 'Pasindu Balasuriya',
      email: 'pasindu.dev@org.com',
      department: 'Engineering',
      role: Role.MEMBER,
    },
  });

  const pmUser = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.pm@org.com',
      department: 'Product',
      role: Role.MEMBER,
    },
  });

  const marketingUser = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.mkt@org.com',
      department: 'Marketing',
      role: Role.MEMBER,
    },
  });

  // 3. Seed Resources (Meeting Rooms, Equipment, Vehicles, Workspaces)
  console.log('Creating shared organization resources...');
  const boardroom = await prisma.resource.create({
    data: {
      name: 'Boardroom Alpha',
      category: ResourceCategory.MEETING_ROOM,
      location: 'Floor 3 - Executive Wing',
      capacity: 16,
      description: 'Main executive boardroom with dual 4K displays, conferencing mic, and whiteboard.',
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
      capacity: null, // Equipment does not have seat capacity
      description: 'High-lumen portable laser projector with wireless HDMI casting kit.',
      status: ResourceStatus.AVAILABLE,
    },
  });

  const companyVan = await prisma.resource.create({
    data: {
      name: 'Toyota HiAce Crew Van',
      category: ResourceCategory.VEHICLE,
      location: 'Basement Parking Bay B-12',
      capacity: 10,
      description: 'Organization shuttle van for client visits and team events.',
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
      status: ResourceStatus.MAINTENANCE, // Demonstrates operational safeguard!
    },
  });

  // 4. Seed Existing Sample Reservations (To demonstrate schedule & conflict checking)
  console.log('Creating sample reservations...');
  
  // Calculate relative timestamps for today
  const today = new Date();
  const slot1Start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0); // Today 10:00 AM
  const slot1End = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30, 0);   // Today 11:30 AM

  const slot2Start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0); // Today 2:00 PM
  const slot2End = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0);   // Today 3:00 PM

  await prisma.reservation.create({
    data: {
      title: 'Sprint Planning & Backlog Grooming',
      purpose: 'Bi-weekly sprint kick-off with the core development team.',
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

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });