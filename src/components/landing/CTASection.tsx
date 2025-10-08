'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Particles } from '@/components/ui/particles';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-20">
      {/* Background Particles */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#a855f7"
        refresh
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to Land Your Dream Job?
            </h2>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl text-muted-foreground px-4 sm:px-0">
              Join thousands of job seekers who&apos;ve simplified their
              application process
            </p>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <Link href="/dashboard/profile" className="inline-block w-full sm:w-auto">
              <ShimmerButton className="w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-7 text-lg sm:text-xl shadow-2xl">
                <span className="flex items-center justify-center gap-2 whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
                  Create Your Profile Now
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
              </ShimmerButton>
            </Link>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0"
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
              <span className="hidden sm:inline text-muted-foreground/50">•</span>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0"
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
              <span className="hidden sm:inline text-muted-foreground/50">•</span>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0"
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

