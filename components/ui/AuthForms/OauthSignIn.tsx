'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function OauthSignIn() {
  return (
    <div className="grid gap-2">
      {/* Remove GitHub sign-in button */}
      {/* <Button
        variant="slim"
        type="button"
        onClick={() => signIn('github')}
      >
        Sign in with GitHub
      </Button> */}
      {/* Add other OAuth providers if needed */}
    </div>
  );
}
