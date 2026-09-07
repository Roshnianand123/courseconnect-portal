import { NextResponse } from 'next/server';
import { deleteRegistration } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteRegistration(id);
    return NextResponse.json({ success: true, message: `Registration #${id} removed successfully`, result });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete registration' },
      { status: 400 }
    );
  }
}
