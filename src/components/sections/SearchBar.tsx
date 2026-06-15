'use client';

import { Search, X, Package, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';

// ── Hardcoded demo results ────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  title: string;
  type: 'Product' | 'Page';
  excerpt: string;
  href: string;
}

const DEMO_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'Ergo Pro Mechanical Keyboard',
    type: 'Product',
    excerpt: 'Premium split ergonomic mechanical keyboard. Low-profile switches, programmable RGB, 65% compact layout. SKU: MF-ERG-001.',
    href: '/products',
  },
  {
    id: '2',
    title: 'UltraWide 34" Monitor',
    type: 'Product',
    excerpt: '34-inch ultrawide QHD display. 144Hz refresh rate, 1ms response time, USB-C one-cable docking. SKU: MF-MON-002.',
    href: '/products/ultrawide-34-in-monitor',
  },
  {
    id: '3',
    title: 'ANC Headset Pro',
    type: 'Product',
    excerpt: 'Industry-leading active noise cancellation. 30-hour battery, studio-quality microphone. SKU: MF-HDN-003.',
    href: '/products',
  },
  {
    id: '4',
    title: 'Sit-Stand Desk Frame',
    type: 'Product',
    excerpt: 'Electric dual-motor standing desk frame. 3-preset memory, whisper-quiet motors, supports up to 120kg. SKU: MF-DSK-015.',
    href: '/products',
  },
  {
    id: '5',
    title: 'All Products',
    type: 'Page',
    excerpt: 'Browse the full Metafi product catalog — keyboards, monitors, audio, workspace, and accessories.',
    href: '/products',
  },
  {
    id: '6',
    title: 'Pricing',
    type: 'Page',
    excerpt: 'Explore pricing tiers for individuals, teams, and enterprise. Start free, upgrade anytime.',
    href: '/page/pricing',
  },
];

const TYPE_ICON = {
  Product: Package,
  Page: BookOpen,
};

