import { useState, useEffect } from 'react';
import { AppProvider } from '@/i18n/AppContext';
import { I18nProvider } from '@/lib/i18n';
import { RouterProvider, useRouter, getPathOnly } from '@/lib/router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { BottomActionCards } from '@/components/BottomActionCards';
import { CTASection } from '@/components/CTASection';
import { DiscountBanner } from '@/components/DiscountBanner';
import { SpecialistsPage } from '@/components/SpecialistsPage';
import { DoctorVerificationPage } from '@/components/DoctorVerificationPage';
import { FacilitiesPage as LocalFacilitiesPage } from '@/components/FacilitiesPage';
import FacilitiesPage from '@/pages/FacilitiesPage';
import { FacilityRegistrationPage } from '@/components/FacilityRegistrationPage';
import { PharmacyStorePage } from '@/components/PharmacyStorePage';
import { TrackingPage } from '@/components/TrackingPage';
import { HealthLibraryPage } from '@/components/HealthLibraryPage';
import { CompounderPage } from '@/components/CompounderPage';
import { MedicalDictionaryPage } from '@/components/MedicalDictionaryPage';
import { MediaReelsPage } from '@/components/MediaReelsPage';
import AIChatWidget from '@/components/AIChatWidget';

import DoctorsPage from '@/pages/DoctorsPage';
import DoctorProfilePage from '@/pages/DoctorProfilePage';
import QuestionsPage from '@/pages/QuestionsPage';
import QuestionDetailPage from '@/pages/QuestionDetailPage';
import AskPage from '@/pages/AskPage';
import ArticlesPage from '@/pages/ArticlesPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import VideosPage from '@/pages/VideosPage';
import AudioPage from '@/pages/AudioPage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import SessionsPage from '@/pages/SessionsPage';
import AdminPage from '@/pages/AdminPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import RegisterPage from '@/pages/RegisterPage';
import SubscriptionsPage from '@/pages/SubscriptionsPage';
import ChatRoomsPage from '@/pages/ChatRoomsPage';
import LibraryPage from '@/pages/LibraryPage';
import PlannerPage from '@/pages/PlannerPage';
import ClinicsPage from '@/pages/ClinicsPage';
import RadiologyPage from '@/pages/RadiologyPage';
import LabsPage from '@/pages/LabsPage';
import PolicyPage from '@/pages/PolicyPage';
import TestsPage from '@/pages/TestsPage';
import JobsPage from '@/pages/JobsPage';
import ReferralPage from '@/pages/ReferralPage';
import AIReaderPage from '@/pages/AIReaderPage';
import FavoritesPage from '@/pages/FavoritesPage';
import CommunityPage from '@/pages/CommunityPage';
import ProfilePage from '@/pages/ProfilePage';
import AcademyPage from '@/pages/AcademyPage';
import ExamsPage from '@/pages/ExamsPage';
import AssistantsPage from '@/pages/AssistantsPage';
import PaymentsPage from '@/pages/PaymentsPage';
import SpecialtiesPage from '@/pages/SpecialtiesPage';
import SpecialtyHubPage from '@/pages/SpecialtyHubPage';
import InstitutionDetailPage from '@/pages/InstitutionDetailPage';
import ConsultationPage from '@/pages/ConsultationPage';
import MessagesPage from '@/pages/MessagesPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import MediaHubPage from '@/pages/MediaHubPage';
import SpecialistStorePage from '@/pages/SpecialistStorePage';
import StoreAdminPage from '@/pages/StoreAdminPage';
import AppsPage from '@/pages/AppsPage';
import SpecialistContentUploadPage from '@/pages/SpecialistContentUploadPage';
import ContentModerationPage from '@/pages/ContentModerationPage';
import ChooseDoctorPage from '@/pages/ChooseDoctorPage';
import AppointmentBookingPage from '@/pages/AppointmentBookingPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import VideoAppointmentDoctorPage from '@/pages/VideoAppointmentDoctorPage';
import SpecialistFreeSessionsPage from '@/pages/SpecialistFreeSessionsPage';
import PushNotifications from '@/components/PushNotifications';

type HashView = 'home' | 'specialists' | 'verification' | 'facilities' | 'facility-registration' | 'pharmacy-store' | 'tracking' | 'library' | 'compounder' | 'dictionary' | 'reels';

function getHashView(): { view: HashView; pharmacyId: string } {
  const h = window.location.hash.replace('#', '');
  if (['specialists','verification','facilities','facility-registration','tracking','library','compounder','dictionary','reels'].includes(h)) {
    return { view: h as HashView, pharmacyId: '' };
  }
  if (h.startsWith('pharmacy-store')) {
    const params = new URLSearchParams(h.split('?')[1] || '');
    return { view: 'pharmacy-store', pharmacyId: params.get('id') || 'p1' };
  }
  return { view: 'home', pharmacyId: '' };
}

