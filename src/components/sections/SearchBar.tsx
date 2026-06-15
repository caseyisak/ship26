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
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MockCommerceCheckout } from '@/components/demo/MockCommerceCheckout';
import type { ProductRecord } from '@/lib/integration-adapters/types';
import { getPersona } from '@/lib/persona-session';
import { useDiscountedCatalog } from '@/lib/use-discounted-catalog';
import { cn } from '@/lib/utils';
import { useSettings } from '@/personalization/settings-context';
import { useSessionTracker } from '@/personalization/use-session-tracker';

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
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    // Mark all restored messages so animations are skipped on reload
    parsed.chatMessages = parsed.chatMessages.map((m) => ({ ...m, restored: true }));
    return parsed;
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
  suggestions?: string[]; // Clickable suggestion chips below this message
  image?: string; // URL of an image/gif to render above the text
  restored?: boolean; // True for messages loaded from sessionStorage (skip animations)
}

/** Generate a random 8-char alphanumeric uppercase order ID. */
function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/** Pre-scripted AI conversation threads keyed by trigger phrase (lowercase). */
const AI_SCRIPTS: Record<string, ChatMessage[]> = {
  'lamp': [
    {
      role: 'assistant',
      text: "I found over 2,000 lamps in our inventory! Let's narrow down your search to find exactly what you need. What style are you looking for?",
      suggestions: ['Statement piece', 'Minimalist', 'Industrial', 'Compact'],
    },
  ],
  'statement piece': [
    {
      role: 'assistant',
      text: "Great choice! We've narrowed from 2,000 to about 400 statement lamps. Do you have a specific lamp in mind, or would you like to browse the collection?",
      suggestions: ['Browse the collection', 'Tell me more about arc lamps'],
    },
  ],
  'minimalist': [
    {
      role: 'assistant',
      text: "Great choice! We've narrowed from 2,000 to about 400 minimalist lamps. Do you have a specific lamp in mind, or would you like to browse the collection?",
      suggestions: ['Browse the collection', 'Tell me more about arc lamps'],
    },
  ],
  'industrial': [
    {
      role: 'assistant',
      text: "Great choice! We've narrowed from 2,000 to about 400 industrial-style lamps. Do you have a specific lamp in mind, or would you like to browse the collection?",
      suggestions: ['Browse the collection', 'Tell me more about arc lamps'],
    },
  ],
  'compact': [
    {
      role: 'assistant',
      text: "Great choice! We've narrowed from 2,000 to about 400 compact lamps. Do you have a specific lamp in mind, or would you like to browse the collection?",
      suggestions: ['Browse the collection', 'Tell me more about arc lamps'],
    },
  ],
  'browse the collection': [
    {
      role: 'assistant',
      text: "Taking you to the full collection now. Happy shopping!",
    },
  ],
  'tell me more about arc lamps': [
    {
      role: 'assistant',
      text: "The Arc collection is our signature line — designed for modern living spaces with clean geometry and warm-ambient light. The Arc 900 is our bestseller for open living rooms (9ft+ ceilings), and the Arc 600 is perfect for reading corners and bedrooms.",
      products: ['ARKO-ARC-900', 'ARKO-ARC-600'],
      showAddToCart: true,
      suggestions: ['Take me to the collection'],
    },
  ],
  'couch': [
    {
      role: 'assistant',
      text: "We have a great selection of sofas and seating. Let me show you some of our top picks based on your style preferences.",
      suggestions: ['Browse the collection', 'Show me sectionals'],
    },
  ],
  'office': [
    {
      role: 'assistant',
      text: "I can help you style your office! We have desks, chairs, lighting, and accessories. What are you looking for?",
      suggestions: ['Desk lamps', 'Office chairs', 'Browse the collection'],
    },
  ],
  'yes, checkout now': [
    {
      role: 'assistant',
      text: "Great! I've applied your discount. Use the card and address on file?",
      suggestions: ['Confirm order', 'Edit details'],
    },
  ],
  'confirm order': [
    {
      role: 'assistant',
      text: `Order **#__ORDER_ID__** confirmed and on the way! Want to continue shopping or find something that complements it?`,
      image: '/images/box_recolored.gif',
      suggestions: ['Find a side table to match', 'Continue shopping'],
    },
  ],
  'find a side table to match': [
    {
      role: 'assistant',
      text: "Here are some pieces that would complement your purchase perfectly.",
    },
  ],
  'keep shopping': [
    {
      role: 'assistant',
      text: "Happy shopping! I'm here if you need anything.",
    },
  ],
  'continue shopping': [
    {
      role: 'assistant',
      text: "Happy shopping! I'm here if you need anything.",
    },
  ],
};

// Actions that close the panel
const CLOSE_TRIGGERS = new Set(['keep shopping', 'continue shopping']);

// ── Navigation action (used by "browse the collection") ────────────────────
const NAVIGATE_TRIGGERS = new Set(['browse the collection', 'take me to the collection']);

