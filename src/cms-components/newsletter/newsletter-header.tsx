'use client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NewsletterHeaderProps {
  subject?: string | null;
  sender?: string | null;
  replyToEmail?: string | null;
  date?: string | null;
}

/**
 * Gmail-style email header: avatar, sender name + email address, date, subject
 * line, and inbox badge. Used at the top of the newsletter page and email chrome.
 */
export function NewsletterHeader({
  subject,
  sender,
  replyToEmail,
  date,
}: NewsletterHeaderProps) {
  const displaySender = sender ?? 'Punchbowl News';
  const displayEmail = replyToEmail ?? 'newsletter@punchbowl.news';

  // Build initials from sender name (up to 2 chars)
  const initials = displaySender
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      {/* Subject row */}
      <div className="mb-2 flex items-center gap-2">
        <h1 className="flex-1 truncate text-xl font-normal text-gray-800">
          {subject ?? 'Newsletter'}
        </h1>
        <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-700">
          Inbox
        </span>
      </div>

      {/* Sender row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary,#1a2b4a)]">
          <span className="text-sm font-bold text-white">{initials}</span>
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {displaySender}
            </span>
            <span className="truncate text-xs text-gray-500">
              &lt;{displayEmail}&gt;
            </span>
          </div>
          <div className="text-xs text-gray-500">to me</div>
        </div>

        {/* Date */}
        {date && (
          <div className="shrink-0 text-xs text-gray-500">
            {formatDate(date)}
          </div>
        )}
      </div>
    </div>
  );
}
