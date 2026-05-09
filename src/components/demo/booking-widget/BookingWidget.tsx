'use client';

import React, { useState } from 'react';

// ── Brand tokens ──────────────────────────────────────────────────────────────

const B = {
  burgundy: '#5f0002',
  burgundyHover: '#7a0003',
  cream: '#fff9ed',
  warmGray: '#f6f1e6',
  charcoal: '#1d1d1d',
  muted: '#6b6560',
  border: '#d9d0c1',
  unavailablePattern:
    'repeating-linear-gradient(45deg, #ccc 0, #ccc 1px, transparent 0, transparent 50%) / 8px 8px',
};

// ── Types ─────────────────────────────────────────────────────────────────────

type Provider = 'revraise' | 'spaone' | 'opentable';

interface BookingWidgetProps {
  provider?: Provider;
}

interface DayData {
  date: number;
  available: boolean;
  price?: string;
}

// ── Hardcoded calendar data ───────────────────────────────────────────────────

function buildMonth(year: number, month: number): DayData[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: DayData[] = [];

  // Price grid — realistic luxury lodge rates
  const prices: Record<number, string> = {
    3: '$4,800', 4: '$4,800', 5: '$5,200', 6: '$5,200',
    7: '$6,000', 8: '$6,000', 9: '$6,000', 10: '$5,200',
    11: '$5,200', 12: '$4,800', 13: '$4,800', 14: '$5,200',
    15: '$5,200', 16: '$6,000', 17: '$6,000', 18: '$6,000',
    19: '$5,200', 20: '$5,200', 21: '$4,800', 22: '$4,800',
    23: '$5,200', 24: '$5,200', 25: '$6,000', 26: '$6,000',
    27: '$6,000', 28: '$5,200', 29: '$5,200', 30: '$4,800',
    31: '$4,800',
  };
  // Unavailable dates (already booked)
  const unavailable = new Set([1, 2, 11, 12, 25, 26]);

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: d,
      available: !unavailable.has(d),
      price: prices[d],
    });
  }
  return days;
}

const MAY_DATA = buildMonth(2026, 4);   // month index 4 = May
const JUNE_DATA = buildMonth(2026, 5);  // month index 5 = June

const MONTHS = [
  { label: 'May 2026', year: 2026, month: 4, days: MAY_DATA, startDay: 5 /* Friday */ },
  { label: 'June 2026', year: 2026, month: 5, days: JUNE_DATA, startDay: 1 /* Monday */ },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Accommodation data ────────────────────────────────────────────────────────

const ACCOMMODATIONS = [
  {
    id: 'wilderness-suite',
    name: 'Wilderness Suite',
    price: '$5,200',
    guests: 2,
    size: '65m²',
    description:
      'Perched above the treeline with panoramic views of the Southern Ocean.',
  },
  {
    id: 'garden-pavilion',
    name: 'Garden Pavilion',
    price: '$4,200',
    guests: 2,
    size: '45m²',
    description:
      'Set among native gardens with a private outdoor bath and fire pit.',
  },
  {
    id: 'grand-lodge-room',
    name: 'Grand Lodge Room',
    price: '$3,800',
    guests: 2,
    size: '35m²',
    description:
      'The heart of the lodge experience — warm timber interiors and curated local artwork.',
  },
];

// ── Provider badge ────────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<Provider, string> = {
  revraise: 'Powered by RevRaise',
  spaone: 'Powered by SpaOne',
  opentable: 'Powered by OpenTable',
};

function ProviderBadge({ provider }: { provider: Provider }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        background: 'rgba(255,255,255,0.85)',
        border: `1px solid ${B.border}`,
        borderRadius: 20,
        padding: '4px 10px',
        fontSize: 10,
        color: B.muted,
        letterSpacing: '0.04em',
        backdropFilter: 'blur(4px)',
      }}
    >
      {PROVIDER_LABELS[provider]}
    </div>
  );
}

// ── Calendar month ────────────────────────────────────────────────────────────

interface CalendarMonthProps {
  label: string;
  days: DayData[];
  startDay: number;
  selectedRange: [number | null, number | null];
  monthOffset: number;
  onSelect: (day: number, monthOffset: number) => void;
}

