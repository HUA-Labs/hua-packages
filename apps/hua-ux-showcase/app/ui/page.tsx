import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/layout/Footer';
import { UIShowcase } from '../../components/showcase/UIShowcase';

export default function UIPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <UIShowcase />
      </main>
      <Footer />
    </div>
  );
}
