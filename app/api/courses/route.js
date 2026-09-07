import { NextResponse } from 'next/server';
import { getCourses, addCourse } from '@/lib/db';

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newCourse = await addCourse(body);
    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create course' },
      { status: 400 }
    );
  }
}
