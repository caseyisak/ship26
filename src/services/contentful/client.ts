const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? 'master';
const DELIVERY_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ?? process.env.CONTENTFUL_CMA_KEY;

/**
 * Resolve a Contentful environment alias (e.g. "master") to its actual
 * environment ID. Cached for the lifetime of the server process.
 * If the env is already a real ID (not an alias), returns it unchanged.
 */
let _resolvedEnv: string | undefined;
export async function resolveEnvironmentAlias(): Promise<string> {
  if (_resolvedEnv) return _resolvedEnv;
  const env = ENVIRONMENT ?? 'master';
  if (!CMA_TOKEN || !SPACE_ID) {
    _resolvedEnv = env;
    return env;
  }
  try {
    const res = await fetch(
      `https://api.contentful.com/spaces/${SPACE_ID}/environment_aliases/${env}`,
      { headers: { Authorization: `Bearer ${CMA_TOKEN}` } },
    );
    if (res.ok) {
      const data = await res.json();
      _resolvedEnv = data?.environment?.sys?.id ?? env;
    } else {
      _resolvedEnv = env;
    }
  } catch {
    _resolvedEnv = env;
  }
  return _resolvedEnv!;
}

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
    body: JSON.stringify({
      query: query.replace(/\s+/g, ' ').trim(),
      variables,
    }),
    next: { revalidate: preview ? 0 : 60 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Contentful GraphQL error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    data?: T;
    errors?: {
      message: string;
      locations?: Array<{ line: number; column: number }>;
      path?: Array<string | number>;
    }[];
  };
  if (json.errors?.length) {
    // Classify errors: unresolvable links are soft (partial data still usable);
    // all other errors are hard (treat as failure).
    const hardErrors = json.errors.filter(
      (e) =>
        (e as { extensions?: { contentful?: { code?: string } } }).extensions
          ?.contentful?.code !== 'UNRESOLVABLE_LINK',
    );
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        '[fetchGraphQL] GraphQL errors:',
        JSON.stringify(json.errors, null, 2),
      );
    }
    if (hardErrors.length > 0 || !json.data) {
      const msgs = hardErrors.map((e) => e.message);
      throw new Error(`Contentful GraphQL errors:\n${msgs.join('\n')}`);
    }
  }
  if (!json.data) {
    throw new Error('Contentful GraphQL: no data');
  }
  return json.data;
}
