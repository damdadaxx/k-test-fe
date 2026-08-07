import Header from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <Header />
      <HeroSection />
    </div>
  );
}
