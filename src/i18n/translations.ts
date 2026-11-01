import type { SupportedLanguage } from '../types';

export interface Translations {
  // Navigation & Branding
  nav: {
    home: string;
    dashboard: string;
    schemes: string;
    documents: string;
    applications: string;
    centres: string;
    profile: string;
    admin: string;
    login: string;
    register: string;
    signOut: string;
    guest: string;
    tagline: string;
    getStarted: string;
    voiceAssistant: string;
    citizenServices: string;
    officialPortals: string;
    publicPortal: string;
    activeAssistant: string;
  };
  // Landing Page
  landing: {
    badgeInitiative: string;
    badgeEmpower: string;
    heroTitlePrefix: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    getStartedButton: string;
    voiceButton: string;
    trustSchemes: string;
    trustMiddlemen: string;
    trustOfficial: string;
    pillarsBadge: string;
    pillarsTitle: string;
    pillarsSubtitle: string;
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
    p3Title: string;
    p3Desc: string;
    p4Title: string;
    p4Desc: string;
    howTitleBadge: string;
    howTitle: string;
    howSubtitle: string;
    s1Title: string;
    s1Desc: string;
    s2Title: string;
    s2Desc: string;
    s3Title: string;
    s3Desc: string;
    s4Title: string;
    s4Desc: string;
    openDashboard: string;
    privacyBadge: string;
    privacyTitle: string;
    privacySubtitle: string;
    dpdpTitle: string;
    dpdpDesc: string;
    consentTitle: string;
    consentDesc: string;
    noAdsTitle: string;
    noAdsDesc: string;
    revokeTitle: string;
    revokeDesc: string;
    consentGuaranteeTitle: string;
    consentGuaranteeDesc: string;
    reviewConsentTerms: string;
    kendraSupportTitle: string;
    kendraSupportDesc: string;
    findKendraButton: string;
  };
  // Dashboard & Cards
  dashboard: {
    welcomeGreeting: string;
    verifiedCitizen: string;
    welcomeSubtitle: string;
    statEligible: string;
    statApplications: string;
    statVault: string;
    statNearestKendra: string;
    demoTag: string;
    foundationNoticeTitle: string;
    foundationNoticeDesc: string;
    schemesCardTitle: string;
    schemesCardSubtitle: string;
    searchSchemesPlaceholder: string;
    benefitLabel: string;
    targetLabel: string;
    viewAllSchemes: string;
    docCardTitle: string;
    docCardSubtitle: string;
    uploadDocPrompt: string;
    uploadDocSubtext: string;
    privacyShield: string;
    vaultListTitle: string;
    manageVault: string;
    appCardTitle: string;
    appCardSubtitle: string;
    appliedOn: string;
    currentStage: string;
    trackAllPortals: string;
    centresCardTitle: string;
    centresCardSubtitle: string;
    verifiedHub: string;
    getDirections: string;
    viewMapDirectory: string;
    otherNearby: string;
    activityTitle: string;
    activitySubtitle: string;
    privacyCardTitle: string;
    privacyCardSubtitle: string;
    dpdpStatement: string;
    digilockerAccessTitle: string;
    digilockerAccessDesc: string;
    schemeMatchTitle: string;
    schemeMatchDesc: string;
    dbtCreditTitle: string;
    dbtCreditDesc: string;
    authorized: string;
    revoked: string;
    revokeConsent: string;
    grantConsent: string;
    exportDataPackage: string;
  };
  // Assistant & Voice
  assistant: {
    title: string;
    subtitle: string;
    activeBadge: string;
    phaseNotice: string;
    initialGreeting: string;
    suggestedQueries: string;
    askPlaceholder: string;
    pressEnter: string;
    readyBadge: string;
    resetChat: string;
    closePanel: string;
    authRequiredNotice: string;
    signInToConsult: string;
    thinkingStatus: string;
    backendOfflineNotice: string;
    newChat: string;
    conversations: string;
    guestBadge: string;
    deleteChat: string;
    noConversations: string;
    voiceModalTitle: string;
    voiceModalDesc: string;
    listeningSpeech: string;
    tapToSpeak: string;
    listeningSubtext: string;
    tapToPause: string;
    tapToStart: string;
    trySpeakingPrompt: string;
    voiceLanguageLabel: string;
    voicePhaseNotice: string;
    close: string;
  };
  // Subpages
  schemesPage: {
    badge: string;
    title: string;
    subtitle: string;
    checkEligibility: string;
    prepareForm: string;
    targetCitizens: string;
    benefitPackage: string;
  };
  documentsPage: {
    badge: string;
    title: string;
    subtitle: string;
    uploadHeading: string;
    uploadSub: string;
    encryptedPrivate: string;
    ocrCheck: string;
    digilockerCompliant: string;
    verifiedVaultDocs: string;
    syncWithDigilocker: string;
  };
  applicationsPage: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    currentMilestone: string;
    complete: string;
    actionNote: string;
    downloadReceipt: string;
    officialPortalStatus: string;
  };
  centresPage: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    fromRegistered: string;
    servicesAvailable: string;
    bookSlot: string;
    getDirections: string;
  };
  profilePage: {
    badge: string;
    verifiedProfile: string;
    updateProfile: string;
    identityTrustTitle: string;
    identityTrustSubtitle: string;
    socioEconomicTitle: string;
    socioEconomicSubtitle: string;
    occupationLabel: string;
    incomeLabel: string;
    locationLabel: string;
    categoryLabel: string;
    phoneLabel: string;
    dataGuaranteeTitle: string;
    dataGuaranteeDesc: string;
    exportMyData: string;
  };
  // Categories
  categories: {
    All: string;
    Agriculture: string;
    Healthcare: string;
    Housing: string;
    SocialWelfare: string;
    WomenChild: string;
    SkillEmployment: string;
  };
  // Common UI
  common: {
    search: string;
    filterAll: string;
    verified: string;
    actionNeeded: string;
    underReview: string;
    approved: string;
    backToDashboard: string;
    reset: string;
    clearFilters: string;
    viewDetails: string;
    downloadReceipt: string;
    officialStatus: string;
    bookSlot: string;
    syncDigiLocker: string;
    updateProfile: string;
    exportMyData: string;
    noResultsFound: string;
    tryAdjustingFilters: string;
  };
  // Footer
  footer: {
    missionText: string;
    dedicatedPrivacy: string;
    citizenServicesTitle: string;
    officialPortalsTitle: string;
    supportTitle: string;
    helplineText: string;
    cpgramsPortal: string;
    privacyConsentControls: string;
    copyright: string;
    builtForCitizens: string;
    phaseBadge: string;
  };
  // Authentication & Supabase
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    loginOtpTitle: string;
    loginOtpSubtitle: string;
    loginPasswordTitle: string;
    verifyLoginOtpTitle: string;
    verifySignupOtpTitle: string;
    verifyOtpSubtitle: string;
    otpLabel: string;
    otpInputPlaceholder: string;
    sendOtpButton: string;
    verifyOtpButton: string;
    verifySignupButton: string;
    resendCode: string;
    resendInSeconds: string;
    changeEmailOrDetails: string;
    signInWithPasswordOption: string;
    signInWithOtpOption: string;
    otpSentNotice: string;
    invalidOtpMessage: string;
    registerTitle: string;
    registerSubtitle: string;
    forgotTitle: string;
    forgotSubtitle: string;
    fullNameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    registerButton: string;
    resetButton: string;
    backToLogin: string;
    noAccountPrompt: string;
    hasAccountPrompt: string;
    forgotPasswordPrompt: string;
    guestContinue: string;
    authenticatedWelcome: string;
    signOut: string;
    protectedNotice: string;
    setupPendingTitle: string;
    setupPendingDesc: string;
    viewSetupInstructions: string;
    sessionExpired: string;
    authSuccessLogin: string;
    authSuccessRegister: string;
    authSuccessReset: string;
  };
  // Admin Dashboard
  admin: {
    badge: string;
    title: string;
    subtitle: string;
    statTotalUsers: string;
    statLogins: string;
    statApplications: string;
    statActiveSchemes: string;
    recentRegistrations: string;
    loginAuditTrail: string;
    systemActivity: string;
    accessDeniedTitle: string;
    accessDeniedDesc: string;
    returnToDashboard: string;
    roleCitizen: string;
    roleAdmin: string;
    liveDataConnected: string;
    demoTelemetryNotice: string;
    userHeader: string;
    emailHeader: string;
    roleHeader: string;
    registeredOnHeader: string;
    loginTimeHeader: string;
    clientHeader: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  English: {
    nav: {
      home: 'Public Landing Page',
      dashboard: 'Citizen Dashboard',
      schemes: 'Discover Schemes',
      documents: 'Document Assistant',
      applications: 'My Applications',
      centres: 'Assistance Centres',
      profile: 'My Profile',
      admin: 'Admin Console',
      login: 'Sign In',
      register: 'Register',
      signOut: 'Sign Out',
      guest: 'Guest Citizen',
      tagline: 'Government services, made simpler for everyone.',
      getStarted: 'Get Started',
      voiceAssistant: 'Voice Assistant',
      citizenServices: 'Citizen Services',
      officialPortals: 'Official Portals',
      publicPortal: 'Public Portal',
      activeAssistant: 'Voice & Chat Ready'
    },
    landing: {
      badgeInitiative: 'Digital India Initiative',
      badgeEmpower: 'Empowering 1.4 Billion Citizens',
      heroTitlePrefix: 'Government services,',
      heroTitleHighlight: 'made simpler for everyone.',
      heroSubtitle: 'JANSAATHI AI is an intelligent citizen-service agent that helps Indian citizens discover welfare schemes, understand eligibility, analyse documents, prepare applications and track their progress seamlessly.',
      getStartedButton: 'Get Started',
      voiceButton: 'Voice Assistant',
      trustSchemes: '2,500+ Central & State Schemes',
      trustMiddlemen: 'Zero Middlemen & 100% Free',
      trustOfficial: 'Official Portals & DigiLocker Grounded',
      pillarsBadge: 'Core Platform Capabilities',
      pillarsTitle: 'How JANSAATHI AI Serves You',
      pillarsSubtitle: 'Every citizen deserves clear, prompt, and dignified access to public welfare benefits.',
      p1Title: 'Discover Schemes',
      p1Desc: 'AI matches your age, occupation, income, and state against 2,500+ Central and State welfare programs.',
      p2Title: 'Document Assistant',
      p2Desc: 'Upload Aadhaar, PAN, or income certificates. Verify compliance and eligibility before applying.',
      p3Title: 'Voice-First Access',
      p3Desc: 'Speak in Hindi, Marathi, or English. Designed for every citizen, regardless of digital literacy.',
      p4Title: 'Track Applications',
      p4Desc: 'Follow progress across multiple government department portals from one single unified citizen dashboard.',
      howTitleBadge: 'Step-by-step guidance',
      howTitle: 'From Inquiry to Direct Benefit',
      howSubtitle: 'Clear milestone progression without confusing bureaucratic hurdles.',
      s1Title: 'Share Citizen Profile',
      s1Desc: 'Answer a few simple questions or link DigiLocker to map applicable welfare opportunities.',
      s2Title: 'Verify Eligibility',
      s2Desc: 'Smart criteria analyzer ensures you meet all government scheme conditions before submission.',
      s3Title: 'Prepare Application',
      s3Desc: 'Get structured checklists, pre-filled forms, and required document formats.',
      s4Title: 'Track Benefits & Status',
      s4Desc: 'Receive alerts when your application progresses or when direct benefit transfer (DBT) is credited.',
      openDashboard: 'Open Citizen Dashboard',
      privacyBadge: 'Sovereign Citizen Trust',
      privacyTitle: 'Privacy & Citizen Consent Framework',
      privacySubtitle: 'Transparent, secure, and respectful of citizen fundamental rights under Indian digital data laws.',
      dpdpTitle: 'DPDP Act 2023 Aligned',
      dpdpDesc: 'Built in strict accordance with the Digital Personal Data Protection Act of India, guaranteeing data minimization and purpose limitation.',
      consentTitle: 'Explicit Citizen Consent',
      consentDesc: 'No personal identification is accessed without explicit, informed OTP-based citizen authorization for each specific scheme.',
      noAdsTitle: 'Zero Commercial Exploitation',
      noAdsDesc: 'Citizen data is never commercialized, sold to third parties, or used for advertising. Purely dedicated to public welfare delivery.',
      revokeTitle: 'Right to Revoke & Erase',
      revokeDesc: 'Citizens retain complete ownership with one-click revocation of data access and instant deletion of uploaded records from the vault.',
      consentGuaranteeTitle: 'Citizen Electronic Consent (e-Consent) Guarantee',
      consentGuaranteeDesc: 'Every query or document upload is encrypted with AES-256 standard. JANSAATHI AI never stores raw biometric data and accesses DigiLocker or UIDAI records only after you explicitly confirm authorization.',
      reviewConsentTerms: 'Review Consent Terms',
      kendraSupportTitle: 'Prefer In-Person Support?',
      kendraSupportDesc: 'JANSAATHI AI connects you with certified Common Service Centres (CSCs) and Citizen Seva Kendras in your local Tehsil or Gram Panchayat.',
      findKendraButton: 'Find Nearby Seva Kendra'
    },
    dashboard: {
      welcomeGreeting: 'Namaste, Citizen',
      verifiedCitizen: 'Aadhaar & DigiLocker Verified',
      welcomeSubtitle: 'Your personalised citizen command centre. JANSAATHI AI actively monitors government gazettes, subsidies, and your application status in',
      statEligible: 'Eligible Schemes',
      statApplications: 'Tracked Applications',
      statVault: 'Documents Verified',
      statNearestKendra: 'Nearest Kendra',
      demoTag: '(Demo)',
      foundationNoticeTitle: 'Phase 1 Frontend Foundation Active',
      foundationNoticeDesc: 'All interactive citizen cards, status flows, and navigation routes are functional. Official state API adapters and live LLM inference will be linked in Phase 2.',
      schemesCardTitle: 'Discover Government Schemes',
      schemesCardSubtitle: 'Central and State welfare programs mapped to citizen profiles',
      searchSchemesPlaceholder: 'Search schemes by keyword, benefit, or sector...',
      benefitLabel: 'Benefit Package:',
      targetLabel: 'Target Citizens:',
      viewAllSchemes: 'View All Schemes',
      docCardTitle: 'Document Assistant',
      docCardSubtitle: 'AI-powered OCR verification & DigiLocker readiness checker',
      uploadDocPrompt: 'Upload Document for Verification (Demo Placeholder)',
      uploadDocSubtext: 'Supports Aadhaar, PAN, Ration Card, Land Records (PDF, JPG, PNG up to 10MB)',
      privacyShield: 'Local OCR Privacy Shield',
      vaultListTitle: 'Citizen Document Vault (Demo Preview)',
      manageVault: 'Manage Vault',
      appCardTitle: 'My Applications',
      appCardSubtitle: 'Real-time progress tracking across central and state welfare portals',
      appliedOn: 'Applied on',
      currentStage: 'Current Stage:',
      trackAllPortals: 'Track All Portals',
      centresCardTitle: 'Find Assistance Centres',
      centresCardSubtitle: 'Physical Common Service Centres (CSC) and Citizen Seva Kendras nearby',
      verifiedHub: 'Ministry Certified',
      getDirections: 'Get Directions',
      viewMapDirectory: 'View Map Directory',
      otherNearby: 'Other Nearby Kendras (Demo):',
      activityTitle: 'Recent Activity',
      activitySubtitle: 'Automated audit trail of your schemes, document checks and portal submissions',
      privacyCardTitle: 'Privacy & Citizen Consent Management',
      privacyCardSubtitle: 'Digital Personal Data Protection (DPDP) Act sovereign consent settings',
      dpdpStatement: 'In compliance with the Digital Personal Data Protection Act (DPDP), JANSAATHI AI accesses citizen databases strictly with your active electronic consent. You can inspect, modify, or revoke permissions at any time.',
      digilockerAccessTitle: 'DigiLocker Access',
      digilockerAccessDesc: 'Retrieval of Aadhaar, Ration Card, and Land Records for eligibility checks.',
      schemeMatchTitle: 'Scheme Matching',
      schemeMatchDesc: 'Automated matching of demographic attributes against central/state scheme criteria.',
      dbtCreditTitle: 'DBT Direct Credit',
      dbtCreditDesc: 'Notification integration with NPCI mandate for direct subsidy disbursement status.',
      authorized: 'Authorized',
      revoked: 'Revoked',
      revokeConsent: 'Revoke Consent',
      grantConsent: 'Grant Consent',
      exportDataPackage: 'Export My Data Package'
    },
    assistant: {
      title: 'JANSAATHI AI',
      subtitle: 'Citizen Assistant • Multilingual',
      activeBadge: 'Active',
      phaseNotice: 'Powered by Gemini 2.5 Flash: Multi-turn multilingual welfare scheme guidance.',
      initialGreeting: 'Namaste! I am your JANSAATHI AI assistant. How can I assist you today with Indian welfare schemes, document eligibility, or application tracking?',
      suggestedQueries: 'Suggested citizen queries:',
      askPlaceholder: 'Ask about schemes, eligibility, documents...',
      pressEnter: 'Press Enter to send',
      readyBadge: 'Indic Assistant Ready',
      resetChat: 'Reset Conversation',
      closePanel: 'Close assistant panel',
      authRequiredNotice: 'Authentication required. Please sign in to consult JANSAATHI AI and receive personalized scheme eligibility checks.',
      signInToConsult: 'Sign In / Register',
      thinkingStatus: 'JANSAATHI AI is analyzing government schemes...',
      backendOfflineNotice: 'Unable to connect to the AI assistant service. Please check your internet connection or verify the Supabase Edge Function deployment.',
      newChat: 'New Consultation',
      conversations: 'Saved Consultations',
      guestBadge: 'Guest Citizen Mode',
      deleteChat: 'Delete consultation',
      noConversations: 'No saved consultations yet',
      voiceModalTitle: 'JANSAATHI Voice Assistant',
      voiceModalDesc: 'Voice-first accessibility in Hindi, English, and Marathi.',
      listeningSpeech: 'Listening to citizen speech...',
      tapToSpeak: 'Tap the microphone to speak',
      listeningSubtext: 'Speak naturally. The speech visualizer is active.',
      tapToPause: 'Tap to pause microphone',
      tapToStart: 'Tap to start speaking',
      trySpeakingPrompt: 'Try speaking queries like:',
      voiceLanguageLabel: 'Voice Language:',
      voicePhaseNotice: 'Phase 1 Frontend Foundation: Voice visualizer & state flow are fully interactive. Live Speech-to-Text (STT) and Indic LLM voice inference will be integrated in Phase 2.',
      close: 'Close'
    },
    schemesPage: {
      badge: 'Welfare Scheme Repository',
      title: 'Discover Central & State Schemes',
      subtitle: 'Browse through verified welfare initiatives across agriculture, healthcare, housing, and social security.',
      checkEligibility: 'Check Eligibility',
      prepareForm: 'Prepare Form',
      targetCitizens: 'Target Citizens:',
      benefitPackage: 'Benefit Package:'
    },
    documentsPage: {
      badge: 'Intelligent Document Assistant',
      title: 'Citizen Document Vault & OCR Verification',
      subtitle: 'Validate government IDs, certificates, and land records against official scheme requirements before applying.',
      uploadHeading: 'Drag & Drop or Click to Upload Government Documents (Demo Placeholder)',
      uploadSub: 'Upload Aadhaar, PAN card, Ration card, Land record, or Income Certificate. Supported formats: PDF, JPG, PNG (Max 10MB per file).',
      encryptedPrivate: 'Encrypted & Private',
      ocrCheck: 'OCR Auto-Check',
      digilockerCompliant: 'DigiLocker Compliant',
      verifiedVaultDocs: 'Verified Documents in Your Vault (Demo Records)',
      syncWithDigilocker: 'Sync with DigiLocker'
    },
    applicationsPage: {
      badge: 'Welfare Benefit Tracker',
      title: 'My Government Applications',
      subtitle: 'Live multi-stage progress tracking across central ministries and state portals.',
      searchPlaceholder: 'Search by application number or scheme name...',
      currentMilestone: 'Current Milestone:',
      complete: 'Complete',
      actionNote: 'Action Note:',
      downloadReceipt: 'Download Receipt',
      officialPortalStatus: 'Official Portal Status'
    },
    centresPage: {
      badge: 'Verified Citizen Support',
      title: 'Find Assistance Centres',
      subtitle: 'Locate authorized Common Service Centres (CSCs), Gram Panchayat Suvidha Kendras, and Citizen Facilitation Desks near you.',
      searchPlaceholder: 'Search by locality, PIN code, or centre name...',
      fromRegistered: 'From registered location',
      servicesAvailable: 'Available Facilitation Services:',
      bookSlot: 'Book Assistance Slot',
      getDirections: 'Get Directions'
    },
    profilePage: {
      badge: 'Aadhaar & DigiLocker Seeded (Demo)',
      verifiedProfile: 'Verified Citizen Profile',
      updateProfile: 'Update Profile',
      identityTrustTitle: 'Identity & Trust Verifications',
      identityTrustSubtitle: 'Government identity credentials linked to JANSAATHI AI',
      socioEconomicTitle: 'Socio-Economic Criteria',
      socioEconomicSubtitle: 'Parameters used by AI to discover matching welfare programs',
      occupationLabel: 'Occupation:',
      incomeLabel: 'Annual Household Income:',
      locationLabel: 'Location:',
      categoryLabel: 'Category:',
      phoneLabel: 'Phone:',
      dataGuaranteeTitle: 'Citizen Data Protection & Consent Guarantee',
      dataGuaranteeDesc: 'Under the Digital Personal Data Protection Act (DPDP), your identity data is never shared with third parties or advertisers. It is strictly used to match government welfare schemes.',
      exportMyData: 'Export My Data'
    },
    categories: {
      All: 'All',
      Agriculture: 'Agriculture',
      Healthcare: 'Healthcare',
      Housing: 'Housing',
      SocialWelfare: 'Social Welfare',
      WomenChild: 'Women & Child',
      SkillEmployment: 'Skill & Employment'
    },
    common: {
      search: 'Search...',
      filterAll: 'All',
      verified: 'Verified',
      actionNeeded: 'Action Needed',
      underReview: 'Under Review',
      approved: 'Approved',
      backToDashboard: 'Dashboard',
      reset: 'Reset',
      clearFilters: 'Clear Filters',
      viewDetails: 'View Details',
      downloadReceipt: 'Download Receipt',
      officialStatus: 'Official Portal Status',
      bookSlot: 'Book Assistance Slot',
      syncDigiLocker: 'Sync with DigiLocker',
      updateProfile: 'Update Profile',
      exportMyData: 'Export My Data',
      noResultsFound: 'No results found matching your search',
      tryAdjustingFilters: 'Try adjusting your category filter or keyword terms.'
    },
    footer: {
      missionText: 'An intelligent citizen-service agent designed to empower Indian citizens in discovering welfare schemes, validating documents, and tracking benefits seamlessly.',
      dedicatedPrivacy: 'Dedicated Citizen Privacy & Data Security',
      citizenServicesTitle: 'Citizen Services',
      officialPortalsTitle: 'Official Portals',
      supportTitle: 'Support & Privacy',
      helplineText: 'Toll-free national citizen advisory helpline: 1800-111-555 (24x7 Bilingual support).',
      cpgramsPortal: 'CPGRAMS Redressal Portal',
      privacyConsentControls: 'Privacy & Consent Controls',
      copyright: '© 2026 JANSAATHI AI • Government services, made simpler for everyone.',
      builtForCitizens: 'Built for Indian Citizens',
      phaseBadge: 'Foundation Phase 1'
    },
    auth: {
      loginTitle: 'Sign in to Citizen Portal',
      loginSubtitle: 'Access your personalized welfare schemes, documents, and application updates.',
      loginOtpTitle: 'Sign in with Email OTP',
      loginOtpSubtitle: 'Enter your registered email to receive a secure 6-digit verification code.',
      loginPasswordTitle: 'Sign in with Password',
      verifyLoginOtpTitle: 'Enter Login Verification Code',
      verifySignupOtpTitle: 'Verify Your Email Address',
      verifyOtpSubtitle: 'A 6-digit verification code has been dispatched to',
      otpLabel: '6-Digit Verification Code',
      otpInputPlaceholder: 'Enter 6-digit code',
      sendOtpButton: 'Send Verification Code',
      verifyOtpButton: 'Verify Code & Sign In',
      verifySignupButton: 'Verify & Complete Registration',
      resendCode: 'Resend Code',
      resendInSeconds: 'Resend code in {seconds}s',
      changeEmailOrDetails: 'Change email or details',
      signInWithPasswordOption: 'Sign in with password instead',
      signInWithOtpOption: 'Sign in with Email OTP instead',
      otpSentNotice: 'A 6-digit verification code has been dispatched to your email.',
      invalidOtpMessage: 'The verification code entered is invalid or has expired. Please check your inbox or click Resend Code.',
      registerTitle: 'Create Citizen Account',
      registerSubtitle: 'Register with your name and email to map welfare opportunities.',
      forgotTitle: 'Reset Password',
      forgotSubtitle: 'Enter your registered email address to receive a secure password recovery link.',
      fullNameLabel: 'Full Name (as per official ID)',
      emailLabel: 'Email Address',
      passwordLabel: 'Password (Min. 6 characters)',
      loginButton: 'Sign In',
      registerButton: 'Create Citizen Account',
      resetButton: 'Send Recovery Email',
      backToLogin: 'Back to Sign In',
      noAccountPrompt: "Don't have a citizen account yet?",
      hasAccountPrompt: 'Already have an account?',
      forgotPasswordPrompt: 'Forgot your password?',
      guestContinue: 'Continue as Guest Preview',
      authenticatedWelcome: 'Citizen',
      signOut: 'Sign Out',
      protectedNotice: 'Please sign in to access your secure citizen records, scheme applications, and personal vault.',
      setupPendingTitle: 'Supabase Cloud Configuration Required',
      setupPendingDesc: 'Database credentials not detected in .env.local. Click below to view the setup guide and SQL migration.',
      viewSetupInstructions: 'View Supabase Setup Guide',
      sessionExpired: 'Your session has ended. Please sign in again.',
      authSuccessLogin: 'Signed in successfully. Welcome back!',
      authSuccessRegister: 'A 6-digit verification code has been sent to your email. Enter it below to complete registration.',
      authSuccessReset: 'Password reset link dispatched. Please check your email inbox.'
    },
    admin: {
      badge: 'Protected Administration Console',
      title: 'JANSAATHI Admin Intelligence',
      subtitle: 'System-wide registration statistics, login history telemetry, and application pipeline audit.',
      statTotalUsers: 'Total Registered Citizens',
      statLogins: 'Total Portal Logins',
      statApplications: 'Applications in Pipeline',
      statActiveSchemes: 'Indexed Welfare Schemes',
      recentRegistrations: 'Recent Citizen Registrations',
      loginAuditTrail: 'Login History & Telemetry',
      systemActivity: 'Recent Platform Activity',
      accessDeniedTitle: 'Restricted Administrator Area',
      accessDeniedDesc: 'You do not hold administrator privileges. In accordance with the DPDP Act, non-admin citizens are prohibited from inspecting system metrics or other citizens’ records.',
      returnToDashboard: 'Return to Citizen Dashboard',
      roleCitizen: 'Citizen',
      roleAdmin: 'Administrator',
      liveDataConnected: 'Cloud Database Active',
      demoTelemetryNotice: 'Live metrics stream automatically from Supabase PostgreSQL tables.',
      userHeader: 'Citizen Name',
      emailHeader: 'Email Address',
      roleHeader: 'Account Role',
      registeredOnHeader: 'Registered On',
      loginTimeHeader: 'Login Timestamp',
      clientHeader: 'Client Telemetry / Device'
    }
  },
  Hindi: {
    nav: {
      home: 'मुख्य पृष्ठ',
      dashboard: 'नागरिक डैशबोर्ड',
      schemes: 'योजनाएं खोजें',
      documents: 'दस्तावेज़ सहायक',
      applications: 'मेरे आवेदन',
      centres: 'सहायता केंद्र',
      profile: 'मेरी प्रोफ़ाइल',
      admin: 'व्यवस्थापक कक्ष',
      login: 'लॉग इन',
      register: 'पंजीकरण',
      signOut: 'लॉग आउट',
      guest: 'अतिथि नागरिक',
      tagline: 'सरकारी सेवाएं, अब हर नागरिक के लिए आसान।',
      getStarted: 'शुरू करें',
      voiceAssistant: 'ध्वनि सहायक',
      citizenServices: 'नागरिक सेवाएं',
      officialPortals: 'आधिकारिक पोर्टल',
      publicPortal: 'नागरिक पोर्टल',
      activeAssistant: 'वॉइस एवं चैट उपलब्ध'
    },
    landing: {
      badgeInitiative: 'डिजिटल इंडिया पहल',
      badgeEmpower: '140 करोड़ नागरिकों का सशक्तिकरण',
      heroTitlePrefix: 'सरकारी सेवाएं,',
      heroTitleHighlight: 'अब हर नागरिक के लिए आसान।',
      heroSubtitle: 'जनसाथी AI एक बुद्धिमत्तापूर्ण नागरिक-सेवा एजेंट है जो भारतीय नागरिकों को कल्याणकारी योजनाओं की खोज, पात्रता समझने, दस्तावेज़ विश्लेषण, आवेदन तैयार करने और स्थिति पर नज़र रखने में सहायता करता है।',
      getStartedButton: 'शुरू करें',
      voiceButton: 'ध्वनि सहायक',
      trustSchemes: '2,500+ केंद्रीय एवं राज्य योजनाएं',
      trustMiddlemen: 'शून्य बिचौलिए एवं 100% निःशुल्क',
      trustOfficial: 'आधिकारिक पोर्टल एवं डिजिलॉकर प्रमाणित',
      pillarsBadge: 'प्रमुख मंच क्षमताएं',
      pillarsTitle: 'जनसाथी AI आपकी सेवा कैसे करता है',
      pillarsSubtitle: 'हर नागरिक को पारदर्शी, त्वरित और सम्मानजनक जनकल्याणकारी लाभ पाने का पूर्ण अधिकार है।',
      p1Title: 'योजनाएं खोजें',
      p1Desc: 'AI आपकी आयु, व्यवसाय, आय और राज्य के आधार पर 2,500+ केंद्रीय और राज्य योजनाओं में से सही योजनाएं खोजता है।',
      p2Title: 'दस्तावेज़ सहायक',
      p2Desc: 'आधार, पैन या आय प्रमाण पत्र अपलोड करें। आवेदन से पूर्व पात्रता और मानकों की स्वतः पुष्टि करें।',
      p3Title: 'आवाज से सहायता',
      p3Desc: 'हिंदी, मराठी या अंग्रेजी में बोलें। डिजिटल साक्षरता की परवाह किए बिना हर नागरिक के लिए सहज।',
      p4Title: 'आवेदन की स्थिति',
      p4Desc: 'विभिन्न सरकारी विभागों के पोर्टलों पर अपने आवेदन की प्रगति को एक ही एकीकृत डैशबोर्ड से ट्रैक करें।',
      howTitleBadge: 'चरणबद्ध मार्गदर्शन',
      howTitle: 'पूछताछ से सीधे बैंक खाते तक',
      howSubtitle: 'बिना किसी कागजी उलझन के स्पष्ट और सुगम प्रक्रिया।',
      s1Title: 'नागरिक विवरण बताएं',
      s1Desc: 'सरल प्रश्नों के उत्तर दें या अपनी योजनाओं का मिलान करने हेतु डिजिलॉकर से जोड़ें।',
      s2Title: 'पात्रता की पुष्टि करें',
      s2Desc: 'स्मार्ट पात्रता विश्लेषक सुनिश्चित करता है कि आप योजना के सभी नियमों को पूरा करते हैं।',
      s3Title: 'आवेदन तैयार करें',
      s3Desc: 'सही चेकलिस्ट, पूर्व-भरे फॉर्म और आवश्यक दस्तावेज़ प्रारूप प्राप्त करें।',
      s4Title: 'लाभ व प्रगति ट्रैक करें',
      s4Desc: 'आवेदन आगे बढ़ने और प्रत्यक्ष लाभ अंतरण (DBT) बैंक में आने पर तुरंत सूचना पाएं।',
      openDashboard: 'नागरिक डैशबोर्ड खोलें',
      privacyBadge: 'नागरिक विश्वास व संप्रभुता',
      privacyTitle: 'गोपनीयता एवं नागरिक सहमति ढांचा',
      privacySubtitle: 'भारतीय डिजिटल डेटा कानूनों के तहत नागरिक अधिकारों का पूर्ण सम्मान एवं सुरक्षा।',
      dpdpTitle: 'DPDP अधिनियम 2023 के अनुरूप',
      dpdpDesc: 'भारत के डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम के अनुसार निर्मित, जहां डेटा सुरक्षा सर्वोच्च प्राथमिकता है।',
      consentTitle: 'स्पष्ट नागरिक सहमति',
      consentDesc: 'प्रत्येक योजना के लिए नागरिक की स्पष्ट OTP-आधारित सहमति के बिना कोई व्यक्तिगत पहचान नहीं ली जाती।',
      noAdsTitle: 'शून्य व्यावसायिक उपयोग',
      noAdsDesc: 'नागरिक डेटा कभी भी तीसरे पक्ष को नहीं बेचा जाता और न ही विज्ञापनों में इस्तेमाल होता है। यह सिर्फ जनसेवा हेतु है।',
      revokeTitle: 'सहमति वापसी का अधिकार',
      revokeDesc: 'नागरिकों का अपने डेटा पर पूर्ण नियंत्रण है। वे कभी भी सहमति वापस ले सकते हैं और दस्तावेज़ हटा सकते हैं।',
      consentGuaranteeTitle: 'नागरिक इलेक्ट्रॉनिक सहमति (ई-सहमति) गारंटी',
      consentGuaranteeDesc: 'प्रत्येक प्रश्न या दस्तावेज़ AES-256 एन्क्रिप्शन से सुरक्षित है। जनसाथी AI कभी भी कच्चा बायोमेट्रिक डेटा संग्रहीत नहीं करता।',
      reviewConsentTerms: 'सहमति नियम देखें',
      kendraSupportTitle: 'व्यक्तिगत सहायता चाहिए?',
      kendraSupportDesc: 'जनसाथी AI आपकी तहसील या ग्राम पंचायत में प्रमाणित कॉमन सर्विस सेंटर (CSC) व सेवा केंद्रों से जोड़ता है।',
      findKendraButton: 'निकटतम सेवा केंद्र खोजें'
    },
    dashboard: {
      welcomeGreeting: 'नमस्ते, नागरिक',
      verifiedCitizen: 'आधार एवं डिजिलॉकर सत्यापित',
      welcomeSubtitle: 'आपका व्यक्तिगत नागरिक नियंत्रण केंद्र। जनसाथी AI सरकारी राजपत्रों, अनुदानों और आपके आवेदनों पर नज़र रखता है —',
      statEligible: 'पात्र योजनाएं',
      statApplications: 'सक्रिय आवेदन',
      statVault: 'सत्यापित दस्तावेज़',
      statNearestKendra: 'निकटतम केंद्र',
      demoTag: '(डेमो)',
      foundationNoticeTitle: 'फेज 1 फ्रंटएंड फाउंडेशन सक्रिय',
      foundationNoticeDesc: 'सभी इंटरैक्टिव कार्ड, स्थिति प्रवाह और नेविगेशन सक्रिय हैं। आधिकारिक सरकारी API और लाइव AI मॉडल फेज 2 में जुड़ेंगे।',
      schemesCardTitle: 'सरकारी योजनाएं खोजें',
      schemesCardSubtitle: 'नागरिक प्रोफाइल के अनुसार केंद्रीय एवं राज्य कल्याणकारी योजनाएं',
      searchSchemesPlaceholder: 'कीवर्ड, लाभ या क्षेत्र द्वारा योजनाएं खोजें...',
      benefitLabel: 'लाभ विवरण:',
      targetLabel: 'पात्र नागरिक:',
      viewAllSchemes: 'सभी योजनाएं देखें',
      docCardTitle: 'दस्तावेज़ सहायक',
      docCardSubtitle: 'AI-संचालित OCR सत्यापन एवं डिजिलॉकर तैयारी जांचकर्ता',
      uploadDocPrompt: 'सत्यापन हेतु दस्तावेज़ अपलोड करें (डेमो)',
      uploadDocSubtext: 'आधार, पैन, राशन कार्ड, भू-अभिलेख समर्थित (PDF, JPG, PNG अधिकतम 10MB)',
      privacyShield: 'स्थानीय OCR गोपनीयता सुरक्षा',
      vaultListTitle: 'नागरिक दस्तावेज़ वॉल्ट (डेमो पूर्वावलोकन)',
      manageVault: 'वॉल्ट प्रबंधित करें',
      appCardTitle: 'मेरे आवेदन',
      appCardSubtitle: 'केंद्रीय एवं राज्य कल्याणकारी पोर्टलों पर वास्तविक समय प्रगति ट्रैकिंग',
      appliedOn: 'आवेदन तिथि:',
      currentStage: 'वर्तमान चरण:',
      trackAllPortals: 'सभी पोर्टल ट्रैक करें',
      centresCardTitle: 'सहायता केंद्र खोजें',
      centresCardSubtitle: 'निकटतम कॉमन सर्विस सेंटर (CSC) एवं नागरिक सेवा केंद्र',
      verifiedHub: 'मंत्रालय प्रमाणित',
      getDirections: 'दिशा-निर्देश पाएं',
      viewMapDirectory: 'मानचित्र निर्देशिका देखें',
      otherNearby: 'अन्य निकटतम केंद्र (डेमो):',
      activityTitle: 'हाल की गतिविधियां',
      activitySubtitle: 'आपकी योजनाओं, दस्तावेज़ जांच और पोर्टल प्रस्तुतियों का स्वचालित ऑडिट ट्रेल',
      privacyCardTitle: 'गोपनीयता एवं नागरिक सहमति प्रबंधन',
      privacyCardSubtitle: 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम के अंतर्गत संप्रभु सहमति',
      dpdpStatement: 'DPDP अधिनियम के अनुपालन में, जनसाथी AI आपकी सक्रिय इलेक्ट्रॉनिक सहमति के साथ ही डेटा तक पहुंच बनाता है। आप कभी भी अनुमति बदल सकते हैं।',
      digilockerAccessTitle: 'डिजिलॉकर पहुंच',
      digilockerAccessDesc: 'पात्रता जांच हेतु आधार, राशन कार्ड और भूमि अभिलेख प्राप्त करने की अनुमति।',
      schemeMatchTitle: 'योजना मिलान',
      schemeMatchDesc: 'योजना पात्रता नियमों के साथ नागरिक प्रोफाइल का स्वचालित मिलान।',
      dbtCreditTitle: 'प्रत्यक्ष लाभ अंतरण (DBT)',
      dbtCreditDesc: 'सीधे बैंक खाते में सब्सिडी भुगतान स्थिति हेतु NPCI अधिसूचना एकीकरण।',
      authorized: 'स्वीकृत',
      revoked: 'वापस ली गई',
      revokeConsent: 'सहमति वापस लें',
      grantConsent: 'सहमति प्रदान करें',
      exportDataPackage: 'मेरा डेटा पैकेज डाउनलोड करें'
    },
    assistant: {
      title: 'जनसाथी AI',
      subtitle: 'नागरिक सहायक • बहुभाषी',
      activeBadge: 'सक्रिय',
      phaseNotice: 'Gemini 2.5 Flash द्वारा संचालित: बहुभाषी कल्याणकारी योजना एवं पात्रता मार्गदर्शन।',
      initialGreeting: 'नमस्ते! मैं आपका जनसाथी AI सहायक हूँ। आज मैं सरकारी योजनाओं, पात्रता या आवेदन ट्रैकिंग में आपकी क्या सहायता कर सकता हूँ?',
      suggestedQueries: 'सुझाए गए नागरिक प्रश्न:',
      askPlaceholder: 'योजनाओं, पात्रता, दस्तावेज़ों के बारे में पूछें...',
      pressEnter: 'भेजने के लिए Enter दबाएं',
      readyBadge: 'भारतीय भाषा सहायक तैयार',
      resetChat: 'बातचीत रीसेट करें',
      closePanel: 'सहायक पैनल बंद करें',
      authRequiredNotice: 'प्रमाणीकरण आवश्यक है। जनसाथी AI से परामर्श करने और व्यक्तिगत योजना पात्रता जांचने के लिए कृपया साइन इन करें।',
      signInToConsult: 'साइन इन / पंजीकरण',
      thinkingStatus: 'जनसाथी AI सरकारी योजनाओं का विश्लेषण कर रहा है...',
      backendOfflineNotice: 'AI सहायक सेवा से जुड़ने में असमर्थ। कृपया अपने इंटरनेट कनेक्शन या Supabase एज फ़ंक्शन की जांच करें।',
      newChat: 'नयी बातचीत',
      conversations: 'सुरक्षित बातचीत',
      guestBadge: 'अतिथि नागरिक मोड',
      deleteChat: 'बातचीत हटाएं',
      noConversations: 'अभी कोई बातचीत सुरक्षित नहीं है',
      voiceModalTitle: 'जनसाथी वॉइस असिस्टेंट',
      voiceModalDesc: 'हिंदी, अंग्रेजी और मराठी में ध्वनि आधारित सुलभता।',
      listeningSpeech: 'नागरिक की आवाज सुनी जा रही है...',
      tapToSpeak: 'बोलने के लिए माइक्रोफ़ोन दबाएं',
      listeningSubtext: 'सहज रूप से बोलें। ध्वनि तरंगें सक्रिय हैं।',
      tapToPause: 'माइक रोकने के लिए दबाएं',
      tapToStart: 'बोलना शुरू करने के लिए दबाएं',
      trySpeakingPrompt: 'ऐसे प्रश्न बोलकर देखें:',
      voiceLanguageLabel: 'बोलने की भाषा:',
      voicePhaseNotice: 'फेज 1 फ्रंटएंड फाउंडेशन: वॉइस विज़ुअलाइज़र व प्रवाह पूरी तरह सक्रिय हैं। लाइव स्पीच-टू-टेक्स्ट और AI मॉडल फेज 2 में जुड़ेंगे।',
      close: 'बंद करें'
    },
    schemesPage: {
      badge: 'कल्याणकारी योजना भांडार',
      title: 'केंद्रीय एवं राज्य योजनाएं खोजें',
      subtitle: 'कृषि, स्वास्थ्य, आवास और सामाजिक सुरक्षा की सत्यापित पहलों को देखें।',
      checkEligibility: 'पात्रता जांचें',
      prepareForm: 'आवेदन तैयार करें',
      targetCitizens: 'पात्र नागरिक:',
      benefitPackage: 'लाभ विवरण:'
    },
    documentsPage: {
      badge: 'बुद्धिमान दस्तावेज़ सहायक',
      title: 'नागरिक दस्तावेज़ वॉल्ट एवं OCR सत्यापन',
      subtitle: 'आवेदन करने से पूर्व सरकारी पहचान पत्रों, प्रमाणपत्रों और भू-अभिलेखों की पुष्टि करें।',
      uploadHeading: 'दस्तावेज़ अपलोड करने के लिए खींचें या क्लिक करें (डेमो)',
      uploadSub: 'आधार, पैन, राशन कार्ड, खसरा/खतौनी, या आय प्रमाण पत्र समर्थित (PDF, JPG, PNG अधिकतम 10MB)।',
      encryptedPrivate: 'एन्क्रिप्टेड एवं सुरक्षित',
      ocrCheck: 'OCR स्वतः जांच',
      digilockerCompliant: 'डिजिलॉकर अनुरूप',
      verifiedVaultDocs: 'वॉल्ट में सत्यापित दस्तावेज़ (डेमो रिकॉर्ड)',
      syncWithDigilocker: 'डिजिलॉकर से सिंक करें'
    },
    applicationsPage: {
      badge: 'कल्याणकारी लाभ ट्रैकर',
      title: 'मेरे सरकारी आवेदन',
      subtitle: 'केंद्रीय मंत्रालयों और राज्य पोर्टलों पर बहु-स्तरीय प्रगति की निगरानी।',
      searchPlaceholder: 'आवेदन क्रमांक या योजना नाम द्वारा खोजें...',
      currentMilestone: 'वर्तमान पड़ाव:',
      complete: 'पूर्ण',
      actionNote: 'कार्रवाई नोट:',
      downloadReceipt: 'रसीद डाउनलोड करें',
      officialPortalStatus: 'आधिकारिक पोर्टल स्थिति'
    },
    centresPage: {
      badge: 'सत्यापित नागरिक सहायता',
      title: 'सहायता केंद्र खोजें',
      subtitle: 'अपने निकटतम अधिकृत कॉमन सर्विस सेंटर (CSC), ग्राम पंचायत सुविधा केंद्र और नागरिक सहायता डेस्क खोजें।',
      searchPlaceholder: 'इलाका, पिन कोड या केंद्र के नाम से खोजें...',
      fromRegistered: 'पंजीकृत पते से दूरी',
      servicesAvailable: 'उपलब्ध नागरिक सेवाएं:',
      bookSlot: 'सहायता स्लॉट बुक करें',
      getDirections: 'दिशा-निर्देश पाएं'
    },
    profilePage: {
      badge: 'आधार एवं डिजिलॉकर लिंक (डेमो)',
      verifiedProfile: 'सत्यापित नागरिक प्रोफ़ाइल',
      updateProfile: 'प्रोफ़ाइल अपडेट करें',
      identityTrustTitle: 'पहचान एवं विश्वास सत्यापन',
      identityTrustSubtitle: 'जनसाथी AI से जुड़े आधिकारिक सरकारी पहचान पत्र',
      socioEconomicTitle: 'सामाजिक-आर्थिक मानदंड',
      socioEconomicSubtitle: 'योजना पात्रता मिलान हेतु प्रयुक्त मानदंड',
      occupationLabel: 'व्यवसाय:',
      incomeLabel: 'वार्षिक पारिवारिक आय:',
      locationLabel: 'स्थान:',
      categoryLabel: 'श्रेणी / वर्ग:',
      phoneLabel: 'मोबाइल नंबर:',
      dataGuaranteeTitle: 'नागरिक डेटा सुरक्षा एवं सहमति गारंटी',
      dataGuaranteeDesc: 'DPDP अधिनियम के तहत, आपका पहचान डेटा कभी भी तीसरे पक्ष या विज्ञापनदाताओं के साथ साझा नहीं किया जाता। इसका उपयोग केवल सरकारी योजनाओं के मिलान हेतु होता है।',
      exportMyData: 'मेरा डेटा निर्यात करें'
    },
    categories: {
      All: 'सभी',
      Agriculture: 'कृषि एवं किसान',
      Healthcare: 'स्वास्थ्य एवं चिकित्सा',
      Housing: 'आवास एवं घरकुल',
      SocialWelfare: 'सामाजिक कल्याण',
      WomenChild: 'महिला एवं बाल विकास',
      SkillEmployment: 'कौशल्य एवं रोजगार'
    },
    common: {
      search: 'खोजें...',
      filterAll: 'सभी',
      verified: 'सत्यापित',
      actionNeeded: 'कार्रवाई आवश्यक',
      underReview: 'समीक्षाधीन',
      approved: 'स्वीकृत',
      backToDashboard: 'डैशबोर्ड',
      reset: 'रीसेट',
      clearFilters: 'फ़िल्टर हटाएं',
      viewDetails: 'विवरण देखें',
      downloadReceipt: 'रसीद डाउनलोड करें',
      officialStatus: 'आधिकारिक पोर्टल स्थिति',
      bookSlot: 'सहायता स्लॉट बुक करें',
      syncDigiLocker: 'डिजिलॉकर से सिंक करें',
      updateProfile: 'प्रोफ़ाइल अपडेट करें',
      exportMyData: 'मेरा डेटा निर्यात करें',
      noResultsFound: 'आपकी खोज से मेल खाती कोई योजना नहीं मिली',
      tryAdjustingFilters: 'कृपया श्रेणी या कीवर्ड बदलकर पुनः प्रयास करें।'
    },
    footer: {
      missionText: 'एक बुद्धिमत्तापूर्ण नागरिक-सेवा एजेंट, जो भारतीय नागरिकों को कल्याणकारी योजनाओं की खोज, दस्तावेज़ सत्यापन और लाभ प्राप्ति में सहायता करता है।',
      dedicatedPrivacy: 'नागरिक डेटा गोपनीयता एवं सुरक्षा के प्रति समर्पित',
      citizenServicesTitle: 'नागरिक सेवाएं',
      officialPortalsTitle: 'आधिकारिक पोर्टल',
      supportTitle: 'सहायता एवं गोपनीयता',
      helplineText: 'टोल-फ्री राष्ट्रीय नागरिक हेल्पलाइन: 1800-111-555 (24x7 द्विभाषी सहायता)।',
      cpgramsPortal: 'CPGRAMS शिकायत निवारण पोर्टल',
      privacyConsentControls: 'गोपनीयता व सहमति नियंत्रण',
      copyright: '© 2026 जनसाथी AI • सरकारी सेवाएं, अब हर नागरिक के लिए आसान।',
      builtForCitizens: 'भारतीय नागरिकों के लिए निर्मित',
      phaseBadge: 'फाउंडेशन फेज 1'
    },
    auth: {
      loginTitle: 'नागरिक पोर्टल में प्रवेश करें',
      loginSubtitle: 'अपनी व्यक्तिगत कल्याणकारी योजनाओं, दस्तावेज़ों और आवेदनों तक पहुंचें।',
      loginOtpTitle: 'ईमेल ओटीपी से लॉग इन करें',
      loginOtpSubtitle: 'सुरक्षित 6-अंकों का सत्यापन कोड प्राप्त करने के लिए अपना पंजीकृत ईमेल दर्ज करें।',
      loginPasswordTitle: 'पासवर्ड से लॉग इन करें',
      verifyLoginOtpTitle: 'लॉगिन सत्यापन कोड दर्ज करें',
      verifySignupOtpTitle: 'अपना ईमेल पता सत्यापित करें',
      verifyOtpSubtitle: '6-अंकों का सत्यापन कोड इस ईमेल पर भेजा गया है:',
      otpLabel: '6-अंकों का सत्यापन कोड',
      otpInputPlaceholder: '6-अंकों का कोड दर्ज करें',
      sendOtpButton: 'सत्यापन कोड भेजें',
      verifyOtpButton: 'सत्यापित करें और लॉग इन करें',
      verifySignupButton: 'सत्यापित करें और पंजीकरण पूरा करें',
      resendCode: 'कोड पुनः भेजें',
      resendInSeconds: '{seconds}s में पुनः भेजें',
      changeEmailOrDetails: 'ईमेल या विवरण बदलें',
      signInWithPasswordOption: 'इसके बजाय पासवर्ड से लॉग इन करें',
      signInWithOtpOption: 'इसके बजाय ईमेल ओटीपी से लॉग इन करें',
      otpSentNotice: 'आपके ईमेल पर 6-अंकों का सत्यापन कोड भेजा गया है।',
      invalidOtpMessage: 'दर्ज किया गया सत्यापन कोड अमान्य है या समाप्त हो चुका है। कृपया पुनः प्रयास करें।',
      registerTitle: 'नया नागरिक खाता बनाएं',
      registerSubtitle: 'योजना पात्रता की पहचान के लिए अपने नाम व ईमेल से पंजीकरण करें।',
      forgotTitle: 'पासवर्ड रीसेट करें',
      forgotSubtitle: 'पासवर्ड पुनर्प्राप्ति लिंक प्राप्त करने के लिए अपना पंजीकृत ईमेल दर्ज करें।',
      fullNameLabel: 'पूरा नाम (आधिकारिक पहचान पत्र अनुसार)',
      emailLabel: 'ईमेल पता',
      passwordLabel: 'पासवर्ड (न्यूनतम 6 अक्षर)',
      loginButton: 'लॉग इन करें',
      registerButton: 'नागरिक खाता बनाएं',
      resetButton: 'रीसेट लिंक भेजें',
      backToLogin: 'लॉग इन पर वापस जाएं',
      noAccountPrompt: 'क्या आपके पास नागरिक खाता नहीं है?',
      hasAccountPrompt: 'क्या आपका पहले से खाता है?',
      forgotPasswordPrompt: 'पासवर्ड भूल गए?',
      guestContinue: 'अतिथि पूर्वावलोकन के रूप में जारी रखें',
      authenticatedWelcome: 'नागरिक',
      signOut: 'लॉग आउट',
      protectedNotice: 'सुरक्षित नागरिक रिकॉर्ड, योजना आवेदन और व्यक्तिगत वॉल्ट देखने के लिए कृपया लॉग इन करें।',
      setupPendingTitle: 'सुपाबेस क्लाउड कॉन्फ़िगरेशन आवश्यक',
      setupPendingDesc: '.env.local में डेटाबेस क्रेडेंशियल्स नहीं मिले। सेटअप गाइड और SQL माइग्रेशन देखने के लिए नीचे क्लिक करें।',
      viewSetupInstructions: 'सुपाबेस सेटअप गाइड देखें',
      sessionExpired: 'आपका सत्र समाप्त हो गया है। कृपया पुनः लॉग इन करें।',
      authSuccessLogin: 'सफलतापूर्वक लॉग इन हुआ। वापसी पर स्वागत है!',
      authSuccessRegister: 'आपके ईमेल पर 6-अंकों का सत्यापन कोड भेजा गया है। पंजीकरण पूरा करने के लिए इसे नीचे दर्ज करें।',
      authSuccessReset: 'पासवर्ड रीसेट लिंक भेज दिया गया है। कृपया अपना ईमेल चेक करें।'
    },
    admin: {
      badge: 'सुरक्षित व्यवस्थापक नियंत्रण कक्ष',
      title: 'जनसाथी एडमिन इंटेलिजेंस',
      subtitle: 'सिस्टम पंजीकरण सांख्यिकी, लॉगिन इतिहास टेलीमेट्री और आवेदन पाइपलाइन ऑडिट।',
      statTotalUsers: 'कुल पंजीकृत नागरिक',
      statLogins: 'कुल पोर्टल लॉगिन',
      statApplications: 'पाइपलाइन में आवेदन',
      statActiveSchemes: 'सक्रिय कल्याणकारी योजनाएं',
      recentRegistrations: 'हालिया नागरिक पंजीकरण',
      loginAuditTrail: 'लॉगिन इतिहास एवं टेलीमेट्री',
      systemActivity: 'हालिया प्लेटफॉर्म गतिविधियां',
      accessDeniedTitle: 'प्रतिबंधित व्यवस्थापक क्षेत्र',
      accessDeniedDesc: 'आपके पास व्यवस्थापक अधिकार नहीं हैं। DPDP अधिनियम के अनुसार, सामान्य नागरिकों को सिस्टम मेट्रिक्स या अन्य नागरिकों के डेटा देखने की अनुमति नहीं है।',
      returnToDashboard: 'नागरिक डैशबोर्ड पर लौटें',
      roleCitizen: 'नागरिक',
      roleAdmin: 'व्यवस्थापक',
      liveDataConnected: 'क्लाउड डेटाबेस सक्रिय',
      demoTelemetryNotice: 'सुपाबेस पोस्टग्रेएसक्यूएल डेटाबेस से स्वचालित रूप से लाइव आंकड़े प्राप्त होते हैं।',
      userHeader: 'नागरिक का नाम',
      emailHeader: 'ईमेल पता',
      roleHeader: 'खाता भूमिका',
      registeredOnHeader: 'पंजीकरण दिनांक',
      loginTimeHeader: 'लॉगिन समय',
      clientHeader: 'क्लाइंट / डिवाइस टेलीमेट्री'
    }
  },
  Marathi: {
    nav: {
      home: 'मुख्य पान',
      dashboard: 'नागरिक डॅशबोर्ड',
      schemes: 'योजना शोधा',
      documents: 'कागदपत्र सहाय्यक',
      applications: 'माझे अर्ज',
      centres: 'मदत केंद्र',
      profile: 'माझी प्रोफाइल',
      admin: 'प्रशासक पॅनल',
      login: 'लॉग इन',
      register: 'नोंदणी',
      signOut: 'लॉग आउट',
      guest: 'अतिथी नागरिक',
      tagline: 'शासकीय सेवा, प्रत्येकासाठी सोप्या आणि सुलभ।',
      getStarted: 'सुरुवात करा',
      voiceAssistant: 'ध्वनी सहाय्यक',
      citizenServices: 'नागरिक सेवा',
      officialPortals: 'अधिकृत पोर्टल',
      publicPortal: 'नागरिक पोर्टल',
      activeAssistant: 'व्हॉइस व चॅट उपलब्ध'
    },
    landing: {
      badgeInitiative: 'डिजिटल इंडिया उपक्रम',
      badgeEmpower: '१४० कोटी नागरिकांचे सक्षमीकरण',
      heroTitlePrefix: 'शासकीय सेवा,',
      heroTitleHighlight: 'प्रत्येकासाठी सोप्या आणि सुलभ।',
      heroSubtitle: 'जनसाथी AI हे एक बुद्धिमान नागरिक-सेवा एजंट आहे जे भारतीय नागरिकांना शासकीय कल्याणकारी योजना शोधण्यात, पात्रता समजून घेण्यात, कागदपत्रे तपासण्यात आणि अर्जाचा मागोवा घेण्यात मदत करते.',
      getStartedButton: 'सुरुवात करा',
      voiceButton: 'ध्वनी सहाय्यक',
      trustSchemes: '२,५००+ केंद्र व राज्य योजना',
      trustMiddlemen: 'मध्यस्थ विरहित आणि १००% मोफत',
      trustOfficial: 'अधिकृत पोर्टल व डिजिलॉकर प्रमाणित',
      pillarsBadge: 'प्रमुख मंच क्षमता',
      pillarsTitle: 'जनसाथी AI तुमची कशी मदत करते',
      pillarsSubtitle: 'प्रत्येक नागरिकाला शासकीय लाभांचा पारदर्शक, जलद आणि सन्मानपूर्वक लाभ मिळण्याचा पूर्ण हक्क आहे.',
      p1Title: 'योजना शोधा',
      p1Desc: 'AI तुमचे वय, व्यवसाय, उत्पन्न आणि राज्यानुसार २,५००+ योजनांमधून तुमच्यासाठी योग्य योजना शोधते.',
      p2Title: 'कागदपत्र सहाय्यक',
      p2Desc: 'आधार, पॅन किंवा उत्पन्न प्रमाणपत्र अपलोड करा. अर्ज करण्यापूर्वी आवश्यक निकषांची पडताळणी करा.',
      p3Title: 'आवाजाद्वारे मदत',
      p3Desc: 'मराठी, हिंदी किंवा इंग्रजीत बोला. तंत्रज्ञानाची सवय नसलेल्या सर्वसामान्य नागरिकांसाठी अत्यंत सुलभ.',
      p4Title: 'अर्जाचा मागोवा',
      p4Desc: 'विविध शासकीय विभागांच्या पोर्टलवरील अर्जांची प्रगती एकाच डॅशबोर्डवरून तपासा.',
      howTitleBadge: 'टप्प्याटप्प्याने मार्गदर्शन',
      howTitle: 'चौकशीपासून ते बँक खात्यात लाभापर्यंत',
      howSubtitle: 'कोणत्याही किचकट प्रक्रियेशिवाय स्पष्ट आणि जलद सेवा.',
      s1Title: 'नागरिक माहिती सांगा',
      s1Desc: 'साध्या प्रश्नांची उत्तरे द्या किंवा लागू असणाऱ्या योजना शोधण्यासाठी डिजिलॉकर जोडा.',
      s2Title: 'पात्रता तपासा',
      s2Desc: 'स्मार्ट निकष विश्लेषक अर्ज सादर करण्यापूर्वी सर्व अटी पूर्ण झाल्याची खात्री करतो.',
      s3Title: 'अर्ज तयार करा',
      s3Desc: 'नियमबद्ध चेकलिस्ट, पूर्व-भरलेले अर्ज आणि आवश्यक कागदपत्रांचे नमुने मिळवा.',
      s4Title: 'लाभ आणि स्थिती तपासा',
      s4Desc: 'अर्जाची प्रगती आणि थेट लाभ हस्तांतरण (DBT) बँक खात्यात जमा झाल्यावर सूचना मिळवा.',
      openDashboard: 'नागरिक डॅशबोर्ड उघडा',
      privacyBadge: 'नागरिक विश्वास आणि सार्वभौमत्व',
      privacyTitle: 'गोपनीयता आणि नागरिक संमती चौकट',
      privacySubtitle: 'भारतीय डिजिटल डेटा संरक्षण कायद्यांनुसार नागरिकांच्या मूलभूत अधिकारांचा पूर्ण सन्मान.',
      dpdpTitle: 'DPDP कायदा २०२३ नुसार',
      dpdpDesc: 'भारताच्या डिजिटल वैयक्तिक डेटा संरक्षण कायद्यानुसार सुरक्षितता व डेटा नियंत्रणाची पूर्ण हमी.',
      consentTitle: 'स्पष्ट नागरिक संमती',
      consentDesc: 'प्रत्येक योजनेसाठी नागरिकाच्या स्पष्ट OTP-आधारित संमतीशिवाय कोणतीही वैयक्तिक माहिती घेतली जात नाही.',
      noAdsTitle: 'व्यावसायिक वापरास बंदी',
      noAdsDesc: 'नागरिकांचा डेटा कधीही विकला जात नाही किंवा जाहिरातींसाठी वापरला जात नाही. केवळ जनकल्याणासाठी वापर.',
      revokeTitle: 'संमती मागे घेण्याचा हक्क',
      revokeDesc: 'नागरिकांचे त्यांच्या माहितीवर पूर्ण नियंत्रण असते. ते कधीही संमती मागे घेऊ शकतात आणि कागदपत्रे हटवू शकतात.',
      consentGuaranteeTitle: 'नागरिक इलेक्ट्रॉनिक संमती (ई-संमती) हमी',
      consentGuaranteeDesc: 'प्रत्येक प्रश्न आणि कागदपत्र AES-256 द्वारे सुरक्षित आहे. जनसाथी AI कधीही बायोमेट्रिक माहिती साठवत नाही.',
      reviewConsentTerms: 'संमती अटी तपासा',
      kendraSupportTitle: 'प्रत्यक्ष मदत हवी आहे का?',
      kendraSupportDesc: 'जनसाथी AI तुम्हाला तुमच्या तालुक्यातील किंवा ग्रामपंचायतीमधील अधिकृत आपले सरकार / CSC केंद्रांशी जोडते.',
      findKendraButton: 'जवळचे सेवा केंद्र शोधा'
    },
    dashboard: {
      welcomeGreeting: 'नमस्ते, नागरिक',
      verifiedCitizen: 'आधार व डिजिलॉकर प्रमाणित',
      welcomeSubtitle: 'तुमचे वैयक्तिक नागरिक नियंत्रण केंद्र. जनसाथी AI शासकीय अधिसूचना, अनुदाने आणि तुमच्या अर्जांवर लक्ष ठेवते —',
      statEligible: 'पात्र योजना',
      statApplications: 'सक्रिय अर्ज',
      statVault: 'तपासलेली कागदपत्रे',
      statNearestKendra: 'जवळचे केंद्र',
      demoTag: '(डेमो)',
      foundationNoticeTitle: 'फेज १ फ्रंटएंड फाउंडेशन सक्रिय',
      foundationNoticeDesc: 'सर्व परस्परसंवादी कार्ड, स्थिती प्रवाह आणि नेव्हिगेशन कार्यरत आहेत. अधिकृत शासकीय API आणि AI मॉडेल फेज २ मध्ये जोडले जातील.',
      schemesCardTitle: 'शासकीय योजना शोधा',
      schemesCardSubtitle: 'नागरिक प्रोफाइलनुसार मॅप केलेल्या केंद्र व राज्य योजना',
      searchSchemesPlaceholder: 'कीवर्ड, लाभ किंवा क्षेत्रानुसार योजना शोधा...',
      benefitLabel: 'लाभाचा तपशील:',
      targetLabel: 'पात्र नागरिक:',
      viewAllSchemes: 'सर्व योजना पहा',
      docCardTitle: 'कागदपत्र सहाय्यक',
      docCardSubtitle: 'AI-आधारित OCR पडताळणी व डिजिलॉकर तयारी तपासणी',
      uploadDocPrompt: 'पडताळणीसाठी कागदपत्र अपलोड करा (डेमो)',
      uploadDocSubtext: 'आधार, पॅन, रेशन कार्ड, सातबारा / 8A समर्थित (PDF, JPG, PNG कमाल 10MB)',
      privacyShield: 'स्थानिक OCR गोपनीयता कवच',
      vaultListTitle: 'नागरिक कागदपत्र वॉल्ट (डेमो पूर्वावलोकन)',
      manageVault: 'वॉल्ट व्यवस्थापित करा',
      appCardTitle: 'माझे अर्ज',
      appCardSubtitle: 'केंद्र आणि राज्य शासकीय पोर्टलवरील थेट प्रगती ट्रॅकिंग',
      appliedOn: 'अर्ज तारीख:',
      currentStage: 'सद्य टप्पा:',
      trackAllPortals: 'सर्व पोर्टल तपासा',
      centresCardTitle: 'मदत केंद्र शोधा',
      centresCardSubtitle: 'जवळपासची अधिकृत कॉमन सर्व्हिस सेंटर्स (CSC) व आपले सरकार सेवा केंद्र',
      verifiedHub: 'मंत्रालय प्रमाणित',
      getDirections: 'मार्गदर्शन मिळवा',
      viewMapDirectory: 'नकाशा निर्देशिका पहा',
      otherNearby: 'इतर जवळची केंद्रे (डेमो):',
      activityTitle: 'नुकतीच झालेली हालचाल',
      activitySubtitle: 'तुमच्या योजना, कागदपत्र तपासणी आणि अर्जांचा स्वयंचलित ऑडिट ट्रेल',
      privacyCardTitle: 'गोपनीयता व नागरिक संमती व्यवस्थापन',
      privacyCardSubtitle: 'डिजिटल वैयक्तिक डेटा संरक्षण (DPDP) कायद्यांतर्गत संमती व्यवस्थापन',
      dpdpStatement: 'DPDP कायद्यानुसार, जनसाथी AI केवळ तुमच्या सक्रिय इलेक्ट्रॉनिक संमतीनेच डेटामध्ये प्रवेश करते. तुम्ही कधीही संमती बदलू शकता.',
      digilockerAccessTitle: 'डिजिलॉकर प्रवेश',
      digilockerAccessDesc: 'पात्रता तपासणीसाठी आधार, रेशन कार्ड आणि जमीन अभिलेख मिळवण्याची संमती.',
      schemeMatchTitle: 'योजना जुळवणी',
      schemeMatchDesc: 'शासकीय योजनांच्या निकषांशी नागरिक माहितीची स्वयंचलित पडताळणी.',
      dbtCreditTitle: 'थेट बँक जमा (DBT)',
      dbtCreditDesc: 'थेट खात्यात अनुदान जमा स्थिती तपासण्यासाठी NPCI सूचना एकत्रीकरण.',
      authorized: 'मंजूर',
      revoked: 'मागे घेतले',
      revokeConsent: 'संमती मागे घ्या',
      grantConsent: 'संमती द्या',
      exportDataPackage: 'माझा डेटा पॅकेज डाऊनलोड करा'
    },
    assistant: {
      title: 'जनसाथी AI',
      subtitle: 'नागरिक सहाय्यक • बहुभाषिक',
      activeBadge: 'सक्रिय',
      phaseNotice: 'Gemini 2.5 Flash द्वारे समर्थित: बहुभाषिक कल्याणकारी योजना व पात्रता मार्गदर्शन.',
      initialGreeting: 'नमस्ते! मी तुमचा जनसाथी AI सहाय्यक आहे. आज मी शासकीय योजना, कागदपत्र पात्रता किंवा अर्ज तपासणीत कशी मदत करू शकतो?',
      suggestedQueries: 'नागरिकांचे नेहमीचे प्रश्न:',
      askPlaceholder: 'योजना, पात्रता, कागदपत्रांबद्दल विचारा...',
      pressEnter: 'पाठवण्यासाठी Enter दाबा',
      readyBadge: 'भारतीय भाषा सहाय्यक सज्ज',
      resetChat: 'संभाषण रीसेट करा',
      closePanel: 'सहाय्यक पॅनेल बंद करा',
      authRequiredNotice: 'प्रमाणीकरण आवश्यक आहे. जनसाथी AI चा सल्ला घेण्यासाठी आणि वैयक्तिक योजना पात्रता तपासण्यासाठी कृपया साइन इन करा.',
      signInToConsult: 'साइन इन / नोंदणी',
      thinkingStatus: 'जनसाथी AI शासकीय योजनांचे विश्लेषण करत आहे...',
      backendOfflineNotice: 'AI सहाय्यक सेवेशी संपर्क साधता आला नाही. कृपया तुमचे इंटरनेट कनेक्शन किंवा Supabase एज फंक्शन तपासा.',
      newChat: 'नवीन संभाषण',
      conversations: 'जतन केलेली संभाषणे',
      guestBadge: 'पाहुणा नागरिक मोड',
      deleteChat: 'संभाषण हटवा',
      noConversations: 'अद्याप कोणतेही संभाषण जतन केलेले नाही',
      voiceModalTitle: 'जनसाथी व्हॉइस असिस्टंट',
      voiceModalDesc: 'मराठी, हिंदी आणि इंग्रजीमध्ये आवाजावर आधारित सुलभता.',
      listeningSpeech: 'नागरिकाचा आवाज ऐकत आहे...',
      tapToSpeak: 'बोलण्यासाठी मायक्रोफोन दाबा',
      listeningSubtext: 'सहजपणे बोला. ध्वनी लहरी कार्यरत आहेत.',
      tapToPause: 'माईक थांबवण्यासाठी दाबा',
      tapToStart: 'बोलणे सुरू करण्यासाठी दाबा',
      trySpeakingPrompt: 'असे प्रश्न बोलून पहा:',
      voiceLanguageLabel: 'बोलण्याची भाषा:',
      voicePhaseNotice: 'फेज १ फ्रंटएंड फाउंडेशन: व्हॉइस व्हिज्युअलायझर सक्रिय आहे. थेट स्पीच-टू-टेक्स्ट आणि AI मॉडेल फेज २ मध्ये जोडले जातील.',
      close: 'बंद करा'
    },
    schemesPage: {
      badge: 'कल्याणकारी योजना दालन',
      title: 'केंद्र आणि राज्य योजना शोधा',
      subtitle: 'शेती, आरोग्य, घरकुल आणि सामाजिक सुरक्षेच्या प्रमाणित योजना पहा.',
      checkEligibility: 'पात्रता तपासा',
      prepareForm: 'अर्ज तयार करा',
      targetCitizens: 'पात्र नागरिक:',
      benefitPackage: 'लाभाचा तपशील:'
    },
    documentsPage: {
      badge: 'स्मार्ट कागदपत्र सहाय्यक',
      title: 'नागरिक कागदपत्र वॉल्ट व OCR पडताळणी',
      subtitle: 'अर्ज सादर करण्यापूर्वी शासकीय ओळखपत्रे, प्रमाणपत्रे आणि सातबाराची पडताळणी करा.',
      uploadHeading: 'कागदपत्र अपलोड करण्यासाठी ड्रॅग करा किंवा क्लिक करा (डेमो)',
      uploadSub: 'आधार, पॅन, रेशन कार्ड, सातबारा किंवा उत्पन्न प्रमाणपत्र समर्थित (PDF, JPG, PNG कमाल 10MB).',
      encryptedPrivate: 'सुरक्षित व गोपनीय',
      ocrCheck: 'OCR स्वयंचलित तपासणी',
      digilockerCompliant: 'डिजिलॉकर सुसंगत',
      verifiedVaultDocs: 'वॉल्टमधील प्रमाणित कागदपत्रे (डेमो नोंदी)',
      syncWithDigilocker: 'डिजिलॉकरशी सिंक करा'
    },
    applicationsPage: {
      badge: 'कल्याणकारी लाभ ट्रॅकर',
      title: 'माझे शासकीय अर्ज',
      subtitle: 'केंद्रीय मंत्रालये आणि राज्य पोर्टलवरील टप्प्याटप्प्याने प्रगती ट्रॅकिंग.',
      searchPlaceholder: 'अर्ज क्रमांक किंवा योजनेच्या नावाने शोधा...',
      currentMilestone: 'सद्य टप्पा:',
      complete: 'पूर्ण',
      actionNote: 'नोंद:',
      downloadReceipt: 'पावती डाऊनलोड करा',
      officialPortalStatus: 'अधिकृत पोर्टल स्थिती'
    },
    centresPage: {
      badge: 'प्रमाणित नागरिक मदत',
      title: 'मदत केंद्र शोधा',
      subtitle: 'तुमच्या जवळचे अधिकृत कॉमन सर्व्हिस सेंटर्स (CSC), ग्रामपंचायत सुविधा केंद्र आणि नागरिक मदत केंद्र शोधा.',
      searchPlaceholder: 'परिसर, पिन कोड किंवा केंद्राच्या नावाने शोधा...',
      fromRegistered: 'नोंदणीकृत पत्त्यापासून अंतर',
      servicesAvailable: 'उपलब्ध नागरिक सेवा:',
      bookSlot: 'मदत वेळ बुक करा',
      getDirections: 'मार्गदर्शन मिळवा'
    },
    profilePage: {
      badge: 'आधार व डिजिलॉकर जोडलेले (डेमो)',
      verifiedProfile: 'प्रमाणित नागरिक प्रोफाइल',
      updateProfile: 'प्रोफाइल अपडेट करा',
      identityTrustTitle: 'ओळख व सुरक्षितता पडताळणी',
      identityTrustSubtitle: 'जनसाथी AI शी जोडलेली अधिकृत शासकीय ओळखपत्रे',
      socioEconomicTitle: 'सामाजिक-आर्थिक निकष',
      socioEconomicSubtitle: 'योजना पात्रता तपासणीसाठी वापरले जाणारे निकष',
      occupationLabel: 'व्यवसाय:',
      incomeLabel: 'वार्षिक कौटुंबिक उत्पन्न:',
      locationLabel: 'स्थान:',
      categoryLabel: 'प्रवर्ग:',
      phoneLabel: 'मोबाईल नंबर:',
      dataGuaranteeTitle: 'नागरिक डेटा संरक्षण व संमती हमी',
      dataGuaranteeDesc: 'DPDP कायद्यानुसार, तुमची वैयक्तिक माहिती कधीही कोणाशीही शेअर केली जात नाही. ती केवळ शासकीय योजनांच्या जुळवणीसाठी वापरली जाते.',
      exportMyData: 'माझा डेटा डाऊनलोड करा'
    },
    categories: {
      All: 'सर्व',
      Agriculture: 'शेती व शेतकरी',
      Healthcare: 'आरोग्य व औषधोपचार',
      Housing: 'घरकुल व गृहनिर्माण',
      SocialWelfare: 'सामाजिक कल्याण',
      WomenChild: 'महिला व बालविकास',
      SkillEmployment: 'कौशल्य व रोजगार'
    },
    common: {
      search: 'शोधा...',
      filterAll: 'सर्व',
      verified: 'प्रमाणित',
      actionNeeded: 'कृती आवश्यक',
      underReview: 'तपासणी सुरू',
      approved: 'मंजूर',
      backToDashboard: 'डॅशबोर्ड',
      reset: 'रीसेट',
      clearFilters: 'फिल्टर हटवा',
      viewDetails: 'तपशील पहा',
      downloadReceipt: 'पावती डाऊनलोड करा',
      officialStatus: 'अधिकृत पोर्टल स्थिती',
      bookSlot: 'मदत वेळ बुक करा',
      syncDigiLocker: 'डिजिलॉकरशी सिंक करा',
      updateProfile: 'प्रोफाइल अपडेट करा',
      exportMyData: 'माझा डेटा डाऊनलोड करा',
      noResultsFound: 'तुमच्या शोधाशी जुळणारी योजना सापडली नाही',
      tryAdjustingFilters: 'कृपया श्रेणी किंवा शब्द बदलून पुन्हा प्रयत्न करा.'
    },
    footer: {
      missionText: 'एक बुद्धिमान नागरिक-सेवा एजंट, जे भारतीय नागरिकांना शासकीय कल्याणकारी योजना शोधण्यात, कागदपत्रे तपासण्यात आणि लाभ मिळवण्यात मदत करते.',
      dedicatedPrivacy: 'नागरिक डेटा गोपनीयता आणि सुरक्षेसाठी कटिबद्ध',
      citizenServicesTitle: 'नागरिक सेवा',
      officialPortalsTitle: 'अधिकृत पोर्टल',
      supportTitle: 'मदत आणि गोपनीयता',
      helplineText: 'टोल-फ्री राष्ट्रीय नागरिक हेल्पलाइन: 1800-111-555 (२४x७ द्विभाषिक मदत).',
      cpgramsPortal: 'CPGRAMS तक्रार निवारण पोर्टल',
      privacyConsentControls: 'गोपनीयता व संमती नियंत्रणे',
      copyright: '© 2026 जनसाथी AI • शासकीय सेवा, प्रत्येकासाठी सोप्या आणि सुलभ।',
      builtForCitizens: 'भारतीय नागरिकांसाठी समर्पित',
      phaseBadge: 'फाउंडेशन फेज १'
    },
    auth: {
      loginTitle: 'नागरिक पोर्टलवर प्रवेश करा',
      loginSubtitle: 'तुमच्या वैयक्तिक कल्याणकारी योजना, कागदपत्रे आणि अर्जांच्या नोंदी पहा.',
      loginOtpTitle: 'ईमेल ओटीपी द्वारे लॉगिन करा',
      loginOtpSubtitle: 'सुरक्षित ६-अंकी पडताळणी कोड मिळवण्यासाठी तुमचा नोंदणीकृत ईमेल प्रविष्ट करा.',
      loginPasswordTitle: 'पासवर्डने लॉगिन करा',
      verifyLoginOtpTitle: 'लॉगिन पडताळणी कोड प्रविष्ट करा',
      verifySignupOtpTitle: 'तुमचा ईमेल पत्ता सत्यापित करा',
      verifyOtpSubtitle: '६-अंकी पडताळणी कोड या ईमेलवर पाठवला गेला आहे:',
      otpLabel: '६-अंकी पडताळणी कोड',
      otpInputPlaceholder: '६-अंकी कोड प्रविष्ट करा',
      sendOtpButton: 'पडताळणी कोड पाठवा',
      verifyOtpButton: 'पडताळणी करा आणि लॉगिन करा',
      verifySignupButton: 'सत्यापित करा आणि नोंदणी पूर्ण करा',
      resendCode: 'कोड पुन्हा पाठवा',
      resendInSeconds: '{seconds}s मध्ये पुन्हा पाठवा',
      changeEmailOrDetails: 'ईमेल किंवा माहिती बदला',
      signInWithPasswordOption: 'त्याऐवजी पासवर्डने लॉगिन करा',
      signInWithOtpOption: 'त्याऐवजी ईमेल ओटीपीने लॉगिन करा',
      otpSentNotice: 'तुमच्या ईमेलवर ६-अंकी पडताळणी कोड पाठवला आहे.',
      invalidOtpMessage: 'प्रविष्ट केलेला पडताळणी कोड अवैध आहे किंवा कालबाह्य झाला आहे. कृपया पुन्हा प्रयत्न करा.',
      registerTitle: 'नवीन नागरिक खाते तयार करा',
      registerSubtitle: 'योजना पात्रतेसाठी तुमचे नाव आणि ईमेल द्वारे नोंदणी करा.',
      forgotTitle: 'पासवर्ड रीसेट करा',
      forgotSubtitle: 'पासवर्ड पुनर्प्राप्ती लिंक मिळवण्यासाठी तुमचा नोंदणीकृत ईमेल प्रविष्ट करा.',
      fullNameLabel: 'पूर्ण नाव (अधिकृत ओळखपत्राप्रमाणे)',
      emailLabel: 'ईमेल पत्ता',
      passwordLabel: 'पासवर्ड (किमान ६ अक्षरे)',
      loginButton: 'लॉग इन करा',
      registerButton: 'नागरिक खाते तयार करा',
      resetButton: 'रीसेट लिंक पाठवा',
      backToLogin: 'लॉग इनकडे परत जा',
      noAccountPrompt: 'अद्याप नागरिक खाते नाही का?',
      hasAccountPrompt: 'आधीपासून खाते आहे का?',
      forgotPasswordPrompt: 'पासवर्ड विसरलात का?',
      guestContinue: 'अतिथी पूर्वावलोकन म्हणून सुरू ठेवा',
      authenticatedWelcome: 'नागरिक',
      signOut: 'लॉग आउट',
      protectedNotice: 'सुरक्षित नागरिक नोंदी, योजना अर्ज आणि वैयक्तिक वॉल्ट पाहण्यासाठी कृपया लॉग इन करा.',
      setupPendingTitle: 'सुपाबेस क्लाउड जोडणी आवश्यक',
      setupPendingDesc: '.env.local मध्ये डेटाबेस क्रेडेंशियल्स आढळले नाहीत. सेटअप मार्गदर्शक आणि SQL स्थलांतर पाहण्यासाठी खाली क्लिक करा.',
      viewSetupInstructions: 'सुपाबेस सेटअप मार्गदर्शक पहा',
      sessionExpired: 'तुमचे सत्र संपले आहे. कृपया पुन्हा लॉग इन करा.',
      authSuccessLogin: 'यशस्वीरीत्या लॉग इन झाले. पुन्हा स्वागत आहे!',
      authSuccessRegister: 'तुमच्या ईमेलवर ६-अंकी पडताळणी कोड पाठवला आहे. नोंदणी पूर्ण करण्यासाठी खाली कोड प्रविष्ट करा.',
      authSuccessReset: 'पासवर्ड रीसेट लिंक पाठवली आहे. कृपया तुमचा ईमेल तपासा.'
    },
    admin: {
      badge: 'संरक्षित प्रशासक नियंत्रण कक्ष',
      title: 'जनसाथी ॲडमिन इंटेलिजन्स',
      subtitle: 'सिस्टम नोंदणी आकडेवारी, लॉगिन इतिहास टेलिमेट्री आणि अर्ज पाइपलाइन ऑडिट.',
      statTotalUsers: 'एकूण नोंदणीकृत नागरिक',
      statLogins: 'एकूण पोर्टल लॉगिन',
      statApplications: 'पाइपलाइनमधील अर्ज',
      statActiveSchemes: 'सक्रिय कल्याणकारी योजना',
      recentRegistrations: 'नुकतीच झालेली नागरिक नोंदणी',
      loginAuditTrail: 'लॉगिन इतिहास व टेलिमेट्री',
      systemActivity: 'प्लॅटफॉर्मवरील अलीकडील हालचाली',
      accessDeniedTitle: 'प्रतिबंधित प्रशासक क्षेत्र',
      accessDeniedDesc: 'तुमच्याकडे प्रशासक अधिकार नाहीत. DPDP कायद्यानुसार, सामान्य नागरिकांना सिस्टम मेट्रिक्स किंवा इतर नागरिकांचा डेटा पाहण्याची परवानगी नाही.',
      returnToDashboard: 'नागरिक डॅशबोर्डवर परत जा',
      roleCitizen: 'नागरिक',
      roleAdmin: 'प्रशासक',
      liveDataConnected: 'क्लाउड डेटाबेस सक्रिय',
      demoTelemetryNotice: 'सुपाबेस पोस्टग्रेएसक्यूएल डेटाबेसमधून थेट आकडेवारी आपोआप दिसते.',
      userHeader: 'नागरिकाचे नाव',
      emailHeader: 'ईमेल पत्ता',
      roleHeader: 'खाते भूमिका',
      registeredOnHeader: 'नोंदणी तारीख',
      loginTimeHeader: 'लॉगिन वेळ',
      clientHeader: 'क्लायंट / डिव्हाइस टेलिमेट्री'
    }
  }
};
