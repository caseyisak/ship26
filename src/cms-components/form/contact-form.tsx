'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  company: z.string().optional(),
});

type Fields = z.infer<typeof schema>;

type Props = {
  submitLabel?: string | null;
  onSuccess: () => void;
};

export function ContactForm({ submitLabel, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  const onSubmit = async (_values: Fields) => {
    // Demo safe — no network call
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input placeholder="First name" aria-label="First name" {...register('firstName')} />
          {errors.firstName && (
            <p className="text-destructive text-sm">{errors.firstName.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Input placeholder="Last name" aria-label="Last name" {...register('lastName')} />
          {errors.lastName && (
            <p className="text-destructive text-sm">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            type="email"
            placeholder="you@example.com"
            aria-label="Email address"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Input placeholder="Phone (optional)" aria-label="Phone number" {...register('phone')} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Input placeholder="Company (optional)" aria-label="Company" {...register('company')} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Submitting…' : (submitLabel ?? 'Get in Touch')}
      </Button>
    </form>
  );
}
