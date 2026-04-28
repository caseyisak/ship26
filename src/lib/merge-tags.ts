/**
 * Merge tag resolution for rich text content.
 * Replaces {{key}} tokens in Contentful rich text document text nodes
 * with values from the NT profile traits.
 */

type RichTextNode = {
  nodeType: string;
  value?: string;
  marks?: unknown[];
  data?: unknown;
  content?: RichTextNode[];
};

/**
 * Recursively walk a Contentful rich text document and replace
 * {{key}} tokens in text nodes with trait values.
 */
export function resolveMergeTagsInDoc(
  doc: RichTextNode | null | undefined,
  traits: Record<string, unknown>,
): RichTextNode | null {
  if (!doc) return null;
  return walkNode(doc, traits);
}

function walkNode(node: RichTextNode, traits: Record<string, unknown>): RichTextNode {
  if (node.nodeType === 'text' && typeof node.value === 'string') {
    return {
      ...node,
      value: resolveMergeTagString(node.value, traits),
    };
  }
  if (node.content) {
    return {
      ...node,
      content: node.content.map((child) => walkNode(child, traits)),
    };
  }
  return node;
}

/**
 * Replace {{key}} tokens in a plain string with trait values.
 * Unknown keys are left as-is (not replaced with empty string).
 */
export function resolveMergeTagString(
  template: string,
  traits: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = traits[key];
    return val !== undefined && val !== null ? String(val) : match;
  });
}

/** The supported merge tags for use in Contentful copy */
export const MERGE_TAG_REFERENCE = [
  { tag: '{{first_name}}',    description: 'Visitor first name',              example: 'Alex' },
  { tag: '{{last_name}}',     description: 'Visitor last name',               example: 'Demo' },
  { tag: '{{display_name}}',  description: 'Display name (same as label)',     example: 'New Visitor' },
  { tag: '{{location}}',      description: 'City or region',                  example: 'Chicago' },
  { tag: '{{customer_type}}', description: 'Customer tier key',               example: 'returning' },
  { tag: '{{industry}}',      description: 'Industry vertical',               example: 'healthcare' },
] as const;
