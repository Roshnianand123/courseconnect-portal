import { NextResponse } from 'next/server';
import { deleteRegistration } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteRegistration(id);
    return NextResponse.json(
      { success: true, message: `Registration #${id} removed successfully`, result },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete registration' },
      { status: 400 }
    );
  }
}
