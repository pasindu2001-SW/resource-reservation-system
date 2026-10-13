import { prisma } from '@/lib/prisma';
import { ReservationStatus, ResourceStatus } from '@prisma/client';

export interface CreateReservationInput {
  resourceId: string;
  userId: string;
  title: string;
  purpose?: string | null;
  startTime: Date;
  endTime: Date;
  attendeeCount?: number | null;
}

export class ReservationConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReservationConflictError';
  }
}

export class ReservationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReservationValidationError';
  }
}

export class ReservationService {


    // Find overlapping reservations for a given resource and time range, optionally excluding a specific reservation ID (useful for updates).
  static async findOverlappingReservation(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string
  ) {
    return await prisma.reservation.findFirst({
      where: {
        resourceId,
        status: ReservationStatus.CONFIRMED,
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
        // Mathematical overlap condition:
        // existing.startTime < new.endTime AND existing.endTime > new.startTime
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: {
        user: { select: { name: true, department: true } },
      },
    });
  }


  //create a new reservation with all necessary safeguards and concurrency protection.
  static async createReservation(input: CreateReservationInput) {
    const { resourceId, userId, title, purpose, startTime, endTime, attendeeCount } = input;

    // Safeguard 1: Time order check
    if (startTime >= endTime) {
      throw new ReservationValidationError('End time must be strictly after start time.');
    }

    // Safeguard 2: Past time check (with a small 2-minute buffer for clock skew)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (startTime < twoMinutesAgo) {
      throw new ReservationValidationError('Cannot schedule a reservation in the past.');
    }

    // Safeguard 3: Resource status check
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new ReservationValidationError('The selected resource does not exist.');
    }

    if (resource.status === ResourceStatus.MAINTENANCE) {
      throw new ReservationValidationError(
        `"${resource.name}" is currently under maintenance and cannot be reserved.`
      );
    }

    // Safeguard 4: Capacity check
    if (attendeeCount && resource.capacity && attendeeCount > resource.capacity) {
      throw new ReservationValidationError(
        `Attendee count (${attendeeCount}) exceeds the resource capacity (${resource.capacity}).`
      );
    }

    // Safeguard 5 & Concurrency Protection:
    // Execute overlap check + insertion inside a Prisma Transaction
    return await prisma.$transaction(async (tx) => {
      const conflict = await tx.reservation.findFirst({
        where: {
          resourceId,
          status: ReservationStatus.CONFIRMED,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        include: {
          user: { select: { name: true } },
        },
      });

      if (conflict) {
        const conflictStart = conflict.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const conflictEnd = conflict.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        throw new ReservationConflictError(
          `Schedule conflict: This resource is already booked by ${conflict.user.name} from ${conflictStart} to ${conflictEnd}.`
        );
      }

      return await tx.reservation.create({
        data: {
          resourceId,
          userId,
          title,
          purpose: purpose ?? null,
          startTime,
          endTime,
          attendeeCount: attendeeCount ?? null,
          status: ReservationStatus.CONFIRMED,
        },
        include: {
          resource: true,
          user: true,
        },
      });
    });
  }


  //Fetch reservations based on optional filters like resource ID, user ID, date range, and status.
  static async getReservations(filters: {
    resourceId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: ReservationStatus;
  }) {
    const { resourceId, userId, startDate, endDate, status } = filters;

    return await prisma.reservation.findMany({
      where: {
        ...(resourceId ? { resourceId } : {}),
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
        ...(startDate || endDate
          ? {
              AND: [
                ...(startDate ? [{ endTime: { gte: startDate } }] : []),
                ...(endDate ? [{ startTime: { lte: endDate } }] : []),
              ],
            }
          : {}),
      },
      include: {
        resource: true,
        user: { select: { id: true, name: true, email: true, department: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // Cancel a reservation by its ID, changing its status to CANCELLED. soft delete to preserve audit trail
  static async cancelReservation(id: string) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new ReservationValidationError('Reservation not found.');
    }

    return await prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: { resource: true, user: true },
    });
  }
}