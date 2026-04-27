import { fetchGraphQL } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmbeddedEntry = {
  sys: { id: string };
  __typename?: string;
  // BlogPost fields
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  heroImage?: { url?: string | null } | null;
  // TwoAcross fields
  eyebrowRt?: { json: unknown } | null;
  headingRt?: { json: unknown } | null;
  body?: { json: unknown } | null;
  media?: { url?: string | null } | null;
  mediaAltText?: string | null;
  mediaPosition?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  colorVariant?: string | null;
  // Hero + Banner RT fields
  headlineRt?: { json: unknown } | null;
  subheadlineRt?: { json: unknown } | null;
  ctaText?: string | null;
  // Hero legacy (kept for type compat, not queried)
  headline?: string | null;
  subheadline?: string | null;
  background?: { url?: string | null } | null;
  image?: { url?: string | null } | null;
  variant?: string | null;
  // Banner RT fields
  headlineRt?: { json: unknown } | null;
  subheadlineRt?: { json: unknown } | null;
};

export type NewsletterLinkedEntry = {
  sys: { id: string };
  __typename?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  heroImage?: { url?: string | null } | null;
  eyebrowRt?: { json: unknown } | null;
  headingRt?: { json: unknown } | null;
  media?: { url?: string | null } | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  colorVariant?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  ctaText?: string | null;
  background?: { url?: string | null } | null;
};

export type Newsletter = {
  __typename: 'Newsletter';
  sys: { id: string };
  internalName?: string | null;
  title?: string | null;
  sender?: string | null;
  replyToEmail?: string | null;
  subjectLine?: string | null;
  date?: string | null;
  teaser?: string | null;
  slug?: string | null;
  leadStory?: NewsletterLinkedEntry | null;
  promoSlot?: NewsletterLinkedEntry | null;
  content?: {
    json: unknown;
    links?: {
      entries?: {
        block?: Array<EmbeddedEntry | null>;
      };
    };
  } | null;
};

// ─── Raw GraphQL response types ───────────────────────────────────────────────

type RawNewsletter = {
  __typename?: string;
  sys: { id: string };
  internalName?: string | null;
  title?: string | null;
  sender?: string | null;
  replyToEmail?: string | null;
  subjectLine?: string | null;
  date?: string | null;
  teaser?: string | null;
  slug?: string | null;
  leadStory?: NewsletterLinkedEntry | null;
  promoSlot?: NewsletterLinkedEntry | null;
  content?: {
    json: unknown;
    links?: {
      entries?: {
        block?: Array<EmbeddedEntry | null>;
      };
    };
  } | null;
};

type NewsletterBySlugResponse = {
  newsletterCollection: { items: Array<RawNewsletter | null> };
};

type NewsletterByIdResponse = {
  newsletterCollection: { items: Array<RawNewsletter | null> };
};

// ─── GraphQL fragments ────────────────────────────────────────────────────────

const NEWSLETTER_FIELDS = `
  __typename
  sys { id }
  internalName
  title
  sender
  replyToEmail
  subjectLine
  date
  teaser
  leadStory {
    ... on Entry { sys { id } __typename }
    ... on BlogPost { title slug excerpt heroImage { url } }
  }
  promoSlot {
    ... on Entry { sys { id } __typename }
    ... on BlogPost { title slug excerpt heroImage { url } }
    ... on TwoAcross { eyebrowRt { json } headingRt { json } media { url } ctaLabel ctaUrl colorVariant }
    ... on Banner { headlineRt { json } subheadlineRt { json } ctaText ctaUrl colorVariant }
  }
  content {
    json
    links {
      entries {
        block {
          ... on Entry { sys { id } __typename }
          ... on BlogPost {
            title
            slug
            excerpt
            heroImage { url }
          }
          ... on TwoAcross {
            eyebrowRt { json }
            headingRt { json }
            body { json }
            media { url }
            mediaAltText
            mediaPosition
            ctaLabel
            ctaUrl
            colorVariant
          }
          ... on Hero {
            headlineRt { json }
            subheadlineRt { json }
            ctaText
            ctaUrl
            background { url }
            media { url }
          }
          ... on Banner {
            headlineRt { json }
            subheadlineRt { json }
            ctaText
            ctaUrl
            variant
            colorVariant
          }
        }
      }
    }
  }
`;

const NEWSLETTER_BY_SLUG = `
  query NewsletterBySlug($slug: String!, $preview: Boolean) {
    newsletterCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
      items { ${NEWSLETTER_FIELDS} }
    }
  }
`;

const NEWSLETTER_BY_ID = `
  query NewsletterById($id: String!, $preview: Boolean) {
    newsletterCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
      items { ${NEWSLETTER_FIELDS} }
    }
  }
`;

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapNewsletter(
  raw: RawNewsletter | null | undefined,
): Newsletter | null {
  if (!raw) return null;
  return {
    __typename: 'Newsletter',
    sys: raw.sys,
    internalName: raw.internalName ?? null,
    title: raw.title ?? null,
    sender: raw.sender ?? null,
    replyToEmail: raw.replyToEmail ?? null,
    subjectLine: raw.subjectLine ?? null,
    date: raw.date ?? null,
    teaser: raw.teaser ?? null,
    slug: raw.slug ?? null,
    leadStory: raw.leadStory ?? null,
    promoSlot: raw.promoSlot ?? null,
    content: raw.content ?? null,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

/** Fetch a single newsletter by slug (published). */
export async function getNewsletterBySlug(
  slug: string,
  preview = false,
): Promise<Newsletter | null> {
  try {
    const data = await fetchGraphQL<NewsletterBySlugResponse>({
      query: NEWSLETTER_BY_SLUG,
      variables: { slug, preview },
      preview,
    });
    const item = data.newsletterCollection?.items?.[0] ?? null;
    return mapNewsletter(item);
  } catch {
    return null;
  }
}

/** Fetch a single newsletter by entry ID (for preview route). */
export async function getNewsletterById(
  id: string,
  preview = true,
): Promise<Newsletter | null> {
  try {
    const data = await fetchGraphQL<NewsletterByIdResponse>({
      query: NEWSLETTER_BY_ID,
      variables: { id, preview },
      preview,
    });
    const item = data.newsletterCollection?.items?.[0] ?? null;
    return mapNewsletter(item);
  } catch {
    return null;
  }
}
