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
import SiteAdSlots from '@/components/SiteAdSlots';
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
import SB1Watermark from '@/components/SB1Watermark';

import DoctorsPage from '@/pages/DoctorsPage';
import DoctorProfilePage from '@/pages/DoctorProfilePage';
import QuestionsPage from '@/pages/QuestionsPage';
import QuestionDetailPage from '@/pages/QuestionDetailPage';
import AskPage from '@/pages/AskPage';
import ArticlesPage from '@/pages/ArticlesPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import ContentDetailPage from '@/pages/ContentDetailPage';
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
import GlobalNotificationsPage from '@/pages/GlobalNotificationsPage';
import PrivateNotificationsPage from '@/pages/PrivateNotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import MediaHubPage from '@/pages/MediaHubPage';
import SpecialistStorePage from '@/pages/SpecialistStorePage';
import WalletPage from '@/pages/WalletPage';
import CartPage from '@/pages/CartPage';
import MedicalSuppliesPage from '@/pages/MedicalSuppliesPage';
import SearchPage from '@/pages/SearchPage';
import ContractsPage from '@/pages/ContractsPage';
import ContractsCenterPage from '@/pages/ContractsCenterPage';
import DeliveryPage from '@/pages/DeliveryPage';
import ServiceCenterPage from '@/pages/ServiceCenterPage';
import StoreAdminPage from '@/pages/StoreAdminPage';
import AppsPage from '@/pages/AppsPage';
import BooksPage from '@/pages/BooksPage';
import SurgicalVideoLibraryPage from '@/pages/SurgicalVideoLibraryPage';
import LearningAdminPage from '@/pages/LearningAdminPage';
import ComplaintsPage from '@/pages/ComplaintsPage';
import ComplaintsAdminPage from '@/pages/ComplaintsAdminPage';
import ReferralTreePage from '@/pages/ReferralTreePage';
import MarketingCenterPage from '@/pages/MarketingCenterPage';
import SpecialistContentUploadPage from '@/pages/SpecialistContentUploadPage';
import ContentModerationPage from '@/pages/ContentModerationPage';
import AdminApprovalsPage from '@/pages/AdminApprovalsPage';
import OwnerTeamChatPage from '@/pages/OwnerTeamChatPage';
import QuestionAccountingPage from '@/pages/QuestionAccountingPage';
import PediatricLibraryPage from '@/pages/PediatricLibraryPage';
import ChooseDoctorPage from '@/pages/ChooseDoctorPage';
import RequestMarketplacePage from '@/pages/RequestMarketplacePage';
import AppointmentBookingPage from '@/pages/AppointmentBookingPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import VideoAppointmentDoctorPage from '@/pages/VideoAppointmentDoctorPage';
import SpecialistFreeSessionsPage from '@/pages/SpecialistFreeSessionsPage';
import PushNotifications from '@/components/PushNotifications';
import CapacityGuard from '@/components/CapacityGuard';
import JobsTicker from '@/components/JobsTicker';
import OnboardingTour from '@/components/OnboardingTour';
import OwnerCommandCenterPage from '@/pages/OwnerCommandCenterPage';
import OwnerIntegrationsPage from '@/pages/OwnerIntegrationsPage';
import OwnerSovereigntyPage from '@/pages/OwnerSovereigntyPage';
import OwnerGovernancePage from '@/pages/OwnerGovernancePage';
import SafetyCenterPage from '@/pages/SafetyCenterPage';
import SpecialistPackagesPage from '@/pages/SpecialistPackagesPage';
import SpecialistStudioPage from '@/pages/SpecialistStudioPage';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import { getSanction } from '@/lib/safetyModeration';

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
  if (route === '/wallet') return <WalletPage />;
  if (route === '/medical-supplies') return <MedicalSuppliesPage />;
  if (route === '/cart') return <CartPage />;
  if (route === '/search') return <SearchPage />;
  if (route === '/contracts') return <ContractsPage />;
  if (route === '/delivery') return <DeliveryPage />;
  if (route === '/support') return <ServiceCenterPage />;
  if (route === '/admin/store') return <StoreAdminPage />;
  if (route === '/apps') return <AppsPage />;
  if (route === '/books') return <BooksPage />;
  if (route === '/surgical-videos') return <SurgicalVideoLibraryPage />;
  if (route === '/admin/learning') return <LearningAdminPage />;
  if (route === '/complaints') return <ComplaintsPage />;
  if (route === '/admin/complaints') return <ComplaintsAdminPage />;
  if (route === '/specialist/content') return <SpecialistContentUploadPage />;
  if (route === '/specialist/packages') return <SpecialistPackagesPage />;
  if (route === '/specialist/studio') return <SpecialistStudioPage />;
  if (route === '/dashboard') return <ClientDashboardPage />;
  if (route === '/specialist/dashboard') return <SpecialistContentUploadPage />;
  if (route === '/admin/content') return <ContentModerationPage />;
  if (route === '/admin/approvals') return <AdminApprovalsPage />;
  if (route === '/admin/team-chat') return <OwnerTeamChatPage />;
  if (route === '/admin/question-accounting') return <QuestionAccountingPage />;
  if (route === '/admin/contracts-center') return <ContractsCenterPage />;
  if (route === '/pediatric-library') return <PediatricLibraryPage />;
  if (route === '/articles') return <MediaHubPage />;
  if (route.startsWith('/articles/')) return <ArticleDetailPage id={route.split('/')[2]} />;
  if (route.startsWith('/content/')) return <ContentDetailPage id={route.split('/')[2]} />;
  if (route === '/videos') return <MediaHubPage />;
  if (route === '/audio') return <MediaHubPage />;
  if (route === '/courses') return <CoursesPage />;
  if (route.startsWith('/courses/')) return <CourseDetailPage id={route.split('/')[2]} />;
  if (route === '/sessions') return <SessionsPage />;
  if (route === '/specialist-sessions') return <SpecialistFreeSessionsPage />;
  if (route === '/choose-doctor') return <ChooseDoctorPage />;
  if (route === '/requests') return <RequestMarketplacePage />;
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
  if (route === '/referral/tree') return <ReferralTreePage />;
  if (route === '/owner/marketing') return <MarketingCenterPage />;
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
  if (route === '/notifications') return <GlobalNotificationsPage />;
  if (route === '/notifications/global') return <GlobalNotificationsPage />;
  if (route === '/notifications/private') return <PrivateNotificationsPage />;
  if (route === '/settings') return <SettingsPage />;
  if (route === '/admin-dashboard') return <AdminDashboardPage />;
  if (route === '/owner/commands') return <OwnerCommandCenterPage />;
  if (route === '/owner/integrations') return <OwnerIntegrationsPage />;
  if (route === '/owner/sovereignty') return <OwnerSovereigntyPage />;
  if (route === '/owner/governance') return <OwnerGovernancePage />;
  if (route === '/safety') return <SafetyCenterPage />;
  if (route === '/admin') return <AdminPage />;
  return null;
}

