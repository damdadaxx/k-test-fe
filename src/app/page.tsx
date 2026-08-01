import { HeroSection } from '@/components/landing/HeroSection';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <LandingHeader />
      <HeroSection />
    </div>
  );
}
