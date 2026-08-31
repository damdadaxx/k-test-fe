import { PageHeader } from '@/components/common/PageHeader';
import { HeroSection } from '@/components/landing/HeroSection';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white pt-20">
      <PageHeader />
      <HeroSection />
    </div>
  );
}
