/**
 * NT Audience IDs per env.
 *
 * Source of truth for ID values: demo-loops/nt-audiences.md
 * Runtime injection: set NEXT_PUBLIC_NT_AUDIENCE_* in .env.local on the relevant demo branch.
 * Do NOT commit real audience IDs to main — they are env-specific.
 */
export const NT_AUDIENCES = {
  newVisitor: process.env.NEXT_PUBLIC_NT_AUDIENCE_NEW_VISITOR ?? '',
  returning: process.env.NEXT_PUBLIC_NT_AUDIENCE_RETURNING ?? '',
  premium: process.env.NEXT_PUBLIC_NT_AUDIENCE_PREMIUM ?? '',
};
