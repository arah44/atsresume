'use client';

import { forwardRef } from 'react';
import { User, Bot, Target } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { Card, CardContent } from '@/components/ui/card';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ShimmerButton } from '@/components/ui/shimmer-button';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-background p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = 'Circle';

const steps = [
  {
    number: 1,
    icon: User,
    title: 'Create Your Profile',
    description:
      'Paste your existing resume or enter your details once. Our AI extracts all relevant information automatically.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: 2,
    icon: Bot,
    title: 'Generate Base Resume',
    description:
      'AI structures your experience, skills, and achievements into an optimized base resume that passes ATS screening.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: 3,
    icon: Target,
    title: 'Tailor for Each Job',
    description:
      'Paste a job posting. Get an ATS-optimized resume customized for that specific role in seconds.',
    color: 'from-orange-500 to-red-500',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20">
      <div className="container mx-auto px-6">
        <BlurFade delay={0.1} inView>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to your perfect resume
            </p>
          </div>
        </BlurFade>

        <div className="mx-auto max-w-5xl">
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <BlurFade key={step.number} delay={0.2 + index * 0.1} inView>
                  <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-12">
                    {/* Number & Icon */}
                    <div className="flex flex-col items-center md:items-start">
                      <div
                        className={cn(
                          'mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold text-white shadow-lg',
                          step.color
                        )}
                      >
                        <NumberTicker value={step.number} />
                      </div>
                      <div
                        className={cn(
                          'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg',
                          step.color
                        )}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>

                    {/* Content */}
                    <Card className="border-muted">
                      <CardContent className="p-8">
                        <h3 className="mb-3 text-2xl font-semibold">
                          {step.title}
                        </h3>
                        <p className="text-lg text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="ml-10 hidden h-12 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10 md:block" />
                  )}
                </BlurFade>
              );
            })}
          </div>

          {/* CTA */}
          <BlurFade delay={0.6} inView>
            <div className="mt-16 text-center">
              <Link href="/dashboard/profile">
                <ShimmerButton className="px-8 py-6 text-lg shadow-2xl">
                  <span className="whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
                    Start Building Your Resume
                  </span>
                </ShimmerButton>
              </Link>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