function CalendarMonth({
  label,
  days,
  startDay,
  selectedRange,
  monthOffset,
  onSelect,
}: CalendarMonthProps) {
  const blanks = Array.from({ length: startDay });

  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div
        style={{
          textAlign: 'center',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 16,
          letterSpacing: '0.08em',
          color: B.charcoal,
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
        }}
      >
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            style={{
              textAlign: 'center',
              fontSize: 10,
              color: B.muted,
              fontFamily: "'Josefin Sans', sans-serif",
              letterSpacing: '0.06em',
              padding: '4px 0',
            }}
          >
            {w}
          </div>
        ))}

        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const isSelected =
            selectedRange[0] !== null &&
            selectedRange[1] !== null &&
            ((monthOffset === 0 &&
              day.date >= (selectedRange[0] ?? 0) &&
              day.date <= (selectedRange[1] ?? 0)) ||
              (monthOffset === 1 &&
                day.date <= (selectedRange[1] ?? 0)));
          const isStart =
            monthOffset === 0 && day.date === selectedRange[0];
          const isEnd =
            selectedRange[1] !== null &&
            ((monthOffset === 0 && day.date === selectedRange[1]) ||
              (monthOffset === 1 && day.date === selectedRange[1]));

          if (!day.available) {
            return (
              <div
                key={day.date}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: B.warmGray,
                  opacity: 0.5,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: B.unavailablePattern,
                  }}
                />
                <span style={{ fontSize: 11, color: B.muted, position: 'relative' }}>
                  {day.date}
                </span>
              </div>
            );
          }

          return (
            <button
              key={day.date}
              onClick={() => onSelect(day.date, monthOffset)}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background:
                  isStart || isEnd
                    ? B.burgundy
                    : isSelected
                    ? `${B.burgundy}22`
                    : B.cream,
                color: isStart || isEnd ? '#fff' : B.charcoal,
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500 }}>{day.date}</span>
              {day.price && (
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: "'Josefin Sans', sans-serif",
                    letterSpacing: '0.02em',
                    color: isStart || isEnd ? 'rgba(255,255,255,0.8)' : B.muted,
                  }}
                >
                  {day.price}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── View 1 — Date selector ────────────────────────────────────────────────────

interface DateSelectorProps {
  onContinue: (checkIn: string, checkOut: string) => void;
}

