'use client';

import { Clock, XCircle, HelpCircle } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Card, CardContent } from '@/components/ui/card';

const problems = [
  {
    icon: Clock,
    title: 'Manual Customization',
    description:
      'Spending hours tailoring each resume for different jobs, copying and pasting content, and reformatting endlessly.',
  },
  {
    icon: XCircle,
    title: 'ATS Black Hole',
    description:
      'Your resume gets rejected by applicant tracking systems before humans even see it, no matter how qualified you are.',
  },
  {
    icon: HelpCircle,
    title: 'Inconsistent Results',
    description:
      "Not sure which keywords and format will work. Each job board and company has different requirements.",
  },
];

export function ProblemSection() {
  return (
    <section className="relative bg-muted/30 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <BlurFade delay={0.1} inView>
          <div className="mx-auto mb-10 sm:mb-12 md:mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Job Hunting Shouldn&apos;t Be This Hard
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              We understand the frustrations of modern job searching
            </p>
          </div>
        </BlurFade>

        <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <BlurFade key={problem.title} delay={0.2 + index * 0.1} inView>
                <Card className="group h-full border-muted transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col items-center p-6 sm:p-8 text-center">
                    <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-transform group-hover:scale-110">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <h3 className="mb-3 text-lg sm:text-xl font-semibold">
                      {problem.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

