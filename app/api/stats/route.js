import { NextResponse } from 'next/server';
import { getStats, getDbStatus } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getStats();
    const dbStatus = await getDbStatus();
    return NextResponse.json({ success: true, stats, dbStatus });
  } catch (error) {
    console.error('Error fetching portal stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
