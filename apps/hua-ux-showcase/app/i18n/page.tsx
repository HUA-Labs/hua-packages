import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/layout/Footer';
import { I18nShowcase } from '../../components/showcase/I18nShowcase';

export default function I18nPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <I18nShowcase />
      </main>
      <Footer />
    </div>
  );
}
