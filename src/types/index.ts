import { ResourceCategory, ResourceStatus, ReservationStatus, Role } from '@prisma/client';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  createdAt: string;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  location: string;
  capacity: number | null;
  description: string | null;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
  reservations?: Reservation[];
}

export interface Reservation {
  id: string;
  title: string;
  purpose: string | null;
  startTime: string;
  endTime: string;
  attendeeCount: number | null;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  resourceId: string;
  resource?: Resource;
  userId: string;
  user?: User;
}