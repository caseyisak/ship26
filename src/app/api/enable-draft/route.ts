import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const PREVIEW_SECRET =
  process.env.CONTENTFUL_PREVIEW_SECRET ?? process.env.PREVIEW_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const entryId = searchParams.get('entryId');
  const typeParam = searchParams.get('type');
  const ctypeParam = searchParams.get('ctype');
  /** Contentful can send type as "ctype" (e.g. ctype=hero); accept both. */
  const type = typeParam ?? ctypeParam;

  if (!PREVIEW_SECRET || secret !== PREVIEW_SECRET) {
    return NextResponse.json(
      { error: 'Invalid or missing secret' },
      { status: 400 },
    );
  }

  const base = request.nextUrl.origin;

  // ID-based preview (e.g. Hero, TabbedContent, DataViz, BlogPost, Banner, SocialPost): redirect to /preview/[type]/[entryId]
  if (
    entryId &&
    (type === 'hero' ||
      type === 'tabbedContent' ||
      type === 'dataViz' ||
      type === 'blogPost' ||
      type === 'banner' ||
      type === 'socialPost')
  ) {
    if (
      entryId.includes('entry.') ||
      entryId.includes('NOT_FOUND') ||
      entryId.length < 10
    ) {
      return NextResponse.json(
        {
          error:
            'Contentful did not substitute the entry ID. Fix in Contentful: Settings → Content preview → ' +
            (type === 'hero'
              ? 'Hero'
              : type === 'dataViz'
                ? 'Data Viz'
                : type === 'blogPost'
                  ? 'Blog Post'
                  : 'TabbedContent') +
            ' → set Preview URL and use the Entry ID merge tag (e.g. {{entry.sys.id}} or insert "Entry ID" / "System → ID") so the URL contains the real ID, not a placeholder.',
          received: entryId,
        },
        { status: 400 },
      );
    }
    // Map camelCase type params to kebab-case route segments
    const typeToRoute: Record<string, string> = {
      hero: 'hero',
      tabbedContent: 'tabbed-content',
      dataViz: 'data-viz',
      blogPost: 'blog-post',
      banner: 'banner',
      socialPost: 'social-post',
    };
    const routeSegment = typeToRoute[type] ?? type;
    const redirectUrl = `${base}/preview/${routeSegment}/${encodeURIComponent(entryId)}`;
    const res = NextResponse.redirect(redirectUrl);
    try {
      const draft = await draftMode();
      draft.enable();
    } catch {
      res.cookies.set('__prerender_bypass', '1', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60,
      });
    }
    return res;
  }

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug or entryId+type for redirect' },
      { status: 400 },
    );
  }

  // Contentful sends literal "entry.fields.slug_NOT_FOUND" when the preview URL template
  // doesn't resolve the slug variable (e.g. wrong merge tag or entry has no slug).
  if (
    slug.includes('entry.fields') ||
    slug.includes('NOT_FOUND') ||
    slug.startsWith('entry.')
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid slug: preview URL template in Contentful is not resolving. Use the slug merge tag for your Page content type (e.g. {{entry.fields.slug}} or the UI slug variable) and ensure the entry has a slug.',
        received: slug,
      },
      { status: 400 },
    );
  }

  // Add ?preview=true so the page can detect preview mode even if the draft cookie doesn't
  // persist in cross-site iframe context (Contentful embeds our app from a different origin).
  const redirectUrl = `${base}/page/${encodeURIComponent(slug)}?preview=true`;
  const res = NextResponse.redirect(redirectUrl);

  try {
    const draft = await draftMode();
    draft.enable();
  } catch {
    // Fallback when enable() throws (e.g. Turbopack): set bypass cookie so draftMode().isEnabled is true
    res.cookies.set('__prerender_bypass', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
  }
  return res;
}
