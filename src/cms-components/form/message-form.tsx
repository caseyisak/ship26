'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type Fields = z.infer<typeof schema>;

type Props = {
  submitLabel?: string | null;
  onSuccess: () => void;
};

export function MessageForm({ submitLabel, onSuccess }: Props) {
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
      <div className="flex flex-col gap-1">
        <Input placeholder="Your name" aria-label="Your name" {...register('name')} />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

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
        <Textarea
          placeholder="Your message…"
          aria-label="Your message"
          rows={5}
          {...register('message')}
        />
        {errors.message && (
          <p className="text-destructive text-sm">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Sending…' : (submitLabel ?? 'Send Message')}
      </Button>
    </form>
  );
}