function DateSelector({ onContinue }: DateSelectorProps) {
  const [range, setRange] = useState<[number | null, number | null]>([null, null]);
  const [phase, setPhase] = useState<'start' | 'end'>('start');

  const handleSelect = (day: number, monthOffset: number) => {
    const label = monthOffset === 0 ? 'May' : 'Jun';
    if (phase === 'start') {
      setRange([monthOffset === 0 ? day : day + 31, null]);
      setPhase('end');
    } else {
      const start = range[0] ?? 0;
      const end = monthOffset === 0 ? day : day + 31;
      if (end > start) {
        setRange([start, end]);
        setPhase('start');
      } else {
        setRange([end, null]);
        setPhase('end');
      }
    }
  };

  const formatDate = (absDay: number) => {
    if (absDay <= 31) return `May ${absDay}, 2026`;
    return `Jun ${absDay - 31}, 2026`;
  };

  const canContinue = range[0] !== null && range[1] !== null;
  const checkIn = range[0] ? formatDate(range[0]) : '';
  const checkOut = range[1] ? formatDate(range[1]) : '';

  // Translate absolute day to month-relative for CalendarMonth
  const monthRange0: [number | null, number | null] = [
    range[0] !== null && range[0] <= 31 ? range[0] : null,
    range[1] !== null && range[1] <= 31 ? range[1] : null,
  ];
  const monthRange1: [number | null, number | null] = [
    range[0] !== null && range[0] > 31 ? range[0] - 31 : null,
    range[1] !== null && range[1] > 31 ? range[1] - 31 : null,
  ];

  return (
    <div>
      {/* Season notice */}
      <div
        style={{
          background: B.warmGray,
          borderBottom: `1px solid ${B.border}`,
          padding: '10px 20px',
          fontSize: 12,
          color: B.muted,
          fontFamily: "'Josefin Sans', sans-serif",
          letterSpacing: '0.04em',
          textAlign: 'center',
        }}
      >
        Available year-round. Book direct for the best rates.
      </div>

      {/* Calendars */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: '24px 24px 16px',
          flexWrap: 'wrap',
        }}
      >
        <CalendarMonth
          label={MONTHS[0].label}
          days={MONTHS[0].days}
          startDay={MONTHS[0].startDay}
          selectedRange={monthRange0}
          monthOffset={0}
          onSelect={handleSelect}
        />
        <CalendarMonth
          label={MONTHS[1].label}
          days={MONTHS[1].days}
          startDay={MONTHS[1].startDay}
          selectedRange={monthRange1}
          monthOffset={1}
          onSelect={handleSelect}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px 20px',
          borderTop: `1px solid ${B.border}`,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13, color: B.charcoal }}>
          {canContinue ? (
            <span>
              <strong>{checkIn}</strong>
              {' → '}
              <strong>{checkOut}</strong>
            </span>
          ) : (
            <span style={{ color: B.muted, fontStyle: 'italic', fontSize: 12 }}>
              {phase === 'start' ? 'Select check-in date' : 'Select check-out date'}
            </span>
          )}
        </div>
        <button
          disabled={!canContinue}
          onClick={() => canContinue && onContinue(checkIn, checkOut)}
          style={{
            background: canContinue ? B.burgundy : B.border,
            color: canContinue ? '#fff' : B.muted,
            border: 'none',
            borderRadius: 3,
            padding: '10px 28px',
            fontFamily: "'Josefin Sans', sans-serif",
            letterSpacing: '0.1em',
            fontSize: 12,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            transition: 'background 0.15s',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── View 2 — Accommodation selector ──────────────────────────────────────────

interface AccommodationSelectorProps {
  checkIn: string;
  checkOut: string;
  onBack: () => void;
}

function AccommodationSelector({ checkIn, checkOut, onBack }: AccommodationSelectorProps) {
  return (
    <div>
      {/* Booking bar */}
      <div
        style={{
          background: B.charcoal,
          color: '#fff',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 12,
          fontFamily: "'Josefin Sans', sans-serif",
          letterSpacing: '0.04em',
          flexWrap: 'wrap',
        }}
      >
        <span>{checkIn} → {checkOut}</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
        <span>1 Room</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
        <span>2 Adults</span>
        <button
          onClick={onBack}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: 2,
            padding: '4px 10px',
            fontSize: 10,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Edit Dates
        </button>
      </div>

      {/* Step indicator */}
      <div
        style={{
          padding: '10px 20px',
          borderBottom: `1px solid ${B.border}`,
          fontSize: 11,
          color: B.muted,
          fontFamily: "'Josefin Sans', sans-serif",
          letterSpacing: '0.06em',
        }}
      >
        STEP 1 / 2 &nbsp;|&nbsp; SELECT YOUR ACCOMMODATION
      </div>

      {/* Accommodation cards */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ACCOMMODATIONS.map((acc) => (
          <div
            key={acc.id}
            style={{
              border: `1px solid ${B.border}`,
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              gap: 0,
              background: '#fff',
            }}
          >
            {/* Image placeholder */}
            <div
              style={{
                width: 140,
                flexShrink: 0,
                background: B.warmGray,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
              }}
            >
              <span style={{ fontSize: 10, color: B.muted, fontFamily: "'Josefin Sans', sans-serif", letterSpacing: '0.04em' }}>
                IMAGE
              </span>
            </div>

            {/* Details */}
            <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 18,
                  color: B.charcoal,
                  letterSpacing: '0.02em',
                }}
              >
                {acc.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: B.muted,
                  fontFamily: "'Josefin Sans', sans-serif",
                  letterSpacing: '0.04em',
                }}
              >
                {acc.guests} guests &nbsp;·&nbsp; {acc.size}
              </div>
              <div style={{ fontSize: 12, color: B.charcoal, lineHeight: 1.5, marginTop: 2 }}>
                {acc.description}
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 20,
                    color: B.charcoal,
                  }}
                >
                  {acc.price}
                  <span style={{ fontSize: 12, color: B.muted, fontFamily: 'sans-serif' }}>
                    {' '}/night
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      border: `1px solid ${B.burgundy}`,
                      borderRadius: 2,
                      padding: '7px 14px',
                      fontSize: 10,
                      fontFamily: "'Josefin Sans', sans-serif",
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: B.muted,
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    + More Rates
                  </button>
                  <button
                    style={{
                      border: 'none',
                      borderRadius: 2,
                      padding: '7px 14px',
                      fontSize: 10,
                      fontFamily: "'Josefin Sans', sans-serif",
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: B.burgundy,
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Select This Rate
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export function BookingWidget({ provider = 'spaone' }: BookingWidgetProps) {
  const [view, setView] = useState<'dates' | 'rooms'>('dates');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleContinue = (ci: string, co: string) => {
    setCheckIn(ci);
    setCheckOut(co);
    setView('rooms');
  };

  return (
    <div
      style={{
        position: 'relative',
        background: B.cream,
        border: `1px solid ${B.border}`,
        borderRadius: 6,
        overflow: 'hidden',
        fontFamily: 'Georgia, serif',
        color: B.charcoal,
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      {/* Widget header */}
      <div
        style={{
          background: B.burgundy,
          color: '#fff',
          padding: '14px 20px',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 18,
          letterSpacing: '0.06em',
        }}
      >
        Book Your Stay
      </div>

      {view === 'dates' ? (
        <DateSelector onContinue={handleContinue} />
      ) : (
        <AccommodationSelector
          checkIn={checkIn}
          checkOut={checkOut}
          onBack={() => setView('dates')}
        />
      )}

      <ProviderBadge provider={provider} />
    </div>
  );
}