const TYPE_BADGE_COLORS: Record<SearchResult['type'], string> = {
  Product: 'bg-blue-100 text-blue-700',
  Page: 'bg-slate-100 text-slate-600',
};

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: SearchResult }) {
  const Icon = TYPE_ICON[result.type];

  return (
    <a
      href={result.href}
      className="flex items-start gap-4 rounded-lg border border-border bg-card px-5 py-4 shadow-sm transition-colors hover:border-border/80 hover:bg-muted/50"
    >
      <div className="mt-0.5 flex-shrink-0">
        <div className={cn(
          'rounded-md p-2',
          result.type === 'Product' ? 'bg-blue-100' : 'bg-muted',
        )}>
          <Icon className={cn(
            'h-4 w-4',
            result.type === 'Product' ? 'text-blue-700' : 'text-muted-foreground',
          )} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{result.title}</p>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0', TYPE_BADGE_COLORS[result.type])}>
            {result.type}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{result.excerpt}</p>
      </div>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Keep the threaded feed pinned to the latest message
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages, isThinking]);

  // Cleanup thinking timer on unmount
  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
    };
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setChatMessages([]);
    setAiMode(false);
    setIsThinking(false);
    if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
    clearState();
    inputRef.current?.focus();
  }, []);

  /** Append AI responses after a simulated thinking delay. */
  const appendWithDelay = useCallback(
    (
      responses: ChatMessage[],
      afterAppend?: () => void,
    ) => {
      setIsThinking(true);
      const delay = 1000 + Math.random() * 1000; // 1-2s
      thinkingTimerRef.current = setTimeout(() => {
        setIsThinking(false);
        // Replace __ORDER_ID__ placeholder with random ID if present
        const processed = responses.map((r) => ({
          ...r,
          text: r.text.includes('__ORDER_ID__')
            ? r.text.replace('__ORDER_ID__', generateOrderId())
            : r.text,
        }));
        setChatMessages((prev) => [...prev, ...processed]);
        afterAppend?.();
      }, delay);
    },
    [],
  );

  /** Send a text into the AI conversation — used by both typed input and suggestion chips */
  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    trackSessionEvent('ai_chat_active');
    trackSessionEvent('search', { query: trimmed });

    const lower = trimmed.toLowerCase();

    // Fire NT personalization trait when query matches lamp-related AI script
    if (lower.includes('lamp') || lower.includes('lighting')) {
      trackSessionEvent('ai_product_discovery', { category: 'lamps' });
    }
    const userMsg: ChatMessage = { role: 'user', text: trimmed };

    // Check if this triggers a navigation action
    if (NAVIGATE_TRIGGERS.has(lower)) {
      const responses = findAiResponse(trimmed) ?? [];
      setChatMessages((prev) => [...prev, userMsg]);
      setAiMode(true);
      setQuery('');
      appendWithDelay(responses, () => {
        setTimeout(() => {
          onClose();
          window.location.href = '/products?preview=true';
        }, 800);
      });
      return;
    }

    // Close panel triggers
    if (CLOSE_TRIGGERS.has(lower)) {
      const responses = findAiResponse(trimmed) ?? [];
      setChatMessages((prev) => [...prev, userMsg]);
      setAiMode(true);
      setQuery('');
      appendWithDelay(responses, () => {
        setTimeout(() => onClose(), 1000);
      });
      return;
    }

    // "Find a side table" — show non-lamp furniture products
    if (lower.includes('side table') || lower.includes('complement')) {
      const nonLamp = productCatalog.filter((p) => {
        const cat = p.category.toLowerCase();
        const name = p.name.toLowerCase();
        return !cat.includes('lamp') && !cat.includes('lighting') && !name.includes('lamp');
      });
      const sidePicks = nonLamp.slice(0, 3).map((p) => p.sku);
      const response: ChatMessage = {
        role: 'assistant',
        text: "Here are some pieces that would complement your purchase perfectly.",
        products: sidePicks,
        suggestions: ['Continue shopping'],
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setAiMode(true);
      setQuery('');
      appendWithDelay([response]);
      return;
    }

    const responses = findAiResponse(trimmed) ?? [];
    setChatMessages((prev) => [...prev, userMsg]);
    setAiMode(true);
    setQuery('');
    appendWithDelay(responses);
  }, [trackSessionEvent, onClose, productCatalog, isThinking, appendWithDelay]);

  const handleAiClick = useCallback(() => {
    if (!query.trim()) return;
    sendMessage(query);
  }, [query, sendMessage]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      if (aiMode) {
        sendMessage(query);
      } else {
        handleAiClick();
      }
    },
    [query, aiMode, handleAiClick, sendMessage],
  );

  /** Handle suggestion chip click — send as user message and trigger AI response */
  const handleSuggestionSelect = useCallback((text: string) => {
    trackSessionEvent('ai_suggestion_clicked');
    sendMessage(text);
  }, [trackSessionEvent, sendMessage]);

  /** Handle prompt chip click (initial state) — sets query and enters AI mode */
  const handlePromptChip = useCallback((text: string) => {
    trackSessionEvent('ai_suggestion_clicked');
    sendMessage(text);
  }, [trackSessionEvent, sendMessage]);

  const handleAddToCart = useCallback((sku: string) => {
    setCheckoutSku(sku);
    setCheckoutOpen(true);
  }, []);

  // Pick up pending cart product when panel opens (set by navbar's add-to-cart listener)
  useEffect(() => {
    if (!isOpen) return;
    const pending = (window as unknown as Record<string, unknown>).__pendingCartProduct as ProductRecord | undefined;
    if (!pending) return;
    delete (window as unknown as Record<string, unknown>).__pendingCartProduct;

    const persona = getPersona();
    const discount = persona?.loyalty_tier === 'platinum' ? 15 : persona?.loyalty_tier === 'explorer' ? 10 : 0;

    const cartMessages: ChatMessage[] = [
      {
        role: 'assistant',
        text: `Looks like you've added the ${pending.name} to your cart! Ready to checkout?`,
        suggestions: ['Yes, checkout now', 'Keep shopping'],
      },
    ];
    setAiMode(true);
    appendWithDelay(cartMessages);

    // Store discount for checkout flow
    (window as unknown as Record<string, unknown>).__cartDiscount = discount;
    (window as unknown as Record<string, unknown>).__cartProduct = pending;
  }, [isOpen, appendWithDelay]);

  // Resolve checkout item from product catalog
  const checkoutProduct = checkoutSku
    ? productCatalog.find((p) => p.sku === checkoutSku)
    : null;
  const persona = typeof window !== 'undefined' ? getPersona() : null;

  if (!isOpen) return null;

  // Filter demo results by query (case-insensitive substring match)
  const results = query.trim()
    ? DEMO_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.excerpt.toLowerCase().includes(query.toLowerCase()),
      )
    : DEMO_RESULTS;

  return (
    <div className="border-b border-border bg-muted/50 shadow-sm">
      <div className="mx-auto max-w-5xl px-6 py-5">
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "keyboard", "monitor", or "pricing"'
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mt-4 flex flex-col gap-2">
          {results.length > 0 ? (
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {query ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"` : 'Featured products and pages'}
              </p>
              {results.map((r) => (
                <ResultCard key={r.id} result={r} />
              ))}
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Search icon toggle button (used in navbar) ────────────────────────────────

export function SearchToggleButton({
  isOpen,
  onClick,
  className,
}: {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close search' : 'Open search'}
      aria-expanded={isOpen}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        isOpen && 'bg-muted text-foreground',
        className,
      )}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
    </button>
  );
}
