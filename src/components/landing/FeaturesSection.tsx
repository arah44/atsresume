'use client';

import { Sparkles, Target, Zap, Repeat, FileCheck, Download } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { OrbitingCircles } from '@/components/ui/orbiting-circles';

const features = [
  {
    name: 'AI-Powered Analysis',
    description:
      'Automatically extracts and structures your experience with smart keyword matching and optimization.',
    icon: Sparkles,
    href: '/dashboard/profile',
    cta: 'Try It Now',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="flex absolute inset-0 justify-center items-center opacity-30">
        <OrbitingCircles
          className="w-8 h-8 border-none bg-primary"
          radius={80}
          duration={20}
          reverse
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </OrbitingCircles>
        <OrbitingCircles
          className="w-8 h-8 bg-purple-500 border-none"
          radius={120}
          duration={30}
        >
          <Zap className="w-6 h-6 text-purple-500" />
        </OrbitingCircles>
      </div>
    ),
  },
  {
    name: 'ATS-Friendly Formats',
    description: 'Clean, professional templates that pass ATS screening every time.',
    icon: FileCheck,
    href: '/dashboard',
    cta: 'View Templates',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute top-0 right-0 w-full h-full">
        <div className="absolute right-4 top-8 opacity-40">
          <FileCheck className="w-40 h-40 text-primary/30" strokeWidth={0.5} />
        </div>
      </div>
    ),
  },
  {
    name: 'Job-Specific Customization',
    description:
      'Tailored summaries and relevant skill highlighting for each position you apply to.',
    icon: Target,
    href: '/dashboard',
    cta: 'Get Started',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute bottom-0 left-0 w-full h-full">
        <div className="absolute left-4 bottom-8 opacity-40">
          <Target className="w-40 h-40 text-purple-500/30" strokeWidth={0.5} />
        </div>
      </div>
    ),
  },
  {
    name: 'One Profile, Unlimited Resumes',
    description: 'Create your profile once and generate unlimited customized versions for every job.',
    icon: Repeat,
    href: '/dashboard/profile',
    cta: 'Create Profile',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="flex absolute inset-0 justify-center items-center">
        <div className="grid grid-cols-4 gap-3 opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-lg border transition-all duration-300 border-primary/40 bg-primary/10 hover:scale-105"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    name: 'Fast Generation',
    description: 'Get your optimized resume in minutes with real-time AI processing.',
    icon: Zap,
    href: '/dashboard',
    cta: 'Learn More',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="overflow-hidden absolute inset-0">
        <div className="absolute -right-8 top-1/2 w-32 h-32 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full opacity-40 blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-linear-to-r from-orange-400 to-red-500 rounded-full opacity-30 blur-2xl" />
      </div>
    ),
  },
  {
    name: 'Download & Share',
    description: 'Export as PDF or JSON and easily share via link with anyone.',
    icon: Download,
    href: '/dashboard',
    cta: 'See Options',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute inset-0">
        <div className="absolute bottom-6 left-6 opacity-40">
          <Download className="w-32 h-32 text-blue-500/30" strokeWidth={0.5} />
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container px-4 sm:px-6 mx-auto">
        <BlurFade delay={0.1} inView>
          <div className="mx-auto mb-10 sm:mb-12 md:mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Everything you need to create winning resumes
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <BentoGrid className="mx-auto max-w-6xl">
            {features.map((feature) => (
              <BentoCard
                key={feature.name}
                name={feature.name}
                className={feature.className}
                background={feature.background}
                Icon={feature.icon}
                description={feature.description}
                href={feature.href}
                cta={feature.cta}
              />
            ))}
          </BentoGrid>
        </BlurFade>
      </div>
    </section>
  );
}

