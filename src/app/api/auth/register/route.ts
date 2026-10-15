import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(2, 'Department is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'A user with this email address already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // SECURITY: Always enforce Role.MEMBER for public registration!
    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        department: validated.department,
        role: Role.MEMBER,
      },
    });

    const tokenPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      department: newUser.department,
      role: newUser.role,
    };

    const token = await createSessionToken(tokenPayload);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        user: tokenPayload,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}