/** Find a scripted response for the given query. Uses partial matching. */
function findAiResponse(query: string): ChatMessage[] | null {
  const lower = query.toLowerCase().trim();
  // Exact match first
  if (AI_SCRIPTS[lower]) return AI_SCRIPTS[lower];
  // Partial match — check if query contains or is contained by a key
  for (const [key, messages] of Object.entries(AI_SCRIPTS)) {
    if (lower.includes(key) || key.includes(lower)) return messages;
  }
  // Fallback
  return [
    {
      role: 'assistant',
      text: `Let me search our catalog for "${query}". Here are some products that might be a good fit.`,
      suggestions: ['Browse the collection', 'Tell me more about arc lamps'],
    },
  ];
}

// ── Typewriter text component ───────────────────────────────────────────────

/** Parse simple **bold** markers into React nodes. */
function parseBold(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = str;
  let key = 0;
  while (remaining.length > 0) {
    const start = remaining.indexOf('**');
    if (start === -1) {
      parts.push(remaining);
      break;
    }
    const end = remaining.indexOf('**', start + 2);
    if (end === -1) {
      parts.push(remaining);
      break;
    }
    if (start > 0) parts.push(remaining.slice(0, start));
    parts.push(
      <strong key={key++}>{remaining.slice(start + 2, end)}</strong>,
    );
    remaining = remaining.slice(end + 2);
  }
  return parts;
}

