'use client';

import {
  ArrowUp,
  Bookmark,
  History,
  RotateCcw,
  Search,
  ShoppingCart,
  Sparkle,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MockCommerceCheckout } from '@/components/demo/MockCommerceCheckout';
import type { ProductRecord } from '@/lib/integration-adapters/types';
import { getPersona } from '@/lib/persona-session';
import { cn } from '@/lib/utils';
import { useSettings } from '@/personalization/settings-context';

// ── SessionStorage key ──────────────────────────────────────────────────────

const SEARCH_STATE_KEY = 'search-panel-state';

interface PersistedState {
  query: string;
  chatMessages: ChatMessage[];
  aiMode: boolean;
}

function loadState(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SEARCH_STATE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded -- ignore
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(SEARCH_STATE_KEY);
  } catch {
    // ignore
  }
}

// ── Pre-scripted AI responses ───────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: string[]; // SKUs of matched products
  showAddToCart?: boolean; // Show "Add to cart" CTA after this message
}

/** Pre-scripted AI conversation threads keyed by trigger phrase (lowercase). */
const AI_SCRIPTS: Record<string, ChatMessage[]> = {
  'lamp for my living room': [
    {
      role: 'assistant',
      text: "I'd recommend looking at statement lighting for living spaces. The Arc 900 is our most popular floor lamp for open living rooms, designed for 9ft+ ceilings. Would you like something bold or more minimalist?",
      products: ['ARKO-ARC-900'],
    },
  ],
  'statement piece': [
    {
      role: 'assistant',
      text: "Great choice. The Arc 900 in matte-black is our signature statement piece. It pairs beautifully with the Arc 600 for layered lighting. I've pulled up the full collection for you.",
      products: ['ARKO-ARC-900', 'ARKO-ARC-600'],
      showAddToCart: true,
    },
  ],
  'something for a small space': [
    {
      role: 'assistant',
      text: "For smaller spaces, the Arc 300 is designed specifically for studios and compact rooms. It's minimalist, compact, and works great as desk lighting. Most first-time buyers report 15-minute assembly with no tools required.",
      products: ['ARKO-ARC-300'],
    },
  ],
  'reading light': [
    {
      role: 'assistant',
      text: "For reading, the Arc 900 is excellent. 89% of buyers use it for directional reading light. It provides warm-ambient illumination that's easy on the eyes. The Arc 300 also works well for desk-side reading in smaller spaces.",
      products: ['ARKO-ARC-900', 'ARKO-ARC-300'],
      showAddToCart: true,
    },
  ],
};

/** Find a scripted response for the given query. Uses partial matching. */
function findAiResponse(query: string): ChatMessage[] | null {
  const lower = query.toLowerCase().trim();
  // Exact match first
  if (AI_SCRIPTS[lower]) return AI_SCRIPTS[lower];
  // Partial match
  for (const [key, messages] of Object.entries(AI_SCRIPTS)) {
    if (lower.includes(key) || key.includes(lower)) return messages;
  }
  // Fallback
  return [
    {
      role: 'assistant',
      text: `I found several products that might match "${query}". Let me show you our top recommendations based on your interests.`,
    },
  ];
}

// ── Product result card ─────────────────────────────────────────────────────
// Threaded layout: image rail on the left, details + Add / Details actions on
// the right. "Add" routes through the same checkout flow as the AI thread.

function ProductResultCard({
  product,
  onAddToCart,
}: {
  product: ProductRecord;
  onAddToCart?: (sku: string) => void;
}) {
  const href = `/products/${product.sku?.toLowerCase().replace(/_/g, '-')}`;
  return (
    <div className="group border-border bg-card flex overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <a
        href={href}
        className="bg-muted relative h-auto w-24 shrink-0 overflow-hidden"
      >
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground text-xs">IMG</span>
          </div>
        )}
      </a>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <a
              href={href}
              className="text-foreground block truncate text-sm font-semibold hover:underline"
            >
              {product.name}
            </a>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                {product.category}
              </span>
              {product.inStock && (
                <span className="text-[11px] font-medium text-green-600">
                  In Stock
                </span>
              )}
            </div>
          </div>
          <p className="text-foreground shrink-0 text-sm font-semibold">
            ${product.price.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(product.sku)}
              className="bg-primary text-primary-foreground inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
            >
              <ShoppingCart className="h-3 w-3" />
              Add
            </button>
          )}
          <a
            href={href}
            className="border-border text-foreground hover:bg-muted inline-flex flex-1 items-center justify-center rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors"
          >
            Details
          </a>
        </div>
      </div>
    </div>
  );
}

