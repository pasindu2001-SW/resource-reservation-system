import { NextResponse } from 'next/server';
import { ReservationService, ReservationValidationError } from '@/services/reservation.service';

// PATCH /api/reservations/:id (Cancel reservation)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'CANCEL') {
      const cancelled = await ReservationService.cancelReservation(id);
      return NextResponse.json({ success: true, data: cancelled });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action. Only "CANCEL" is supported.' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ReservationValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error updating reservation' },
      { status: 500 }
    );
  }
}