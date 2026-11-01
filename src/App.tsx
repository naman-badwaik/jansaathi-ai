import { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import type { 
  PageRoute, 
  ToastMessage, 
  SupportedLanguage, 
  CitizenProfile,
  CitizenIntakeData,
  MockPortalApplication,
  ApplicationItem,
  VerifiedScheme,
  ExtractedDocumentData,
  ClientAction,
  ClientActionResult
} from './types';
import { executeClientAction, type ActionExecutionContext } from './services/clientActionDispatcher';
import { VERIFIED_SCHEMES_DB } from './services/schemeKnowledgeBase';
import { 
  SAMPLE_SCHEMES, 
  SAMPLE_APPLICATIONS, 
  SAMPLE_ACTIVITIES, 
  SAMPLE_CENTRES 
} from './data/mockData';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Assistant Components
import { AiAssistantPanel } from './components/assistant/AiAssistantPanel';
import { VoiceAssistantModal } from './components/assistant/VoiceAssistantModal';

// Track 3 CITY-02 Agent Modals
import { FullDemoRunnerModal } from './components/demo/FullDemoRunnerModal';
import { ApplicationAgentModal } from './components/agent/ApplicationAgentModal';
import { ProactiveFollowUpModal } from './components/followup/ProactiveFollowUpModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverSchemesPage } from './pages/DiscoverSchemesPage';
import { DocumentAssistantPage } from './pages/DocumentAssistantPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AssistanceCentresPage } from './pages/AssistanceCentresPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Auth Components
import { AuthModal } from './components/auth/AuthModal';
import { SupabaseSetupModal } from './components/auth/SupabaseSetupModal';

// Common Components
import { Toast } from './components/common/Toast';
import { useTranslation } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';

export function App() {
  const { language, setLanguage } = useTranslation();
  const { user, profile: authProfile, isConfigured, isAuthenticated } = useAuth();
  
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  // Auth & Setup Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [customProfile, setCustomProfile] = useState<Partial<CitizenProfile>>({});

  // Track 3 CITY-02 Modal & Intake States
  const [activeIntakeData, setActiveIntakeData] = useState<CitizenIntakeData | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<VerifiedScheme | null>(null);
  const [verifiedDocs, setVerifiedDocs] = useState<ExtractedDocumentData[]>([]);
  const [selectedFollowUpApp, setSelectedFollowUpApp] = useState<ApplicationItem | null>(null);

  const [applicationsList, setApplicationsList] = useState<ApplicationItem[]>(() => {
    try {
      const stored = localStorage.getItem('jansaathi_applications');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return SAMPLE_APPLICATIONS;
  });

  const [isFullDemoModalOpen, setIsFullDemoModalOpen] = useState(false);
  const [isApplicationAgentModalOpen, setIsApplicationAgentModalOpen] = useState(false);
  const [isProactiveFollowUpModalOpen, setIsProactiveFollowUpModalOpen] = useState(false);
  const [voiceTranscribedText, setVoiceTranscribedText] = useState('');

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastCounterRef = useRef(1);

  // Dynamically constructed active profile prioritizing Supabase authenticated record
  const activeProfile: CitizenProfile = {
    name: authProfile?.name || user?.user_metadata?.name || (isAuthenticated && user?.email ? user.email.split('@')[0] : (customProfile.name || 'Citizen')),
    state: authProfile?.state || customProfile.state || (isAuthenticated ? 'Not Specified' : 'National Portal'),
    district: authProfile?.district || customProfile.district || (isAuthenticated ? 'Not Specified' : 'All Districts'),
    category: authProfile?.category || customProfile.category || 'General',
    occupation: authProfile?.occupation || customProfile.occupation || 'Citizen',
    annualIncomeBracket: authProfile?.annual_income_bracket || customProfile.annualIncomeBracket || 'Not Specified',
    digilockerLinked: authProfile?.digilocker_linked ?? (customProfile.digilockerLinked ?? false),
    aadhaarVerified: authProfile?.aadhaar_verified ?? (customProfile.aadhaarVerified ?? false),
    phone: authProfile?.phone || user?.user_metadata?.phone || customProfile.phone || (isAuthenticated ? 'Not Linked' : 'Not Linked'),
  };

  const schemes = SAMPLE_SCHEMES;
  const activities = SAMPLE_ACTIVITIES;
  const centres = SAMPLE_CENTRES;

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    toastCounterRef.current += 1;
    setToast({
      id: `toast-${toastCounterRef.current}`,
      type,
      title,
      message
    });
  };

  const handleSelectSchemeForDocuments = (scheme: VerifiedScheme) => {
    setSelectedScheme(scheme);
    setCurrentRoute('documents');
    showToast('Required Documents Loaded', `Checklist for ${scheme.title} ready for verification.`, 'info');
  };

  const handleOpenApplicationAgent = (scheme?: VerifiedScheme) => {
    if (scheme) {
      setSelectedScheme(scheme);
    }
    setIsApplicationAgentModalOpen(true);
  };

  const handleDocumentsVerified = (docs: ExtractedDocumentData[]) => {
    setVerifiedDocs(docs);
    setIsApplicationAgentModalOpen(true);
    showToast('Credentials Bound', `${docs.length} verified documents transferred to Application Agent.`, 'success');
  };

  const handleOpenProactiveFollowUp = (app: ApplicationItem) => {
    setSelectedFollowUpApp(app);
    setIsProactiveFollowUpModalOpen(true);
  };

  const handleApplicationSubmitted = (newApp: MockPortalApplication) => {
    const createdItem: ApplicationItem = {
      id: `app-${Date.now()}`,
      applicationNumber: newApp.applicationNumber,
      schemeTitle: newApp.schemeTitle,
      category: 'Housing',
      appliedDate: newApp.submittedAt,
      lastUpdated: 'Just now',
      currentStage: 'Gram Panchayat Scrutiny',
      overallProgress: 25,
      status: 'Under Review',
      statusColor: 'blue',
      nextAction: 'Field Verification by Gram Sevak within 14 days'
    };

    setApplicationsList(prev => {
      const nextList = [createdItem, ...prev];
      try {
        localStorage.setItem('jansaathi_applications', JSON.stringify(nextList));
      } catch {
        // ignore
      }
      return nextList;
    });

    // If authenticated with Supabase, persist record into database
    if (isAuthenticated && user && isConfigured) {
      void supabase.from('applications').insert({
        user_id: user.id,
        application_number: newApp.applicationNumber,
        scheme_title: newApp.schemeTitle,
        category: 'Housing',
        applied_date: newApp.submittedAt,
        last_updated: 'Just now',
        current_stage: 'Gram Panchayat Scrutiny',
        overall_progress: 25,
        status: 'Under Review',
        next_action: 'Field Verification by Gram Sevak within 14 days'
      });
    }

    showToast('Application Submitted', `Reference ID ${newApp.applicationNumber} recorded in live tracker.`, 'success');
    setCurrentRoute('applications');
  };

  const handleIntakeCompleted = (data: CitizenIntakeData) => {
    setActiveIntakeData(data);
    showToast('Intake Confirmed', 'Citizen service profile verified. Matching official schemes...', 'success');
  };

  // Sync language preference from citizen_preferences in database upon authentication
  useEffect(() => {
    if (!user || !isConfigured) return;
    let isMounted = true;

    const loadPrefs = async () => {
      try {
        const { data } = await supabase
          .from('citizen_preferences')
          .select('preferred_language')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!isMounted || !data?.preferred_language) return;
        if (data.preferred_language !== language) {
          setLanguage(data.preferred_language);
        }
      } catch {
        // Silently handle error
      }
    };

    void loadPrefs();

    return () => {
      isMounted = false;
    };
  }, [user, isConfigured, language, setLanguage]);

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    setLanguage(lang);
    const label = lang === 'Hindi' ? 'हिंदी (Hindi)' : lang === 'Marathi' ? 'मराठी (Marathi)' : 'English';
    showToast(
      'Language Selected',
      `Interface language switched to ${label}.`,
      'info'
    );

    // Persist language choice in database for authenticated citizen
    if (user && isConfigured) {
      try {
        await supabase.from('citizen_preferences').upsert({
          user_id: user.id,
          preferred_language: lang,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not persist language preference:', err);
      }
    }
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Requirement 1, 4 & 5: Centralized client action dispatcher execution handler
  const handleExecuteClientAction = async (action: ClientAction): Promise<ClientActionResult> => {
    const context: ActionExecutionContext = {
      openApplicationModal: (schemeId, applicantData) => {
        if (schemeId) {
          const found = VERIFIED_SCHEMES_DB.find((s) => s.id === schemeId);
          if (found) setSelectedScheme(found);
        }
        if (applicantData) {
          setActiveIntakeData((prev) => ({
            ...(prev || {
              needCategory: 'Housing',
              rawNeedDescription: 'Application initiated via JANSAATHI AI assistant.',
              state: 'Maharashtra',
              district: 'Pune',
              areaType: 'Rural',
              casteCategory: 'General',
              confirmedByCitizen: true
            }),
            citizenAge: typeof applicantData.age === 'number' ? applicantData.age : prev?.citizenAge,
            district: typeof applicantData.district === 'string' ? applicantData.district : (prev?.district || 'Pune'),
            state: typeof applicantData.state === 'string' ? applicantData.state : (prev?.state || 'Maharashtra'),
            housingStatus: typeof applicantData.housingStatus === 'string' ? (applicantData.housingStatus as any) : prev?.housingStatus,
            annualIncome: typeof applicantData.annualIncome === 'number' ? applicantData.annualIncome : prev?.annualIncome,
          }));
        }
        setIsApplicationAgentModalOpen(true);
      },
      openMockPortalTab: (params) => {
        const queryParams: Record<string, string> = {
          name: activeProfile.name && activeProfile.name !== 'Citizen' ? activeProfile.name : 'Ramesh Yashwant Pawar (रमेश पवार)',
          age: String(activeIntakeData?.citizenAge || 60),
          district: activeProfile.district && activeProfile.district !== 'Not Specified' && activeProfile.district !== 'All Districts' ? activeProfile.district : 'Pune',
          income: String(activeIntakeData?.annualIncome || 48000),
          housing: activeIntakeData?.housingStatus || 'Kutcha House',
          aadhaar: 'XXXX-XXXX-4912',
          ...(params || {})
        };
        const search = new URLSearchParams(queryParams).toString();
        const url = `/mock-portal/index.html?${search}`;
        return window.open(url, '_blank', 'noopener,noreferrer');
      },
      navigateTo: (route, params) => {
        setCurrentRoute(route);
        if (route === 'documents' && params?.schemeId) {
          const found = VERIFIED_SCHEMES_DB.find((s) => s.id === params.schemeId);
          if (found) setSelectedScheme(found);
        }
      },
      showToast: (title, message, type) => {
        showToast(title, message, type);
      },
      broadcastPortalMessage: (actionType, payload, step) => {
        try {
          const ch = new BroadcastChannel('jansaathi_portal_channel');
          ch.postMessage({ action: actionType, payload, step });
          ch.close();
        } catch (e) {
          console.warn('[JANSAATHI] Broadcast error:', e);
        }
      }
    };

    return executeClientAction(action, context);
  };

  const handleRouteChange = (route: PageRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPublicPage = currentRoute === 'landing';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Sidebar (Displayed on dashboard & internal pages) */}
      {!isPublicPage && (
        <Sidebar
          currentRoute={currentRoute}
          onRouteChange={handleRouteChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggleAssistant={() => {
            if (isAssistantOpen && !isAssistantMinimized) {
              setIsAssistantMinimized(true);
            } else {
              setIsAssistantOpen(true);
              setIsAssistantMinimized(false);
            }
          }}
          isAssistantOpen={isAssistantOpen && !isAssistantMinimized}
          profile={activeProfile}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!isPublicPage ? 'lg:pl-72' : ''}`}>
        {/* Header with Visible Language Selector */}
        <Header
          currentRoute={currentRoute}
          onRouteChange={handleRouteChange}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onToggleAssistant={() => {
            if (isAssistantOpen && !isAssistantMinimized) {
              setIsAssistantMinimized(true);
            } else {
              setIsAssistantOpen(true);
              setIsAssistantMinimized(false);
            }
          }}
          isAssistantOpen={isAssistantOpen && !isAssistantMinimized}
          onShowToast={showToast}
          onOpenAuthModal={handleOpenAuthModal}
          onOpenDemoRunner={() => setIsFullDemoModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1">
          {currentRoute === 'landing' && (
            <LandingPage
              onRouteChange={handleRouteChange}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentRoute === 'dashboard' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <DashboardPage
                profile={activeProfile}
                schemes={schemes}
                applications={applicationsList}
                activities={activities}
                centres={centres}
                intakeData={activeIntakeData || undefined}
                onRouteChange={handleRouteChange}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                onShowToast={showToast}
                onIntakeCompleted={handleIntakeCompleted}
                onOpenDemoRunner={() => setIsFullDemoModalOpen(true)}
              />
            </div>
          )}

          {currentRoute === 'schemes' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <DiscoverSchemesPage
                schemes={schemes}
                intakeData={activeIntakeData || undefined}
                onRouteChange={handleRouteChange}
                onOpenApplicationAgent={handleOpenApplicationAgent}
                onSelectSchemeForDocuments={handleSelectSchemeForDocuments}
                onShowToast={showToast}
              />
            </div>
          )}

          {currentRoute === 'documents' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <DocumentAssistantPage
                intakeData={activeIntakeData || undefined}
                selectedScheme={selectedScheme || undefined}
                onRouteChange={handleRouteChange}
                onDocumentsVerified={handleDocumentsVerified}
                onShowToast={showToast}
              />
            </div>
          )}

          {currentRoute === 'applications' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ApplicationsPage
                applications={applicationsList}
                onRouteChange={handleRouteChange}
                onShowToast={showToast}
                onOpenAuthModal={handleOpenAuthModal}
                onOpenProactiveFollowUp={handleOpenProactiveFollowUp}
              />
            </div>
          )}

          {currentRoute === 'centres' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <AssistanceCentresPage
                centres={centres}
                onRouteChange={handleRouteChange}
                onShowToast={showToast}
              />
            </div>
          )}

          {currentRoute === 'profile' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ProfilePage
                profile={activeProfile}
                onRouteChange={handleRouteChange}
                onShowToast={showToast}
                onOpenAuthModal={handleOpenAuthModal}
                onUpdateProfile={(updated) => setCustomProfile(prev => ({ ...prev, ...updated }))}
              />
            </div>
          )}

          {currentRoute === 'admin' && (
            <AdminDashboardPage
              onRouteChange={handleRouteChange}
              onOpenAuthModal={() => handleOpenAuthModal('login')}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Footer */}
        <Footer
          onRouteChange={handleRouteChange}
          onShowToast={showToast}
        />
      </div>

      {/* Floating AI Assistant Trigger Pill (Bottom Right) */}
      {(!isAssistantOpen || isAssistantMinimized) && (
        <button
          type="button"
          id="floating-assistant-btn"
          onClick={() => {
            setIsAssistantOpen(true);
            setIsAssistantMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-slate-700/80 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          aria-label={isAssistantMinimized ? 'Resume JANSAATHI AI Assistant' : 'Open JANSAATHI AI Assistant'}
          title={isAssistantMinimized ? 'Resume Chatbot (Minimized)' : 'Ask JANSAATHI'}
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-slate-900"></span>
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            {isAssistantMinimized ? 'Resume JANSAATHI' : 'Ask JANSAATHI'}
          </span>
          {isAssistantMinimized && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-1.5 py-0.5 rounded-full hidden sm:inline">
              Active
            </span>
          )}
        </button>
      )}

      {/* AI Assistant Sliding Panel */}
      <AiAssistantPanel
        isOpen={isAssistantOpen}
        isMinimized={isAssistantMinimized}
        onMinimize={() => setIsAssistantMinimized(true)}
        onClose={() => {
          setIsAssistantOpen(false);
          setIsAssistantMinimized(false);
          setVoiceTranscribedText('');
        }}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onShowToast={showToast}
        onOpenAuthModal={handleOpenAuthModal}
        initialPrompt={voiceTranscribedText}
        onConsumeInitialPrompt={() => setVoiceTranscribedText('')}
        autoSubmitVoicePrompt={true}
        onExecuteClientAction={handleExecuteClientAction}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedLanguage={language}
        onLanguageChange={handleLanguageChange}
        onShowToast={showToast}
        onTranscriptComplete={(transcript) => {
          setVoiceTranscribedText(transcript);
          setIsAssistantOpen(true);
          setIsAssistantMinimized(false);
        }}
      />

      {/* Track 3 CITY-02 End-to-End Walkthrough Modal */}
      <FullDemoRunnerModal
        isOpen={isFullDemoModalOpen}
        onClose={() => setIsFullDemoModalOpen(false)}
        onApplicationSubmitted={handleApplicationSubmitted}
        onShowToast={showToast}
      />

      {/* Track 3 CITY-02 Portal Browser Automation Agent Modal */}
      <ApplicationAgentModal
        isOpen={isApplicationAgentModalOpen}
        onClose={() => setIsApplicationAgentModalOpen(false)}
        intakeData={activeIntakeData || undefined}
        selectedScheme={selectedScheme || undefined}
        extractedDocs={verifiedDocs}
        onApplicationSubmitted={handleApplicationSubmitted}
        onShowToast={showToast}
      />

      {/* Track 3 CITY-02 Proactive SLA Escalation & Multilingual Voice Call Modal */}
      <ProactiveFollowUpModal
        isOpen={isProactiveFollowUpModalOpen}
        onClose={() => setIsProactiveFollowUpModalOpen(false)}
        application={selectedFollowUpApp || undefined}
        citizenName={activeProfile.name}
        onEscalationRecorded={(record) => {
          showToast('Escalation Recorded', `Escalation note logged to BDO for ${record.applicationNumber}`, 'success');
        }}
        onShowToast={showToast}
      />

      {/* Citizen Authentication Modal */}
      <AuthModal
        key={`${authModalMode}-${isAuthModalOpen}`}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onShowToast={showToast}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      />

      {/* Supabase PostgreSQL & Auth Setup Guide Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Feedback Toast */}
      <Toast
        toast={toast}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}

export default App;
