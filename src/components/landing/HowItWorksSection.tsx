'use client';

import { User, Bot, Target, Sparkles } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Timeline } from '@/components/ui/timeline';
import { MagicCard } from '@/components/ui/magic-card';
import { BorderBeam } from '@/components/ui/border-beam';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ShimmerButton } from '@/components/ui/shimmer-button';

const steps = [
  {
    number: 1,
    icon: User,
    title: 'Create Your Profile',
    description:
      'Paste your resume content or upload a PDF. Our AI extracts all your information and creates a structured base resume automatically.',
    features: ['Quick Setup', 'AI Extraction', 'One-Time Entry'],
    color: 'from-blue-500 to-cyan-500',
    gradient: { from: '#3b82f6', to: '#06b6d4' },
  },
  {
    number: 2,
    icon: Bot,
    title: 'AI Creates Base Resume',
    description:
      'AI structures your experience, skills, and achievements into an optimized base resume that passes ATS screening.',
    features: ['ATS-Optimized', 'Smart Formatting', 'Achievement Focus'],
    color: 'from-purple-500 to-pink-500',
    gradient: { from: '#a855f7', to: '#ec4899' },
  },
  {
    number: 3,
    icon: Target,
    title: 'Tailor for Each Job',
    description:
      'Paste any job posting. Get an ATS-optimized resume customized for that specific role in seconds.',
    features: ['Keyword Matching', 'Role-Specific', 'Instant Results'],
    color: 'from-orange-500 to-red-500',
    gradient: { from: '#f97316', to: '#ef4444' },
  },
];

// Create timeline data
const timelineData = steps.map((step) => {
  const Icon = step.icon;
  return {
    title: `Step ${step.number}`,
    content: (
      <MagicCard
        className="relative overflow-hidden rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800"
        gradientFrom={step.gradient.from}
        gradientTo={step.gradient.to}
        gradientSize={300}
        gradientColor="#1a1a1a"
        gradientOpacity={0.05}
      >
        <BorderBeam
          size={250}
          duration={12}
          delay={step.number * 2}
          colorFrom={step.gradient.from}
          colorTo={step.gradient.to}
        />

        {/* Icon and Number Badge */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
              step.color
            )}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl font-bold text-white shadow-md',
              step.color
            )}
          >
            <NumberTicker value={step.number} />
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {step.title}
        </h3>

        {/* Description */}
        <p className="mb-6 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
          {step.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {step.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              {feature}
            </div>
          ))}
        </div>
      </MagicCard>
    ),
  };
});

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-12 sm:py-16 md:py-20">
      <div className="relative">
        <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-10 md:mb-12">
          <BlurFade delay={0.1} inView>
            <div className="mx-auto max-w-3xl text-center">
              <TextGenerateEffect
                words="How It Works"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
              />
              <p className="text-base sm:text-lg text-muted-foreground">
                Three simple steps to your perfect, ATS-optimized resume
              </p>
            </div>
          </BlurFade>
        </div>

        {/* Timeline Component */}
        <div className="relative px-4 sm:px-0">
          <Timeline data={timelineData} />
        </div>

        {/* CTA */}
        <BlurFade delay={0.6} inView>
          <div className="container mx-auto px-4 sm:px-6 mt-12 sm:mt-14 md:mt-16 text-center">
              <Link href="/dashboard/profile" className="inline-block w-full sm:w-auto">
                <ShimmerButton className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg shadow-2xl">
                  <span className="whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10">
                    Start Building Your Resume Now
                  </span>
                </ShimmerButton>
              </Link>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
              No credit card required • Get started in 60 seconds
            </p>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

