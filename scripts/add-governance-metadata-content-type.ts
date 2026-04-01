/**
 * Adds governance metadata fields to a Contentful content type (from "Governing AI with
 * Structured Content": provenance, taxonomy, versioning, approval).
 *
 * Usage:
 *   CONTENTFUL_SPACE_ID=zq9l8zsrgrh3 CONTENTFUL_MANAGEMENT_ACCESS_TOKEN=... \
 *   bun run scripts/add-governance-metadata-content-type.ts [entryId]
 *
 * If entryId is omitted, uses 7p3GHD1rnuX0PloSmio2c5 (from the provided Contentful entry URL).
 */
import * as contentful from "contentful-management";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID ?? "";
const ENV_ID = "master";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ?? "";
const DEFAULT_ENTRY_ID = "7p3GHD1rnuX0PloSmio2c5";

const GOVERNANCE_FIELDS: Array<{
  id: string;
  name: string;
  type: "Symbol" | "Text" | "Integer" | "Number" | "Boolean" | "Date" | "Object";
  required?: boolean;
  items?: { type: "Symbol" };
}> = [
  {
    id: "documentType",
    name: "Document Type",
    type: "Symbol",
    required: false,
  },
  {
    id: "contentVersion",
    name: "Content Version",
    type: "Symbol",
    required: false,
  },
  {
    id: "governanceStatus",
    name: "Governance Status",
    type: "Symbol",
    required: false,
  },
  {
    id: "sourceSystem",
    name: "Source System",
    type: "Symbol",
    required: false,
  },
  {
    id: "effectiveDate",
    name: "Effective Date",
    type: "Date",
    required: false,
  },
  {
    id: "expiryDate",
    name: "Expiry Date",
    type: "Date",
    required: false,
  },
  {
    id: "taxonomyTags",
    name: "Taxonomy Tags",
    type: "Symbol",
    required: false,
    // Contentful "List" is Array of Symbol
  },
  {
    id: "lastApprovedAt",
    name: "Last Approved At",
    type: "Date",
    required: false,
  },
  {
    id: "lastApprovedBy",
    name: "Last Approved By",
    type: "Symbol",
    required: false,
  },
];

async function main() {
  if (!SPACE_ID || !CMA_TOKEN) {
    console.error(
      "Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_ACCESS_TOKEN (e.g. in .env or .env.local)."
    );
    process.exit(1);
  }

  const entryId = process.argv[2] ?? DEFAULT_ENTRY_ID;
  const client = contentful.createClient({ accessToken: CMA_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  const entry = await env.getEntry(entryId);
  const contentTypeId = entry.sys.contentType.sys.id;
  console.log("Entry", entryId, "-> content type:", contentTypeId);

  const contentType = await env.getContentType(contentTypeId);
  const existingIds = new Set((contentType.fields ?? []).map((f: { id: string }) => f.id));

  const toAdd = GOVERNANCE_FIELDS.filter((f) => !existingIds.has(f.id));
  if (toAdd.length === 0) {
    console.log("All governance metadata fields already exist on", contentTypeId);
    return;
  }

  // Contentful List (multi-value) is Array with items.type Symbol
  for (const field of toAdd) {
    const def: Record<string, unknown> = {
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.required ?? false,
      localized: false,
    };
    if (field.id === "taxonomyTags") {
      def.type = "Array";
      def.items = { type: "Symbol" };
    }
    contentType.fields.push(def as never);
  }

  const updated = await contentType.update();
  console.log("Updated content type; added fields:", toAdd.map((f) => f.id).join(", "));

  await updated.publish();
  console.log("Published content type", contentTypeId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
