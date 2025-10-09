'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RetroGrid } from '@/components/ui/retro-grid';
import { Loader2, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard',
      });

      if (error) {
        setError(error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // Redirect on success
      router.push('/dashboard');
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

      {/* Sign Up Form */}
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
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              Join ATS Resume and optimize your career
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

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
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded ${password.length >= 12 ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-muted'}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)
                      ? '✓ Strong password'
                      : password.length >= 8
                      ? 'Good password'
                      : 'Weak password'}
                  </p>
                </div>
              )}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href="/sign-in" 
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
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