function TypewriterText({
  text,
  speed = 20,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [charIndex, setCharIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (charIndex >= text.length) {
      onCompleteRef.current?.();
      return;
    }
    const timer = setTimeout(() => setCharIndex((prev) => prev + 1), speed);
    return () => clearTimeout(timer);
  }, [charIndex, text.length, speed]);

  const isTyping = charIndex < text.length;
  const revealed = text.slice(0, charIndex);

  return (
    <span>
      {parseBold(revealed)}
      {isTyping && (
        <span className="animate-blink-cursor ml-px inline-block w-[2px] align-middle text-purple-600">
          |
        </span>
      )}
    </span>
  );
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

// ── Suggestion chip bar ────────────────────────────────────────────────────

function SuggestionChips({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:border-purple-400 hover:bg-purple-100"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ── Loading bubble ──────────────────────────────────────────────────────────

function LoadingBubble() {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 shadow-sm">
        <Sparkle className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-sm border border-purple-100 bg-purple-50/50 px-4 py-3 text-sm">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-xs font-medium text-purple-600">
              Shopping Assistant
            </span>
          </div>
          <div className="flex h-6 items-center justify-start">
            <Image src="/images/loading-purple.svg" alt="Thinking..." width={40} height={24} className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Order processing overlay (gif + cycling status messages) ─────────────

const ORDER_PROCESSING_MESSAGES = [
  'Preparing your order…',
  'Processing payment…',
  'Finalizing…',
];

function OrderProcessingOverlay({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Cycle through status messages every ~1.3s (3 messages in 4s)
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => {
        const next = prev + 1;
        if (next >= ORDER_PROCESSING_MESSAGES.length) return prev;
        return next;
      });
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  // Complete after 4s
  useEffect(() => {
    const timer = setTimeout(() => onCompleteRef.current(), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/box_recolored.gif"
        alt="Processing order"
        className="h-24 w-24 object-contain"
      />
      <p className="text-sm font-medium text-purple-700 animate-pulse">
        {ORDER_PROCESSING_MESSAGES[msgIndex]}
      </p>
    </div>
  );
}

// ── Chat thread ─────────────────────────────────────────────────────────────

function ChatThread({
  messages,
  isThinking,
  productCatalog,
  onAddToCart,
  onSuggestionSelect,
}: {
  messages: ChatMessage[];
  isThinking: boolean;
  productCatalog: ProductRecord[];
  onAddToCart?: (sku: string) => void;
  onSuggestionSelect?: (text: string) => void;
}) {
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [orderProcessingDone, setOrderProcessingDone] = useState(false);

  // Reset typewriterDone and orderProcessingDone when a new message arrives
  const lastMsgCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length !== lastMsgCount.current) {
      setTypewriterDone(false);
      setOrderProcessingDone(false);
      lastMsgCount.current = messages.length;
    }
  }, [messages.length]);

  return (
    <div className="space-y-6">
      {messages.map((msg, i) => {
        const isLatestAssistant =
          msg.role === 'assistant' && i === messages.length - 1;
        const shouldAnimate = isLatestAssistant && !msg.restored;
        const isConfirmOrder = msg.image === '/images/box_recolored.gif';

        if (msg.role === 'user') {
          return (
            <div key={i} className="flex justify-end">
              <div className="bg-muted text-foreground max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          );
        }

        return (
          <div key={i} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 shadow-sm">
              <Sparkle className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              {shouldAnimate && isConfirmOrder && !orderProcessingDone ? (
                <OrderProcessingOverlay onComplete={() => setOrderProcessingDone(true)} />
              ) : (
                <div className="rounded-2xl rounded-tl-sm border border-purple-100 bg-purple-50/50 px-4 py-3 text-sm">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-purple-600">
                      Shopping Assistant
                    </span>
                  </div>
                  {msg.image && !isConfirmOrder && (
                    <div className="my-2 flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.image} alt="" className="h-20 w-20 object-contain" />
                    </div>
                  )}
                  <p className="text-foreground leading-relaxed">
                    {shouldAnimate && !msg.restored ? (
                      <TypewriterText
                        text={msg.text}
                        onComplete={() => setTypewriterDone(true)}
                      />
                    ) : (
                      parseBold(msg.text)
                    )}
                  </p>
                </div>
              )}
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
              {/* Suggestion chips — only on last assistant msg, after typewriter finishes */}
              {msg.suggestions &&
                msg.suggestions.length > 0 &&
                i === messages.length - 1 &&
                onSuggestionSelect &&
                (msg.restored || typewriterDone) && (
                  <SuggestionChips
                    suggestions={msg.suggestions}
                    onSelect={onSuggestionSelect}
                  />
                )}
            </div>
          </div>
        );
      })}
      {isThinking && <LoadingBubble />}
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
  const rawCatalog: ProductRecord[] = settings?.productCatalog ?? [];
  const productCatalog = useDiscountedCatalog(rawCatalog);
  const { trackSessionEvent } = useSessionTracker();

  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSku, setCheckoutSku] = useState<string | null>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    : (() => {
        // Non-lamp products from diverse categories for featured display
        const nonLamp = productCatalog.filter((p) => {
          const cat = p.category.toLowerCase();
          const name = p.name.toLowerCase();
          return !cat.includes('lamp') && !cat.includes('lighting') && !name.includes('lamp');
        });
        // Pick from different categories
        const seen = new Set<string>();
        const diverse: ProductRecord[] = [];
        for (const p of nonLamp) {
          if (!seen.has(p.category)) {
            diverse.push(p);
            seen.add(p.category);
            if (diverse.length >= 3) break;
          }
        }
        return diverse.length >= 3 ? diverse : productCatalog.slice(0, 3);
      })();

  const hasChat = chatMessages.length > 0;

  // Detect lamp context — user asked about lamps/lighting or assistant showed arc lamp products
  const showLampProducts = hasChat && chatMessages.some((msg) => {
    if (msg.role === 'user') {
      const t = msg.text.toLowerCase();
      return t.includes('lamp') || t.includes('lighting');
    }
    if (msg.role === 'assistant' && msg.products) {
      return msg.products.some((sku) => sku.startsWith('ARKO-ARC-'));
    }
    return false;
  });

  // When in lamp mode, swap featured products to lamp/lighting items
  const featuredProducts = showLampProducts
    ? productCatalog
        .filter((p) => {
          const cat = p.category.toLowerCase();
          const name = p.name.toLowerCase();
          return cat.includes('lamp') || cat.includes('lighting') || name.includes('lamp');
        })
        .slice(0, 3)
    : productResults;

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
        <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6">
          {/* Product results — always at top */}
          <div className="flex flex-col gap-3">
            {(() => {
              const displayProducts = hasChat && !hasQuery ? featuredProducts : productResults;
              const label = hasQuery
                ? `${productResults.length} product${productResults.length !== 1 ? 's' : ''} for "${query}"`
                : hasChat
                  ? showLampProducts ? 'Lamp collection' : 'You might also like'
                  : 'Featured products';
              return displayProducts.length > 0 ? (
                <>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    {label}
                  </p>
                  {displayProducts.slice(0, 6).map((p) => (
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
              ) : null;
            })()}
          </div>

          {/* Spacer — pushes content below to the bottom when it doesn't overflow */}
          <div className="flex-1 min-h-0" />

          {/* AI suggestion row (State 2: query present, no chat yet) */}
          {hasQuery && !hasChat && (
            <div className="mt-6">
              <AiSuggestionRow query={query} onClick={handleAiClick} />
            </div>
          )}

          {/* Chat thread (State 3) — pinned to bottom via spacer above */}
          {(hasChat || isThinking) && (
            <div className="mt-6">
              <ChatThread
                messages={chatMessages}
                isThinking={isThinking}
                productCatalog={productCatalog}
                onAddToCart={handleAddToCart}
                onSuggestionSelect={handleSuggestionSelect}
              />
            </div>
          )}

          {/* AI intro card + suggestion prompt chips — only when idle (no query, no chat) */}
          {!hasQuery && !hasChat && (
            <div className="mt-6 space-y-4">
              {/* Intro card */}
              <div className="flex gap-3 rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Sparkle className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-foreground text-sm leading-relaxed">
                  Hi! I&apos;m your shopping assistant. Search for specific products, or tell me what you&apos;re looking for and I&apos;ll help find the perfect match.
                </p>
              </div>
              {/* Prompt chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  "I'm looking for a lamp for my living room",
                  "I need a new couch",
                  "Help me style my office",
                ].map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handlePromptChip(text)}
                    className="rounded-full border border-purple-200 bg-white px-3.5 py-2 text-xs font-medium text-purple-700 shadow-sm transition-colors hover:border-purple-400 hover:bg-purple-50"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

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
