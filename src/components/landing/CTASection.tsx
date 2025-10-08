'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Particles } from '@/components/ui/particles';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Background Particles */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#a855f7"
        refresh
      />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to Land Your Dream Job?
            </h2>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Join thousands of job seekers who&apos;ve simplified their
              application process
            </p>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <Link href="/dashboard/profile">
              <ShimmerButton className="px-10 py-7 text-xl shadow-2xl">
                <span className="flex items-center gap-2 whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
                  Create Your Profile Now
                  <ArrowRight className="h-6 w-6" />
                </span>
              </ShimmerButton>
            </Link>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-500"
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
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-500"
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
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-500"
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

