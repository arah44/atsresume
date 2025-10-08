import {
  HeroSection,
  ProblemSection,
  HowItWorksSection,
  FeaturesSection,
  CTASection,
  FooterSection,
} from '@/components/landing';

export const metadata = {
  title: 'ATSResume - Create ATS-Optimized Resumes in Minutes',
  description:
    'Build your profile once, generate tailored resumes for every job application using AI. ATS-friendly, fast, and free to start.',
  openGraph: {
    title: 'ATSResume - AI-Powered Resume Builder',
    description:
      'Create ATS-optimized resumes tailored to each job in minutes with AI technology.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}

