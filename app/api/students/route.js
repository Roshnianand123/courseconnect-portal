import { NextResponse } from 'next/server';
import { getStudents, addStudent } from '@/lib/db';

export async function GET() {
  try {
    const students = await getStudents();
    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newStudent = await addStudent(body);
    return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student' },
      { status: 400 }
    );
  }
}