function PlatformRoute() {
  const { path } = useRouter();
  const route = getPathOnly(path);
  if (route === '/') return null;
  if (route === '/doctors') return <DoctorsPage />;
  if (route.startsWith('/doctors/')) return <DoctorProfilePage id={route.split('/')[2]} />;
  if (route === '/questions') return <QuestionsPage />;
  if (route.startsWith('/questions/')) return <QuestionDetailPage id={route.split('/')[2]} />;
  if (route === '/ask') return <AskPage />;
  if (route === '/consult') return <ConsultationPage />;
  if (route.startsWith('/specialties/')) return <SpecialtyHubPage />;
  if (route.startsWith('/clinics/')) return <InstitutionDetailPage kind="clinic" />;
  if (route.startsWith('/labs/')) return <InstitutionDetailPage kind="lab" />;
  if (route.startsWith('/radiology/')) return <InstitutionDetailPage kind="radiology" />;
  if (route.startsWith('/facilities/')) return <InstitutionDetailPage kind="facility" />;
  if (route === '/media') return <MediaHubPage />;
  if (route === '/store') return <SpecialistStorePage />;
  if (route === '/cart') return <SpecialistStorePage />;
  if (route === '/admin/store') return <StoreAdminPage />;
  if (route === '/apps') return <AppsPage />;
  if (route === '/specialist/content') return <SpecialistContentUploadPage />;
  if (route === '/admin/content') return <ContentModerationPage />;
  if (route === '/articles') return <MediaHubPage />;
  if (route.startsWith('/articles/')) return <ArticleDetailPage id={route.split('/')[2]} />;
  if (route === '/videos') return <MediaHubPage />;
  if (route === '/audio') return <MediaHubPage />;
  if (route === '/courses') return <CoursesPage />;
  if (route.startsWith('/courses/')) return <CourseDetailPage id={route.split('/')[2]} />;
  if (route === '/sessions') return <SessionsPage />;
  if (route === '/specialist-sessions') return <SpecialistFreeSessionsPage />;
  if (route === '/choose-doctor') return <ChooseDoctorPage />;
  if (route === '/appointments') return <AppointmentsPage />;
  if (route === '/appointments/book') return <AppointmentBookingPage />;
  if (route === '/specialist-appointments') return <VideoAppointmentDoctorPage />;
  if (route === '/register') return <RegisterPage />;
  if (route === '/verification') return <DoctorVerificationPage onNavigate={(view) => { window.location.hash = view.startsWith('#') ? view : `#${view}`; }} />;
  if (route === '/subscriptions') return <SubscriptionsPage />;
  if (route === '/chat') return <ChatRoomsPage />;
  if (route === '/library') return <MediaHubPage />;
  if (route === '/planner') return <PlannerPage />;
  if (route === '/clinics') return <FacilitiesPage initialCategory="clinic" />;
  if (route === '/radiology') return <FacilitiesPage initialCategory="radiology" />;
  if (route === '/labs') return <FacilitiesPage initialCategory="lab" />;
  if (route === '/policy') return <PolicyPage />;
  if (route === '/tests') return <TestsPage />;
  if (route === '/facilities') return <FacilitiesPage />;
  if (route === '/jobs') return <JobsPage />;
  if (route === '/referral') return <ReferralPage />;
  if (route === '/ai-reader') return <AIReaderPage />;
  if (route === '/favorites') return <FavoritesPage />;
  if (route === '/community') return <CommunityPage />;
  if (route === '/profile') return <ProfilePage />;
  if (route === '/academy') return <AcademyPage />;
  if (route === '/exams') return <ExamsPage />;
  if (route === '/assistants') return <AssistantsPage />;
  if (route === '/payments') return <PaymentsPage />;
  if (route === '/specialties') return <SpecialtiesPage />;
  if (route === '/messages') return <MessagesPage />;
  if (route === '/notifications') return <NotificationsPage />;
  if (route === '/settings') return <SettingsPage />;
  if (route === '/admin-dashboard') return <AdminDashboardPage />;
  if (route === '/admin') return <AdminPage />;
  return null;
}

function AppContent() {
  const [state, setState] = useState(getHashView);
  const { path } = useRouter();
  const platformRoute = getPathOnly(path);

  useEffect(() => {
    const onHash = () => { setState(getHashView()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (v: string) => { window.location.hash = v; };

  const isHome = platformRoute === '/';
  const hash = window.location.hash;
  const isHomeAnchor = ['', '#', '#home', '#how-it-works', '#about', '#contact'].includes(hash);
  const localHashPage = isHome && hash && !isHomeAnchor;

  useEffect(() => {
    if (!isHome || !hash || !isHomeAnchor) return;
    const id = hash.slice(1);
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    return () => window.clearTimeout(timer);
  }, [isHome, hash, isHomeAnchor]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        {isHome && !localHashPage && (
          <>
            <Hero />
            <Features />
            <HowItWorks />
            <BottomActionCards />
            <CTASection />
          </>
        )}
        {isHome && localHashPage && state.view === 'specialists' && <SpecialistsPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'verification' && <DoctorVerificationPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'facilities' && <LocalFacilitiesPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'facility-registration' && <FacilityRegistrationPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'pharmacy-store' && <PharmacyStorePage pharmacyId={state.pharmacyId} onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'tracking' && <TrackingPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'library' && <HealthLibraryPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'compounder' && <CompounderPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'dictionary' && <MedicalDictionaryPage onNavigate={navigate} />}
        {isHome && localHashPage && state.view === 'reels' && <MediaReelsPage onNavigate={navigate} />}
        {!isHome && <PlatformRoute />}
      </main>
      <Footer />
      <DiscountBanner />
      <PushNotifications />
      {!isHome && <AIChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <I18nProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </I18nProvider>
    </AppProvider>
  );
}
