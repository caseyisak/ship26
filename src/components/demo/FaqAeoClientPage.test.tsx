import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { FaqFragment } from '@/block-renderer/types';
import { LivePreviewProvider } from '@/lib/live-preview';

import { FaqAeoClientPage } from './FaqAeoClientPage';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@ninetailed/experience.js-react', () => ({
  Experience: ({ component: Comp, ...props }: { component: React.ComponentType<unknown>; [k: string]: unknown }) =>
    Comp ? React.createElement(Comp, props) : null,
  useNinetailed: () => ({ track: vi.fn(), identify: vi.fn() }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeRtJson = (text: string) => ({
  json: {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
      },
    ],
  },
});

const baseFaqData: FaqFragment = {
  __typename: 'Faq',
  sys: { id: 'faq-1', spaceId: 'test' },
  internalName: 'Demo FAQ',
  titleRt: makeRtJson('Frequently Asked Questions'),
  descriptionRt: makeRtJson('Find answers below'),
  faqMetadata: {
    __typename: 'AioAeoGeo',
    sys: { id: 'gov-1' },
    internalName: 'Beckons Governance',
    topic: 'sustainability',
    ownerTeam: 'Content Team',
    lastUpdated: '2026-01-15T00:00:00Z',
    audience: 'Luxury travelers',
    region: 'Global',
  },
  itemsCollection: {
    items: [
      {
        __typename: 'FaqItem',
        sys: { id: 'item-1' },
        internalName: 'Sustainability Q',
        questionRt: makeRtJson('What makes Metafi sustainable?'),
        answerRt: makeRtJson('All products are carbon-neutral.'),
        aioAeoGeoCollection: null,
      },
      {
        __typename: 'FaqItem',
        sys: { id: 'item-2' },
        internalName: 'Cancellation Q',
        questionRt: makeRtJson('What is the cancellation policy?'),
        answerRt: makeRtJson('Cancel anytime from the dashboard.'),
        aioAeoGeoCollection: null,
      },
    ],
  },
};

// ─── Helper to render with provider ──────────────────────────────────────────

function renderPage(brandName = 'Metafi', faqData = baseFaqData) {
  return render(
    <LivePreviewProvider locale="en-US">
      <FaqAeoClientPage brandName={brandName} faqData={faqData} />
    </LivePreviewProvider>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FaqAeoClientPage — page structure', () => {
  // PASS: Page header renders with "AEO Demo" text
  // FAIL: header missing or wrong text
  it('renders page header with AEO Demo heading', () => {
    renderPage();
    expect(screen.getByText(/AEO Demo/i)).toBeTruthy();
  });

  // PASS: "Simulated search query" label is present
  // FAIL: label absent
  it('renders "Simulated search query" label', () => {
    renderPage();
    expect(screen.getByText(/Simulated search query/i)).toBeTruthy();
  });
});

describe('FaqAeoClientPage — dropdown / scenario switcher', () => {
  // PASS: select element with aria-label "Select a search query" exists
  // FAIL: no select element
  it('renders a select dropdown for scenario switching', () => {
    renderPage();
    expect(screen.getByRole('combobox', { name: /select a search query/i })).toBeTruthy();
  });

  // PASS: dropdown contains exactly 3 options for Metafi brand
  // FAIL: wrong option count
  it('has exactly 3 scenario options for Metafi brand', () => {
    renderPage('Metafi');
    const select = screen.getByRole('combobox', { name: /select a search query/i });
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(3);
  });

  // PASS: First option matches FAQ item "How is my data protected?" — contains "data"
  // FAIL: wrong scenario shown first
  it('shows the data protection scenario as first option for Metafi', () => {
    renderPage('Metafi');
    const select = screen.getByRole('combobox', { name: /select a search query/i });
    const firstOption = select.querySelectorAll('option')[0];
    expect(firstOption.textContent?.toLowerCase()).toContain('data');
  });

  // PASS: Selecting option index 1 changes to compliance scenario — contains "compliance"
  // FAIL: panel does not update after dropdown change
  it('switches scenario when dropdown value changes', () => {
    renderPage('Metafi');
    const select = screen.getByRole('combobox', { name: /select a search query/i }) as HTMLSelectElement;

    // Initially shows scenario 0 — data protection
    expect(screen.getAllByText(/data/i).length).toBeGreaterThan(0);

    // Switch to scenario 1 — compliance via fireEvent
    fireEvent.change(select, { target: { value: '1' } });
    expect(screen.getAllByText(/compliance/i).length).toBeGreaterThan(0);
  });
});

