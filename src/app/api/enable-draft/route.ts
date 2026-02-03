import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const PREVIEW_SECRET =
  process.env.CONTENTFUL_PREVIEW_SECRET ?? process.env.PREVIEW_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  if (!PREVIEW_SECRET || secret !== PREVIEW_SECRET) {
    return NextResponse.json(
      { error: 'Invalid or missing secret' },
      { status: 400 },
    );
  }

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug for redirect' },
      { status: 400 },
    );
  }

  const { enable } = await draftMode();
  enable();

  const base = request.nextUrl.origin;
  const redirectUrl = `${base}/page/${encodeURIComponent(slug)}`;
  return NextResponse.redirect(redirectUrl);
}
