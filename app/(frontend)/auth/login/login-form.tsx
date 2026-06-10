'use client'

import { Suspense } from 'react'
import { GitHub } from '@/components/icons/github'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signInWithProvider } from '@/app/(payload)/admin/login/actions'
import { sanitizeCallbackUrl } from '@/lib/apex-domains'
import { useSearchParams } from 'next/navigation'

function LoginFormInner() {
  const searchParams = useSearchParams()
  const callbackUrl = sanitizeCallbackUrl(
    searchParams.get('callbackUrl') ?? '/',
  )

  return (
    <Card className="w-full max-w-sm shadow-2xl shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-primary/10 dark:ring-1 dark:ring-white/5 dark:backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Sign in to access downloads and your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form action={signInWithProvider.bind(null, 'github', callbackUrl)}>
          <Button
            type="submit"
            variant="outline"
            className="w-full cursor-pointer"
            size="lg"
          >
            <GitHub className="h-5 w-5" />
            Continue with GitHub
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-50 w-full max-w-sm" />}>
      <LoginFormInner />
    </Suspense>
  )
}
