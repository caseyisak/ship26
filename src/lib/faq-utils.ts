export function extractPlainText(rt: { json: Record<string, unknown> } | null | undefined): string {
  if (!rt?.json) return '';
  try {
    const doc = rt.json as { content?: Array<{ content?: Array<{ value?: string }> }> };
    return (
      doc.content
        ?.flatMap((block) => block.content ?? [])
        .map((n) => n.value ?? '')
        .join('') ?? ''
    );
  } catch {
    return '';
  }
}
