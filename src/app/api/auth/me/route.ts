// export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({ success: true, user: session });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify session' },
      { status: 500 }
    );
  }
}