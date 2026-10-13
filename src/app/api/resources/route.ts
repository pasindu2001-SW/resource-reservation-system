import { NextResponse } from 'next/server';
import { ResourceService } from '@/services/resource.service';
import { ResourceCategory, ResourceStatus } from '@prisma/client';
import { z } from 'zod';

// Zod Schema to validate incoming POST request body when creating a resource
const createResourceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.nativeEnum(ResourceCategory),
  location: z.string().min(2, 'Location is required'),
  capacity: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
});

// GET /api/resources?category=MEETING_ROOM&status=AVAILABLE&search=Boardroom
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ResourceCategory | null;
    const status = searchParams.get('status') as ResourceStatus | null;
    const search = searchParams.get('search') ?? undefined;
    const minCapacityStr = searchParams.get('minCapacity');

    const resources = await ResourceService.getAllResources({
      category: category || undefined,
      status: status || undefined,
      search,
      minCapacity: minCapacityStr ? parseInt(minCapacityStr, 10) : undefined,
    });

    return NextResponse.json({ success: true, data: resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error fetching resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createResourceSchema.parse(body);

    const resource = await ResourceService.createResource(validated);
    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create resource' },
      { status: 500 }
    );
  }
}