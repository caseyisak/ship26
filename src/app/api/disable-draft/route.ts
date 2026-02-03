import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();
  const base = request.nextUrl.origin;
  return NextResponse.redirect(`${base}/`);
}
