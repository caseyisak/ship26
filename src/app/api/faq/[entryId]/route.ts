import { NextResponse } from 'next/server';

import { getFaqByEntryId } from '@/services/contentful/faq';

export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const faq = await getFaqByEntryId({ entryId });
  if (!faq) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(faq);
}
