import { NextResponse } from 'next/server';

export async function GET() {
  // Prevent noisy 404 requests for favicon in browser console.
  return new NextResponse(null, { status: 204 });
}