// ── AI suggestion row ───────────────────────────────────────────────────────

function AiSuggestionRow({
  query,
  onClick,
}: {
  query: string;
  onClick: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 py-2">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <Sparkle className="h-3 w-3" />
          AI suggestion
        </span>
        <span className="bg-border h-px flex-1" />
      </div>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 rounded-lg border border-purple-200 bg-purple-50/50 px-5 py-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-50"
      >
        <div className="mt-0.5">
          <Sparkle className="h-4 w-4 text-purple-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-purple-900">
            Ask the shopping assistant about &quot;{query}&quot;
          </p>
          <p className="mt-0.5 text-xs text-purple-600">
            Get personalized recommendations based on your preferences
          </p>
        </div>
      </button>
    </>
  );
}

// ── Chat thread ─────────────────────────────────────────────────────────────

function ChatThread({
  messages,
  productCatalog,
  onAddToCart,
}: {
  messages: ChatMessage[];
  productCatalog: ProductRecord[];
  onAddToCart?: (sku: string) => void;
}) {
  return (
    <div className="space-y-6">
      {messages.map((msg, i) =>
        msg.role === 'user' ? (
          <div key={i} className="flex justify-end">
            <div className="bg-muted text-foreground max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ) : (
          <div key={i} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 shadow-sm">
              <Sparkle className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="rounded-2xl rounded-tl-sm border border-purple-100 bg-purple-50/50 px-4 py-3 text-sm">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-purple-600">
                    Shopping Assistant
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">{msg.text}</p>
              </div>
              {(() => {
                const products = (msg.products ?? [])
                  .map((sku) => productCatalog.find((p) => p.sku === sku))
                  .filter((p): p is ProductRecord => Boolean(p));
                if (products.length === 0) return null;
                return (
                  <div className="space-y-2">
                    {products.map((p) => (
                      <ProductResultCard
                        key={p.sku}
                        product={p}
                        onAddToCart={onAddToCart}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchBarProps) {
  const settings = useSettings();
  const productCatalog: ProductRecord[] = settings?.productCatalog ?? [];

  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSku, setCheckoutSku] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Load persisted state on first open
  useEffect(() => {
    if (isOpen && !initialized) {
      const saved = loadState();
      if (saved) {
        setQuery(saved.query);
        setChatMessages(saved.chatMessages);
        setAiMode(saved.aiMode);
      }
      setInitialized(true);
    }
  }, [isOpen, initialized]);

  // Persist state on changes
  useEffect(() => {
    if (initialized) {
      saveState({ query, chatMessages, aiMode });
    }
  }, [query, chatMessages, aiMode, initialized]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
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
  }, [chatMessages]);

  const handleClear = useCallback(() => {
    setQuery('');
    setChatMessages([]);
    setAiMode(false);
    clearState();
    inputRef.current?.focus();
  }, []);

  const handleAiClick = useCallback(() => {
    if (!query.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: query };
    const responses = findAiResponse(query);
    const newMessages = [...chatMessages, userMsg, ...(responses ?? [])];
    setChatMessages(newMessages);
    setAiMode(true);
  }, [query, chatMessages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      if (aiMode) {
        // In AI mode, pressing Enter sends a follow-up to the conversation
        const userMsg: ChatMessage = { role: 'user', text: query };
        const responses = findAiResponse(query);
        setChatMessages((prev) => [...prev, userMsg, ...(responses ?? [])]);
        setQuery('');
      } else {
        // First Enter triggers AI mode
        handleAiClick();
      }
    },
    [query, aiMode, handleAiClick],
  );

  const handleAddToCart = useCallback((sku: string) => {
    setCheckoutSku(sku);
    setCheckoutOpen(true);
  }, []);

  // Resolve checkout item from product catalog
  const checkoutProduct = checkoutSku
    ? productCatalog.find((p) => p.sku === checkoutSku)
    : null;
  const persona = typeof window !== 'undefined' ? getPersona() : null;

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;

  // Filter products by query (case-insensitive substring match on name, description, category, tags)
  const productResults = hasQuery
    ? productCatalog.filter((p) => {
        const lower = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.tags?.some((t) => t.toLowerCase().includes(lower))
        );
      })
    : productCatalog.slice(0, 3);

  const hasChat = chatMessages.length > 0;

  return (
    <>
      {/* Window tint — 5% darker, no blur. pointer-events-none keeps the page
          behind the panel scrollable and interactive. */}
      <div
        className="animate-in fade-in bg-foreground/5 pointer-events-none fixed inset-0 z-[55] duration-200"
        aria-hidden="true"
      />

      {/* Floating threaded assistant panel */}
      <aside
        role="dialog"
        aria-label="Search and shopping assistant"
        className="animate-in slide-in-from-right-8 fade-in border-border bg-background fixed inset-y-0 right-0 z-[60] flex w-full max-w-xl flex-col border-l shadow-2xl duration-300"
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between gap-4 border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 shadow-sm">
              <Sparkle className="h-4 w-4 text-white" />
            </span>
            <span className="text-foreground text-base font-semibold">
              Shopping Assistant
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
          >
            <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase">
              Esc
            </span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable feed: thread + product results */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Chat thread (State 3) */}
          {hasChat && (
            <ChatThread
              messages={chatMessages}
              productCatalog={productCatalog}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* AI suggestion row (State 2: query present, no chat yet) */}
          {hasQuery && !hasChat && (
            <AiSuggestionRow query={query} onClick={handleAiClick} />
          )}

          {/* Product results */}
          <div className="flex flex-col gap-3">
            {productResults.length > 0 ? (
              <>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {hasQuery
                    ? `${productResults.length} product${productResults.length !== 1 ? 's' : ''} for "${query}"`
                    : hasChat
                      ? 'You might also like'
                      : 'Featured products'}
                </p>
                {productResults.slice(0, 6).map((p) => (
                  <ProductResultCard
                    key={p.sku}
                    product={p}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </>
            ) : hasQuery ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No products found for &ldquo;{query}&rdquo;
              </p>
            ) : null}
          </div>

          <div ref={feedEndRef} />
        </div>

        {/* Interaction footer: input + actions */}
        <div className="border-border bg-background border-t px-6 py-4">
          <form onSubmit={handleSubmit}>
            <div className="border-input bg-card focus-within:border-ring focus-within:ring-ring/20 relative flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-colors focus-within:ring-2">
              {hasQuery ? (
                <Search className="text-muted-foreground pointer-events-none h-4 w-4 shrink-0" />
              ) : (
                <Sparkle className="pointer-events-none h-4 w-4 shrink-0 text-purple-500" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try "lamp for my living room" or "statement piece"'
                className="text-foreground placeholder:text-muted-foreground h-9 flex-1 border-none bg-transparent text-sm focus:outline-none"
              />
              {hasQuery && !hasChat && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Clear search text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={!hasQuery}
                aria-label="Ask the shopping assistant"
                className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-3 flex items-center justify-center gap-6">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
              <History className="h-3.5 w-3.5" />
              Recent
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
              <Bookmark className="h-3.5 w-3.5" />
              Saved
            </span>
            {(hasQuery || hasChat) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors"
                aria-label="Clear search and conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mock checkout modal triggered from AI conversation */}
      <MockCommerceCheckout
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        personaName={
          persona?.first_name ??
          persona?.display_name ??
          persona?.name ??
          'Guest'
        }
        loyaltyTier={persona?.loyalty_tier}
        items={
          checkoutProduct
            ? [
                {
                  name: checkoutProduct.name,
                  variant:
                    checkoutProduct.variants?.colors?.[0] ?? 'matte black',
                  price: checkoutProduct.price,
                },
              ]
            : undefined
        }
      />
    </>
  );
}

// ── Search icon toggle button (used in navbar) ──────────────────────────────

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
        'text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md border border-transparent transition-colors',
        isOpen && 'bg-muted text-foreground',
        className,
      )}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
    </button>
  );
}
