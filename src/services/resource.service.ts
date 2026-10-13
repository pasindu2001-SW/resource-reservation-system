import { prisma } from '@/lib/prisma';
import { ResourceCategory, ResourceStatus } from '@prisma/client';

export interface ResourceFilterParams {
  category?: ResourceCategory;
  status?: ResourceStatus;
  search?: string;
  minCapacity?: number;
}

export class ResourceService {
  // Fetch all resources with optional filters for category, status, search term, and minimum capacity.
  static async getAllResources(filters: ResourceFilterParams = {}) {
    const { category, status, search, minCapacity } = filters;

    return await prisma.resource.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
        ...(minCapacity ? { capacity: { gte: minCapacity } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        // Include active upcoming reservations so UI can show current occupancy
        reservations: {
          where: {
            status: 'CONFIRMED',
            endTime: { gte: new Date() },
          },
          orderBy: { startTime: 'asc' },
          take: 3,
        },
      },
    });
  }

  //Fetch a single resource by its ID, including its upcoming confirmed reservations and the users who made those reservations.
  static async getResourceById(id: string) {
    return await prisma.resource.findUnique({
      where: { id },
      include: {
        reservations: {
          where: { status: 'CONFIRMED' },
          orderBy: { startTime: 'asc' },
          include: {
            user: { select: { id: true, name: true, department: true } },
          },
        },
      },
    });
  }


  //create a new resource for admin
  static async createResource(data: {
    name: string;
    category: ResourceCategory;
    location: string;
    capacity?: number | null;
    description?: string | null;
    status?: ResourceStatus;
  }) {
    return await prisma.resource.create({
      data: {
        name: data.name,
        category: data.category,
        location: data.location,
        capacity: data.capacity ?? null,
        description: data.description ?? null,
        status: data.status ?? ResourceStatus.AVAILABLE,
      },
    });
  }


  //update an existing resource
  static async updateResource(
    id: string,
    data: {
      name?: string;
      category?: ResourceCategory;
      location?: string;
      capacity?: number | null;
      description?: string | null;
      status?: ResourceStatus;
    }
  ) {
    return await prisma.resource.update({
      where: { id },
      data,
    });
  }
}