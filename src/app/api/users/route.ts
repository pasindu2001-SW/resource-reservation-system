import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error fetching users' },
      { status: 500 }
    );
  }
}