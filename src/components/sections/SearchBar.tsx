'use client';

import { Search, X, Sparkle, RotateCcw, ShoppingCart } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import { cn } from '@/lib/utils';
import { useSettings } from '@/personalization/settings-context';
import { getPersona } from '@/lib/persona-session';
import { MockCommerceCheckout } from '@/components/demo/MockCommerceCheckout';
import type { ProductRecord } from '@/lib/integration-adapters/types';

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

function ProductResultCard({ product }: { product: ProductRecord }) {
  return (
    <a
      href={`/products/${product.sku?.toLowerCase().replace(/_/g, '-')}`}
      className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="mt-0.5 flex-shrink-0">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md">
            <span className="text-muted-foreground text-xs">IMG</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
          <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {product.category}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{product.description}</p>
        <p className="mt-1 text-xs font-semibold text-slate-700">
          ${product.price.toFixed(2)}
          {product.inStock && (
            <span className="ml-2 font-normal text-green-600">In Stock</span>
          )}
        </p>
      </div>
    </a>
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
        <span className="h-px flex-1 bg-slate-200" />
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Sparkle className="h-3 w-3" />
          AI suggestion
        </span>
        <span className="h-px flex-1 bg-slate-200" />
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
  onAddToCart,
}: {
  messages: ChatMessage[];
  onAddToCart?: (sku: string) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            msg.role === 'user'
              ? 'ml-8 bg-slate-100 text-slate-800'
              : 'mr-8 border border-purple-100 bg-purple-50/40 text-slate-700',
          )}
        >
          {msg.role === 'assistant' && (
            <div className="mb-1 flex items-center gap-1.5">
              <Sparkle className="h-3 w-3 text-purple-500" />
              <span className="text-xs font-medium text-purple-600">Shopping Assistant</span>
            </div>
          )}
          <p className="leading-relaxed">{msg.text}</p>
          {msg.showAddToCart && msg.products?.[0] && onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(msg.products![0])}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-200"
            >
              <ShoppingCart className="h-3 w-3" />
              Add to cart
            </button>
          )}
        </div>
      ))}
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

  const handleAddToCart = useCallback(
    (sku: string) => {
      setCheckoutSku(sku);
      setCheckoutOpen(true);
    },
    [],
  );

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
    : productCatalog.slice(0, 6);

  const hasChat = chatMessages.length > 0;

  return (
    <div className="border-b border-slate-200 bg-slate-50 shadow-sm">
      <div className="mx-auto max-w-5xl px-6 py-5">
        {/* Search input */}
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            {hasQuery ? (
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            ) : (
              <Sparkle className="pointer-events-none absolute left-3 h-4 w-4 text-purple-400" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "lamp for my living room" or "statement piece"'
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {(hasQuery || hasChat) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search and conversation"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </button>
              )}
              {hasQuery && !hasChat && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Clear search text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Chat thread (State 3) */}
        {hasChat && <ChatThread messages={chatMessages} onAddToCart={handleAddToCart} />}

        {/* Product results */}
        <div className="mt-4 flex flex-col gap-2">
          {productResults.length > 0 ? (
            <>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                {hasQuery
                  ? `${productResults.length} product${productResults.length !== 1 ? 's' : ''} for "${query}"`
                  : 'Featured products'}
              </p>
              {productResults.slice(0, 6).map((p) => (
                <ProductResultCard key={p.sku} product={p} />
              ))}
            </>
          ) : hasQuery ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No products found for &ldquo;{query}&rdquo;
            </p>
          ) : null}
        </div>

        {/* AI suggestion row (State 2: query present, no chat yet) */}
        {hasQuery && !hasChat && (
          <AiSuggestionRow query={query} onClick={handleAiClick} />
        )}
      </div>

      {/* Mock checkout modal triggered from AI conversation */}
      <MockCommerceCheckout
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        personaName={persona?.first_name ?? persona?.display_name ?? persona?.name ?? 'Guest'}
        loyaltyTier={persona?.loyalty_tier}
        items={
          checkoutProduct
            ? [{ name: checkoutProduct.name, variant: checkoutProduct.variants?.colors?.[0] ?? 'matte black', price: checkoutProduct.price }]
            : undefined
        }
      />
    </div>
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
        'flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        isOpen && 'bg-muted text-foreground',
        className,
      )}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
    </button>
  );
}
