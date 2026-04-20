'use client';

import { useNinetailed } from '@ninetailed/experience.js-react';
import { Eye, EyeOff, Globe } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/personalization/settings-context';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
}

export function LoginModal({ open, onOpenChange, onLogin }: LoginModalProps) {
  const ninetailed = useNinetailed();
  const settings = useSettings();
  const [showPassword, setShowPassword] = useState(false);

  const metadata = settings?.loggedInMetadata as
    | Record<string, unknown>
    | null
    | undefined;

  const prefillEmail = (metadata?.email as string) ?? 'casey@chicagobears.com';
  const userId = (metadata?.userId as string) ?? 'demo-stm-user';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTraits = {
      ...(settings?.loggedInMetadata ?? {}),
      isLoggedIn: true,
    };
    ninetailed.identify(userId, allTraits);
    onLogin();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in to your account</DialogTitle>
          <DialogDescription>
            Welcome back! Please enter your details
          </DialogDescription>
        </DialogHeader>

        <div className="text-center">
          <div className="mb-4 flex size-12 w-full items-center justify-center rounded-full">
            <Image
              src="/images/layout/logo-single.svg"
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
          </div>

          <h2 className="text-foreground text-2xl font-medium tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Welcome back! Please enter your details
          </p>
        </div>

        <Card className="border-border-light shadow-light bg-card w-full rounded-[12px] border text-left">
          <CardHeader className="pb-0" />
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="modal-email"
                  className="text-muted-foreground mb-2 block text-sm"
                >
                  Email
                </label>
                <Input
                  id="modal-email"
                  type="email"
                  defaultValue={prefillEmail}
                  className="h-11 rounded-[8px]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="modal-password"
                  className="text-muted-foreground mb-2 block text-sm"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="modal-password"
                    type={showPassword ? 'text' : 'password'}
                    defaultValue="Demo1234!"
                    className="h-11 rounded-[8px] pr-10"
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="text-muted-foreground/80 hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="bg-foreground text-primary-foreground hover:bg-foreground/90 h-11 w-full rounded-[8px]"
              >
                Sign In
              </Button>

              <div className="my-2 flex items-center">
                <span className="bg-border/70 h-px flex-1" />
                <span className="text-muted-foreground mx-3 text-xs whitespace-nowrap">
                  Or sign in with
                </span>
                <span className="bg-border/70 h-px flex-1" />
              </div>

              <div className="mt-4 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-center rounded-[8px] font-medium"
                >
                  <FcGoogle className="mr-2 size-5" />
                  Sign in with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-center rounded-[8px] font-medium"
                >
                  <Globe className="mr-2 size-5" />
                  Sign in with Facebook
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
