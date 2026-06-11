/**
 * MockCommerceCheckout -- Static mock checkout modal for demo purposes.
 *
 * Persona-aware: shows 15% platinum discount for Jordan, full price for others.
 * Commerce badge + color are configurable via props (reads from Integration
 * Simulator 3P app config or is passed as a prop).
 */
'use client';

import { ShoppingCart, Check, Package } from 'lucide-react';
import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CheckoutItem {
  name: string;
  variant?: string;
  price: number;
  quantity?: number;
}

interface MockCommerceCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Persona name for the order header */
  personaName?: string;
  /** Loyalty tier (platinum gets 15% discount) */
  loyaltyTier?: string;
  /** Items in the cart */
  items?: CheckoutItem[];
  /** Commerce platform badge label */
  commerceBadge?: string;
  /** Commerce platform badge color */
  commerceColor?: string;
}

export function MockCommerceCheckout({
  open,
  onOpenChange,
  personaName = 'Guest',
  loyaltyTier,
  items = [{ name: 'Arko Arc 900', variant: 'matte black', price: 149.0 }],
  commerceBadge = 'Commerce',
  commerceColor = '#0070f3',
}: MockCommerceCheckoutProps) {
  const [confirmed, setConfirmed] = useState(false);

  const isPlatinum = loyaltyTier?.toLowerCase() === 'platinum';
  const discountRate = isPlatinum ? 0.15 : 0;
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (item.quantity ?? 1),
    0,
  );
  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  const handleComplete = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onOpenChange(false);
    }, 2500);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setConfirmed(false);
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {personaName}&apos;s order
          </DialogTitle>
          <DialogDescription>Review your order details</DialogDescription>
        </DialogHeader>

        {confirmed ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">
                Order confirmed
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Estimated delivery: 2 business days
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Line items */}
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                      <Package className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-slate-500">{item.variant}</p>
                      )}
                      {(item.quantity ?? 1) > 1 && (
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    ${(item.price * (item.quantity ?? 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Discount line */}
            {isPlatinum && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Platinum member discount (15%)
                </p>
                <p className="text-sm font-medium text-green-600">
                  -${discount.toFixed(2)}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <p className="text-base font-semibold text-slate-900">Total</p>
              <p className="text-base font-bold text-slate-900">
                ${total.toFixed(2)}
              </p>
            </div>

            {/* Delivery estimate */}
            <p className="text-xs text-slate-400">
              Estimated delivery: 2 business days
            </p>

            {/* Commerce badge */}
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: commerceColor }}
              />
              <span className="text-xs font-medium text-slate-600">
                Powered by {commerceBadge}
              </span>
            </div>

            {/* Action */}
            <Button
              onClick={handleComplete}
              className={cn('w-full')}
              style={{ background: commerceColor }}
            >
              Complete purchase
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
