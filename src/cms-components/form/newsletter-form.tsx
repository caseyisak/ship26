'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useNinetailed } from '@ninetailed/experience.js-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type Fields = z.infer<typeof schema>;

type Props = {
  submitLabel?: string | null;
  onSuccess: () => void;
};

export function NewsletterForm({ submitLabel, onSuccess }: Props) {
  const { identify } = useNinetailed();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Fields) => {
    // NT trait — marks visitor as newsletter subscriber
    setTimeout(() => {
      identify('', { isNewsletterSubscribed: true, email: values.email });
    }, 0);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Submitting…' : (submitLabel ?? 'Subscribe')}
      </Button>
    </form>
  );
}