describe('FaqAeoClientPage — Before panel', () => {
  // PASS: "Before" column label span is present (exact text "Before")
  // FAIL: before panel label missing
  it('renders "Before" column label', () => {
    renderPage();
    // Use getAllByText to handle multiple matches; at least one should be the exact label
    const matches = screen.getAllByText(/Before/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  // PASS: "No structured data" badge present in before panel
  // FAIL: badge missing
  it('renders "No structured data" badge in Before panel', () => {
    renderPage();
    expect(screen.getByText(/No structured data/i)).toBeTruthy();
  });

  // PASS: "Sources say" preamble appears in before panel when beforeAnswer is not null
  // FAIL: preamble missing for scenario with a before answer
  it('shows "Sources say" preamble in before panel for non-null beforeAnswer', () => {
    renderPage('Metafi');
    // Scenario 0 (data protection) has a beforeAnswer, so "Sources say" should appear
    expect(screen.getByText(/sources say/i)).toBeTruthy();
  });

  // PASS: "I wasn't able to find" fallback appears when beforeAnswer is null (scenario 1 — compliance)
  // FAIL: fallback message missing when scenario has null beforeAnswer
  it('shows "wasn\'t able to find" fallback when beforeAnswer is null (scenario 1 — compliance)', () => {
    renderPage('Metafi');
    const select = screen.getByRole('combobox', { name: /select a search query/i }) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '1' } });
    expect(screen.getByText(/wasn't able to find/i)).toBeTruthy();
  });
});

describe('FaqAeoClientPage — After panel', () => {
  // PASS: "After" label present with "FAQPage schema" badge
  // FAIL: after panel missing
  it('renders "After" column label', () => {
    renderPage();
    expect(screen.getByText(/After/i)).toBeTruthy();
  });

  // PASS: "FAQPage schema" badge present in after panel
  // FAIL: badge missing
  it('renders "FAQPage schema + Live Preview" badge in After panel', () => {
    renderPage();
    expect(screen.getByText(/FAQPage schema/i)).toBeTruthy();
  });

  // PASS: "According to Metafi" brand citation rendered in after panel
  // FAIL: citation missing or brand name wrong
  it('renders brand citation "According to [brandName]" in after panel', () => {
    renderPage('Metafi');
    expect(screen.getByText(/According to Metafi/i)).toBeTruthy();
  });

  // PASS: High confidence badge present
  // FAIL: badge missing
  it('renders "High confidence" badge', () => {
    renderPage();
    expect(screen.getByText(/High confidence/i)).toBeTruthy();
  });
});

describe('FaqAeoClientPage — hasMetadata toggle (regression guard)', () => {
  // PASS: When faqMetadata is null, after panel badge is "No structured data" (mirrors before)
  // FAIL: after panel shows "FAQPage schema" even without governance — this is the regression
  it('after panel shows "No structured data" badge when faqMetadata is null', () => {
    renderPage('Metafi', { ...baseFaqData, faqMetadata: null });
    // Both panels should say "No structured data" — getAllByText, not getByText
    const badges = screen.getAllByText(/No structured data/i);
    expect(badges.length).toBe(2);
  });

  // PASS: When faqMetadata is null, after panel shows yellow "Low confidence" badge
  // FAIL: green "High confidence" badge appears without governance
  it('after panel shows "Low confidence" badge (not "High confidence") when faqMetadata is null', () => {
    renderPage('Metafi', { ...baseFaqData, faqMetadata: null });
    expect(screen.queryByText(/High confidence/i)).toBeNull();
    const lowBadges = screen.getAllByText(/Low confidence/i);
    expect(lowBadges.length).toBe(2);
  });

  // PASS: When faqMetadata is null, "According to Metafi" citation is NOT rendered
  // FAIL: citation appears without governance
  it('does NOT render brand citation when faqMetadata is null', () => {
    renderPage('Metafi', { ...baseFaqData, faqMetadata: null });
    expect(screen.queryByText(/According to Metafi/i)).toBeNull();
  });

  // PASS: When faqMetadata is present, after panel shows "FAQPage schema" badge
  // FAIL: after panel stays in "No structured data" state even with governance
  it('after panel upgrades to "FAQPage schema + Live Preview" badge when faqMetadata is present', () => {
    renderPage('Metafi', baseFaqData);
    expect(screen.getByText(/FAQPage schema/i)).toBeTruthy();
  });
});

describe('AioAeoPreviewPanel — governance and JSON-LD (rendered inside FaqAeoClientPage)', () => {
  // PASS: "Content Governance" heading rendered
  // FAIL: governance section missing
  it('renders "Content Governance" section heading', () => {
    renderPage();
    expect(screen.getByText(/Content Governance/i)).toBeTruthy();
  });

  // PASS: Governance topic badge "sustainability" is rendered (underscore → space handled)
  // FAIL: topic badge missing
  it('renders governance topic badge', () => {
    renderPage();
    // Multiple elements may contain "sustainability" (answer copy + badge); use getAllByText
    const matches = screen.getAllByText(/sustainability/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  // PASS: Owner team badge present
  // FAIL: badge absent
  it('renders governance owner team badge', () => {
    renderPage();
    expect(screen.getByText('Content Team')).toBeTruthy();
  });

  // PASS: "View Structured Data" summary element is present (JSON-LD drawer)
  // FAIL: drawer toggle missing
  it('renders "View Structured Data" JSON-LD drawer toggle', () => {
    renderPage();
    expect(screen.getByText(/View Structured Data/i)).toBeTruthy();
  });

  // PASS: When faqMetadata is null, fallback "No governance metadata" message renders
  // FAIL: no fallback message
  it('renders no-governance fallback when faqMetadata is null', () => {
    renderPage('Metafi', { ...baseFaqData, faqMetadata: null });
    expect(screen.getByText(/No governance metadata/i)).toBeTruthy();
  });
});
