import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/layout/Footer';
import { MotionShowcase } from '../../components/showcase/MotionShowcase';

export default function MotionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <MotionShowcase />
      </main>
      <Footer />
    </div>
  );
}
