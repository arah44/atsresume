'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RetroGrid } from '@/components/ui/retro-grid';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      if (error) {
        setError(error.message || 'Failed to sign in');
        setIsLoading(false);
        return;
      }

      // Redirect on success
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <RetroGrid className="opacity-50" />

      {/* Sign In Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-background/95">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your ATS Resume account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          AI-Powered Resume Optimization
        </p>
      </motion.div>
    </div>
  );
}
