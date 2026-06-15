// Maps NT audience IDs (nt_audience_id field values) to friendly display names.
// Populated from ship-vercel Contentful environment nt_audience entries.
export const AUDIENCE_MAP: Record<string, string> = {
  '6MtN6OUgqEDmQmr1Qx7tyt': 'Amber — Explorer',
  '3ExwxjXXhbjWpQguGyvR7N': 'Jordan — Platinum Returning',
  '1JQvHjL8D17tAiNcZwrUFI': 'Social Media Sourced',
  '68QIUQcYy6JtPpKt2N0Dnr': 'Persona C Logged In',
  '5NLLFtjqFfRsTPzB977Qd': 'Persona B Logged In',
  '31d4VvZiSGuq2XmyvCWj1b': 'High Intent',
  '11YvgT5sIdBxgQvPccEyPO': 'Customer Type — Returning',
  '4lGcc6sP37mBPDUA7fmxwx': 'Return Visitor — Low Engagement',
  '4R4tisZXLysFGuBY5DAlUj': 'Newsletter Subscribers',
  '2l6gxfQdOb86ntJ5ZtSdMg': 'Logged In User',
  '1nLRlw8OxGgvQx5cjMsr1J': 'New Visitor',
  '3rG8icRmoreA1OF0T6Cdge': 'Lamp Shopper (AI Discovery)',
};

export function getAudienceName(id: string): string {
  return AUDIENCE_MAP[id] ?? `Audience ${id.slice(0, 8)}...`;
}
