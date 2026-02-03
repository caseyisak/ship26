const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? 'master';
const DELIVERY_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;

export async function fetchGraphQL<T>({
  query,
  variables = {},
  preview = false,
}: {
  query: string;
  variables?: Record<string, unknown>;
  preview?: boolean;
}): Promise<T> {
  const token = preview ? PREVIEW_TOKEN : DELIVERY_TOKEN;
  if (!SPACE_ID || !token) {
    throw new Error(
      'Contentful: CONTENTFUL_SPACE_ID and access token must be set',
    );
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: preview ? 0 : 60 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Contentful GraphQL error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(
      `Contentful GraphQL: ${json.errors.map((e) => e.message).join(', ')}`,
    );
  }
  if (!json.data) {
    throw new Error('Contentful GraphQL: no data');
  }
  return json.data;
}
