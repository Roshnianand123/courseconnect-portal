import { NextResponse } from 'next/server';
import { getRegistrations, addRegistration } from '@/lib/db';

export async function GET() {
  try {
    const registrations = await getRegistrations();
    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newReg = await addRegistration(body);
    return NextResponse.json({ success: true, registration: newReg }, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register course' },
      { status: 400 }
    );
  }
}