function AppContent() {
  const [state, setState] = useState(getHashView);
  const [suspension,setSuspension]=useState<any>(()=>getSanction());
  useEffect(()=>{const t=window.setInterval(()=>setSuspension(getSanction()),1000);return()=>window.clearInterval(t)},[]);
  if(suspension){return <div dir="rtl" className="min-h-screen grid place-items-center bg-slate-50 p-6"><div className="max-w-xl rounded-3xl bg-white border shadow-xl p-8 text-center"><div className="text-4xl">⛔</div><h1 className="text-2xl font-extrabold mt-4">تم إيقاف الحساب مؤقتاً</h1><p className="text-gray-600 mt-3">سبب الإيقاف: {suspension.reason}</p><p className="font-bold text-red-700 mt-3">{suspension.permanent?'إيقاف دائم حتى المراجعة الإدارية':'ينتهي الإيقاف في '+new Date(suspension.until).toLocaleString()}</p><a href="/safety" className="inline-block mt-6 rounded-xl bg-teal-700 text-white px-5 py-3">مركز الأمان</a></div></div>}
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
            <JobsTicker />
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
      <SiteAdSlots />
      <DiscountBanner />
      <SB1Watermark />
        <PushNotifications />
      <CapacityGuard />
      <OnboardingTour />
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
