import { useState, useEffect } from 'react';
import { AppProvider } from '@/i18n/AppContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { BottomActionCards } from '@/components/BottomActionCards';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { DiscountBanner } from '@/components/DiscountBanner';
import { SpecialistsPage } from '@/components/SpecialistsPage';
import { DoctorVerificationPage } from '@/components/DoctorVerificationPage';
import { FacilitiesPage } from '@/components/FacilitiesPage';
import { FacilityRegistrationPage } from '@/components/FacilityRegistrationPage';
import { PharmacyStorePage } from '@/components/PharmacyStorePage';
import { TrackingPage } from '@/components/TrackingPage';
import { HealthLibraryPage } from '@/components/HealthLibraryPage';
import { CompounderPage } from '@/components/CompounderPage';
import { MedicalDictionaryPage } from '@/components/MedicalDictionaryPage';
import { MediaReelsPage } from '@/components/MediaReelsPage';

type View = 'home' | 'specialists' | 'verification' | 'facilities' | 'facility-registration' | 'pharmacy-store' | 'tracking' | 'library' | 'compounder' | 'dictionary' | 'reels';

function getHashView(): { view: View; pharmacyId: string } {
  const h = window.location.hash.replace('#', '');
  if (h === 'specialists' || h === 'verification' || h === 'facilities' || h === 'facility-registration' || h === 'tracking' || h === 'library' || h === 'compounder' || h === 'dictionary' || h === 'reels') {
    return { view: h, pharmacyId: '' };
  }
  if (h.startsWith('pharmacy-store')) {
    const params = new URLSearchParams(h.split('?')[1] || '');
    return { view: 'pharmacy-store', pharmacyId: params.get('id') || 'p1' };
  }
  return { view: 'home', pharmacyId: '' };
}

function AppContent() {
  const [state, setState] = useState(getHashView);

  useEffect(() => {
    const onHash = () => {
      setState(getHashView());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (v: string) => {
    window.location.hash = v;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {state.view === 'home' && (
          <>
            <Hero />
            <Features />
            <HowItWorks />
            <BottomActionCards />
            <CTASection />
          </>
        )}
        {state.view === 'specialists' && <SpecialistsPage onNavigate={navigate} />}
        {state.view === 'verification' && <DoctorVerificationPage onNavigate={navigate} />}
        {state.view === 'facilities' && <FacilitiesPage onNavigate={navigate} />}
        {state.view === 'facility-registration' && <FacilityRegistrationPage onNavigate={navigate} />}
        {state.view === 'pharmacy-store' && <PharmacyStorePage pharmacyId={state.pharmacyId} onNavigate={navigate} />}
        {state.view === 'tracking' && <TrackingPage onNavigate={navigate} />}
        {state.view === 'library' && <HealthLibraryPage onNavigate={navigate} />}
        {state.view === 'compounder' && <CompounderPage onNavigate={navigate} />}
        {state.view === 'dictionary' && <MedicalDictionaryPage onNavigate={navigate} />}
        {state.view === 'reels' && <MediaReelsPage onNavigate={navigate} />}
      </main>
      <Footer />
      <DiscountBanner />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
