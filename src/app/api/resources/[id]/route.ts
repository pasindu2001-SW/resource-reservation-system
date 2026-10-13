import { NextResponse } from 'next/server';
import { ResourceService } from '@/services/resource.service';
import { ResourceCategory, ResourceStatus } from '@prisma/client';
import { z } from 'zod';

const updateResourceSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.nativeEnum(ResourceCategory).optional(),
  location: z.string().min(2).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(ResourceStatus).optional(),
});

// GET /api/resources/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await ResourceService.getResourceById(id);

    if (!resource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching resource' },
      { status: 500 }
    );
  }
}

// PATCH /api/resources/:id (Used to toggle MAINTENANCE status or edit details)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateResourceSchema.parse(body);

    const updated = await ResourceService.updateResource(id, validated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update resource' },
      { status: 500 }
    );
  }
}