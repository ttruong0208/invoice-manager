import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, days } = body;

    if (!userId || !days || days <= 0) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    let newExpiryDate: Date;

    if (!user.expiryDate || user.expiryDate < now) {
      // If expired or never activated, set from now
      newExpiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    } else {
      // If still valid, extend from current expiry
      newExpiryDate = new Date(user.expiryDate.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { expiryDate: newExpiryDate },
    });

    return NextResponse.json({
      message: 'User extended successfully',
      expiryDate: updatedUser.expiryDate,
    });
  } catch (error) {
    console.error('Error extending user:', error);
    return NextResponse.json(
      { error: 'Failed to extend user' },
      { status: 500 }
    );
  }
}
