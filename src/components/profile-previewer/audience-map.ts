// Maps NT audience IDs (nt_audience_id field values) to friendly display names.
// Populated from sandbox-master environment nt_audience entries.
export const AUDIENCE_MAP: Record<string, string> = {
  '1JQvHjL8D17tAiNcZwrUFI': 'Social Media Sourced',
  '31d4VvZiSGuq2XmyvCWj1b': 'High Intent',
  '369df921-8615-4b93-9212-f303a29e08ce': 'Persona B Logged In',
  '11YvgT5sIdBxgQvPccEyPO': 'Customer Type — Returning',
  '4lGcc6sP37mBPDUA7fmxwx': 'Return Visitor — Low Engagement',
  '4R4tisZXLysFGuBY5DAlUj': 'Newsletter Subscribers',
  '68QIUQcYy6JtPpKt2N0Dnr': 'Persona C Logged In',
  '2l6gxfQdOb86ntJ5ZtSdMg': 'Logged In User',
  '1nLRlw8OxGgvQx5cjMsr1J': 'New Visitor',
};

export function getAudienceName(id: string): string {
  return AUDIENCE_MAP[id] ?? `Audience ${id.slice(0, 8)}...`;
}
