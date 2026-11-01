export type PageRoute = 
  | 'landing'
  | 'dashboard'
  | 'schemes'
  | 'documents'
  | 'applications'
  | 'centres'
  | 'profile'
  | 'admin';

export type UserRole = 'citizen' | 'admin';

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  state: string;
  district: string;
  taluka?: string | null;
  village?: string | null;
  age?: number | null;
  date_of_birth?: string | null;
  housing_status?: string | null;
  annual_income?: number | null;
  land_holding_acres?: number | null;
  category: string;
  occupation: string;
  annual_income_bracket: string;
  digilocker_linked: boolean;
  aadhaar_verified: boolean;
  role: UserRole;
  field_sources?: Record<string, { source: string; verifiedAt?: string; docType?: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface DbLoginHistory {
  id: string;
  user_id: string;
  user_email: string;
  login_timestamp: string;
  user_agent?: string | null;
  ip_address?: string | null;
}

export interface DbCitizenPreference {
  user_id: string;
  preferred_language: SupportedLanguage;
  notifications_enabled: boolean;
  theme: string;
  updated_at: string;
}

export interface DbApplication {
  id: string;
  user_id: string;
  application_number: string;
  scheme_title: string;
  category: string;
  applied_date: string;
  last_updated: string;
  current_stage: string;
  overall_progress: number;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Disbursed' | 'Action Required';
  status_color: string;
  next_action?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbConsentRecord {
  id: string;
  user_id: string;
  consent_type: string;
  document_category?: string | null;
  scheme_id?: string | null;
  purpose?: string | null;
  is_granted: boolean;
  granted_at: string;
  revoked_at?: string | null;
  dpdp_version: string;
  created_at: string;
}

export interface DbCitizenDocument {
  id: string;
  user_id: string;
  document_type: string;
  category: string;
  file_name: string;
  storage_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  verification_status: 'Pending' | 'Verified' | 'Rejected' | 'Expired';
  verified_at?: string | null;
  expiry_date?: string | null;
  extracted_summary?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbActivityLog {
  id: string;
  user_id: string;
  action_type: 'scheme' | 'document' | 'application' | 'assistant' | 'auth' | 'consent';
  title: string;
  description: string;
  status_tag?: string | null;
  created_at: string;
}

export type SupportedLanguage = 'English' | 'Hindi' | 'Marathi';

export type SchemeCategory = 
  | 'All'
  | 'Agriculture'
  | 'Healthcare'
  | 'Education'
  | 'Housing'
  | 'Social Welfare'
  | 'Women & Child'
  | 'Skill & Employment';

export interface SchemeItem {
  id: string;
  title: string;
  ministry: string;
  category: SchemeCategory;
  benefit: string;
  targetGroup: string;
  deadline?: string;
  tags: string[];
  status: 'Open' | 'Always Active' | 'Closing Soon';
}

export interface ApplicationItem {
  id: string;
  applicationNumber: string;
  schemeTitle: string;
  category: string;
  appliedDate: string;
  lastUpdated: string;
  currentStage: string;
  overallProgress: number; // 0 - 100
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Disbursed' | 'Action Required';
  statusColor: 'yellow' | 'blue' | 'purple' | 'green' | 'emerald' | 'amber';
  nextAction?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'scheme' | 'document' | 'application' | 'assistant';
  statusTag?: string;
}

export interface AssistanceCentre {
  id: string;
  name: string;
  type: 'Common Service Centre (CSC)' | 'Citizen Seva Kendra' | 'Panchayat Suvidha Kendra';
  address: string;
  distanceKm: number;
  contactNumber: string;
  workingHours: string;
  servicesAvailable: string[];
  isVerified: boolean;
}

export interface CitizenProfile {
  name: string;
  state: string;
  district: string;
  taluka?: string;
  village?: string;
  age?: number;
  dateOfBirth?: string;
  housingStatus?: string;
  annualIncome?: number;
  landHoldingAcres?: number;
  category: string;
  occupation: string;
  annualIncomeBracket: string;
  digilockerLinked: boolean;
  aadhaarVerified: boolean;
  phone: string;
  fieldSources?: Record<string, { source: string; verifiedAt?: string; docType?: string }>;
}

export type ClientActionType = 
  | 'OPEN_APPLICATION_PORTAL'
  | 'START_APPLICATION'
  | 'CHECK_APPLICATION_STATUS'
  | 'REQUEST_DOCUMENTS';

export type ClientActionStatus = 
  | 'pending'
  | 'awaiting_approval'
  | 'running'
  | 'completed'
  | 'failed';

export interface ClientActionPayload {
  schemeId?: string;
  schemeName?: string;
  portalUrl?: string;
  applicationNumber?: string;
  requiredDocuments?: string[];
  applicantData?: {
    name?: string;
    age?: number;
    district?: string;
    state?: string;
    housingStatus?: string;
    annualIncome?: number;
    casteCategory?: string;
  };
  reason?: string;
  step?: number;
}

export interface ClientActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export type PortalAutomationStage =
  | 'PORTAL_OPENED'
  | 'APPLICANT_DETAILS_FILLED'
  | 'DOCUMENTS_ADDED'
  | 'VALIDATION_COMPLETED'
  | 'AWAITING_FINAL_APPROVAL'
  | 'COMPLETED';

export interface PortalProgressEvent {
  type: 'PORTAL_PROGRESS';
  stage: PortalAutomationStage;
  message: string;
  step?: number;
  data?: Record<string, unknown>;
  timestamp?: string;
}

export interface PortalValidationFailedEvent {
  type: 'PORTAL_VALIDATION_FAILED';
  step: number;
  missingFields: string[];
  message: string;
  timestamp?: string;
}

export interface ClientAction {
  id: string;
  type: ClientActionType;
  title: string;
  description: string;
  payload: ClientActionPayload;
  status: ClientActionStatus;
  currentStage?: PortalAutomationStage;
  progressMessage?: string;
  requiresApproval: boolean;
  approvalGranted?: boolean;
  createdAt: string;
  executedAt?: string;
  result?: ClientActionResult;
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: string;
  isPlaceholder?: boolean;
  isError?: boolean;
  action?: 'login';
  clientActions?: ClientAction[];
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// CITY-02 Guided Citizen Intake Types
// ----------------------------------------------------
export interface CitizenIntakeData {
  needCategory: string;
  rawNeedDescription: string;
  citizenAge?: number;
  state: string;
  district: string;
  areaType: 'Rural' | 'Urban';
  annualIncome?: number;
  casteCategory: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  housingStatus?: 'Homeless' | 'Kutcha House' | 'Pucca House' | 'Rented';
  landHoldingAcres?: number;
  confirmedByCitizen: boolean;
}

// ----------------------------------------------------
// CITY-02 Verified Government Scheme Types
// ----------------------------------------------------
export type EligibilityGrade = 
  | 'Eligible' 
  | 'Likely Eligible' 
  | 'More Information Needed' 
  | 'Not Eligible';

export interface VerifiedScheme {
  id: string;
  title: string;
  state: 'Central' | 'Maharashtra' | string;
  department: string;
  category: SchemeCategory;
  benefit: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialSourceUrl: string;
  lastVerifiedDate: string;
  isVerified: boolean;
  grade: EligibilityGrade;
  reasoning: string;
}

// ----------------------------------------------------
// CITY-02 Document Intelligence Types
// ----------------------------------------------------
export interface ExtractedDocumentData {
  id: string;
  docType: 'Aadhaar Card' | 'Income Certificate' | 'Ration Card' | 'Land Record 7/12';
  fileName: string;
  fileUrl?: string;
  extractedFields: Record<string, string>;
  confidenceScore: number;
  missingFields: string[];
  consistencyStatus: 'Consistent' | 'Discrepancy Detected' | 'Verified';
  notes: string;
  consentGranted: boolean;
  extractedAt: string;
}

// ----------------------------------------------------
// CITY-02 Portal Browser Automation & Mock Portal Types
// ----------------------------------------------------
export type AutomationStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AutomationLogStep {
  id: string;
  title: string;
  detail: string;
  status: AutomationStepStatus;
  timestamp: string;
}

export interface MockPortalApplication {
  applicationNumber: string;
  schemeId: string;
  schemeTitle: string;
  applicantName: string;
  age: number;
  state: string;
  district: string;
  income: number;
  category: string;
  portalName: string;
  submittedAt: string;
  approvalGranted: boolean;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Delayed / Escalated' | 'Approved';
}

// ----------------------------------------------------
// CITY-02 Proactive Follow-up & Voice Calling Types
// ----------------------------------------------------
export interface FollowUpRecord {
  id: string;
  applicationNumber: string;
  schemeTitle: string;
  daysPending: number;
  slaDays: number;
  isDelayed: boolean;
  targetOffice: string;
  phoneTarget: string;
  generatedMessage: string;
  callScript: Record<SupportedLanguage, string>;
  approvedByCitizen: boolean;
  actionTaken: 'Script Prepared' | 'Call Simulation Executed' | 'Grievance Drafted';
  recordedAt: string;
}

// ----------------------------------------------------
// CITY-02 DPDP Consent & Action Audit Log
// ----------------------------------------------------
export interface AgentAuditAction {
  id: string;
  timestamp: string;
  stage: 'Intake' | 'Discovery' | 'Documents' | 'Portal Automation' | 'Submission' | 'Tracking' | 'Follow-up';
  actionTitle: string;
  reasoning: string;
  citizenConsentGiven: boolean;
  metadata?: Record<string, any>;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
}
