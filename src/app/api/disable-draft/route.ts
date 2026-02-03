import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { disable } = await draftMode();
  disable();
  const base = request.nextUrl.origin;
  return NextResponse.redirect(`${base}/`);
}
