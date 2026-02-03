import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  draftMode: vi.fn(() => ({
    enable: vi.fn(),
  })),
}));

describe('GET /api/enable-draft', () => {
  const origEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it('returns 400 when secret is missing', async () => {
    process.env.CONTENTFUL_PREVIEW_SECRET = 'expected-secret';
    const { GET } = await import('./route');
    const request = new Request(
      'http://localhost:3000/api/enable-draft?slug=home',
    );
    const response = await GET(request);
    expect(response.status).to.equal(400);
    const body = await response.json();
    expect(body.error).to.include('secret');
  });

  it('returns 400 when slug is missing', async () => {
    process.env.CONTENTFUL_PREVIEW_SECRET = 'test-secret';
    const { GET } = await import('./route');
    const request = new Request(
      'http://localhost:3000/api/enable-draft?secret=test-secret',
    );
    const response = await GET(request);
    expect(response.status).to.equal(400);
    const body = await response.json();
    expect(body.error).to.include('slug');
  });

  it('returns 400 when no query params', async () => {
    const { GET } = await import('./route');
    const request = new Request('http://localhost:3000/api/enable-draft');
    const response = await GET(request);
    expect(response.status).to.equal(400);
  });

  it('returns 400 when slug is unresolved Contentful placeholder', async () => {
    process.env.CONTENTFUL_PREVIEW_SECRET = 'kaz';
    const { GET } = await import('./route');
    const request = new Request(
      'http://localhost:3000/api/enable-draft?secret=kaz&slug=entry.fields.slug_NOT_FOUND&locale=en-US&ctype=page',
    );
    const response = await GET(request);
    expect(response.status).to.equal(400);
    const body = await response.json();
    expect(body.error).to.include('Invalid slug');
    expect(body.received).to.equal('entry.fields.slug_NOT_FOUND');
  });
});
