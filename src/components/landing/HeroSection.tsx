'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { DotPattern } from '@/components/ui/dot-pattern';
import { BlurFade } from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background py-20">
      {/* Background Pattern */}
      <DotPattern
        className={cn(
          'absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]'
        )}
      />

      <div className="container relative z-10 px-6 mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <BlurFade delay={0.1} inView>
            <div className="inline-flex justify-center items-center mb-8">
              <AnimatedGradientText>
                <Sparkles className="mr-2 w-4 h-4" />
                <span className="inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent">
                  AI-Powered Resume Optimization
                </span>
              </AnimatedGradientText>
            </div>
          </BlurFade>

          {/* Headline */}
          <BlurFade delay={0.2} inView>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Create {' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Job-Specific Resumes
              </span>{' '}
              in Minutes
            </h1>
          </BlurFade>

          {/* Subheadline */}
          <BlurFade delay={0.3} inView>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
              Build a base profile once, generate tailored resumes for every job
              application using AI. Pass ATS screening and land more interviews.
            </p>
          </BlurFade>

          {/* CTAs */}
          <BlurFade delay={0.4} inView>
            <div className="flex flex-col gap-4 justify-center items-center sm:flex-row">
              <Link href="/dashboard/profile">
                <ShimmerButton className="px-8 py-6 text-lg shadow-2xl">
                  <span className="flex gap-2 items-center font-medium tracking-tight leading-none text-center text-white whitespace-pre-wrap dark:from-white dark:to-slate-900/10">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </ShimmerButton>
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex gap-2 items-center px-8 py-6 text-lg font-medium rounded-lg border transition-colors group border-border bg-background text-foreground hover:bg-accent"
              >
                See How It Works
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </BlurFade>

          {/* Trust Indicators */}
          <BlurFade delay={0.5} inView>
            <div className="flex flex-wrap gap-6 justify-center items-center mt-12 text-sm text-muted-foreground">
              <div className="flex gap-2 items-center">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex gap-2 items-center">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex gap-2 items-center">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Takes 5 minutes</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

