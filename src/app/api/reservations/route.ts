import { NextResponse } from 'next/server';
import {
  ReservationService,
  ReservationConflictError,
  ReservationValidationError,
} from '@/services/reservation.service';
import { ReservationStatus } from '@prisma/client';
import { z } from 'zod';

const createReservationSchema = z.object({
  resourceId: z.string().uuid('Invalid resource ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  purpose: z.string().nullable().optional(),
  startTime: z.string().datetime({ message: 'Start time must be a valid ISO 8601 date string' }),
  endTime: z.string().datetime({ message: 'End time must be a valid ISO 8601 date string' }),
  attendeeCount: z.number().int().positive().nullable().optional(),
});

// GET /api/reservations?resourceId=...&startDate=...&endDate=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId') ?? undefined;
    const userId = searchParams.get('userId') ?? undefined;
    const status = (searchParams.get('status') as ReservationStatus) ?? undefined;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const reservations = await ReservationService.getReservations({
      resourceId,
      userId,
      status,
      startDate: startDateStr ? new Date(startDateStr) : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined,
    });

    return NextResponse.json({ success: true, data: reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error fetching reservations' },
      { status: 500 }
    );
  }
}

// POST /api/reservations (Create new reservation with conflict detection)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createReservationSchema.parse(body);

    const reservation = await ReservationService.createReservation({
      resourceId: validated.resourceId,
      userId: validated.userId,
      title: validated.title,
      purpose: validated.purpose,
      startTime: new Date(validated.startTime),
      endTime: new Date(validated.endTime),
      attendeeCount: validated.attendeeCount,
    });

    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (error) {
    // 1. Zod Validation Error (Malformed input)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    // 2. Schedule Conflict (Overlapping reservation exists!) -> Return 409 Conflict
    if (error instanceof ReservationConflictError) {
      return NextResponse.json(
        { success: false, code: 'CONFLICT', message: error.message },
        { status: 409 }
      );
    }

    // 3. Business Rule Validation Error (Past time, under maintenance, over capacity) -> Return 400
    if (error instanceof ReservationValidationError) {
      return NextResponse.json(
        { success: false, code: 'VALIDATION_ERROR', message: error.message },
        { status: 400 }
      );
    }

    // 4. Unexpected server error
    console.error('Unexpected reservation creation error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
}