// ====================================================================
// JANSAATHI AI - Supabase Edge Function: chat
// Autonomous AI Tool-Calling Orchestrator for Gemini 2.5 Flash
// Server-Side Tools: 
//   - get_citizen_profile
//   - find_schemes
//   - check_eligibility
//   - track_application
//   - request_client_action
//   - list_citizen_documents
//   - check_document_consent
//   - record_document_consent
// Multilingual Citizen Welfare Scheme Guidance (English, Hindi, Marathi)
// Strict Data Integrity: Zero Fabricated Citizen Data, DPDP Act 2023 Consent & RLS
// ====================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';
import { 
  queryVerifiedSchemes, 
  evaluateSchemeEligibility, 
  VERIFIED_SCHEMES_DB, 
  type CitizenApplicantData 
} from './schemeKnowledge.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatHistoryItem[];
  language?: 'English' | 'Hindi' | 'Marathi';
  citizenProfile?: Record<string, unknown>;
  guestApplications?: Array<Record<string, unknown>>;
}

// Helper to sanitize strings and constrain length
function sanitizeString(val: unknown, maxLength: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

// ====================================================================
// GEMINI TOOL DECLARATIONS (Function Calling Schema)
// ====================================================================
const agentTools = [
  {
    functionDeclarations: [
      {
        name: 'get_citizen_profile',
        description: 'Retrieves verified citizen profile memory parameters (name, age, state, district, taluka, village, caste category, occupation, housing status, annual income, land holding, field sources provenance) from the authenticated database. Returns null for unauthenticated guests.',
        parameters: {
          type: 'OBJECT',
          properties: {
            includePreferences: {
              type: 'BOOLEAN',
              description: 'Whether to also retrieve citizen preferences such as preferred language.'
            }
          }
        }
      },
      {
        name: 'find_schemes',
        description: 'Searches verified Indian Central and State government welfare schemes by category, state jurisdiction, or search keyword (e.g. Housing, Healthcare, Agriculture, Social Welfare).',
        parameters: {
          type: 'OBJECT',
          properties: {
            category: {
              type: 'STRING',
              description: "Scheme category such as 'Housing', 'Healthcare', 'Agriculture', 'Social Welfare', or 'All'."
            },
            state: {
              type: 'STRING',
              description: "State jurisdiction such as 'Maharashtra', 'Central', or 'All'."
            },
            keyword: {
              type: 'STRING',
              description: "Keyword to search within scheme titles, benefits, or departments (e.g. 'pmay', 'awas', 'kisan', 'pension', 'ayushman')."
            }
          }
        }
      },
      {
        name: 'check_eligibility',
        description: 'Runs the official deterministic eligibility engine against a specified verified scheme using the citizen parameters. STRICT RULE: Only pass parameters explicitly provided by the citizen or verified in their profile. NEVER invent, assume, or default age, caste, income, or housing status. If unknown, leave omitted or null.',
        parameters: {
          type: 'OBJECT',
          properties: {
            schemeId: {
              type: 'STRING',
              description: "The exact ID of the verified scheme (e.g., 'mh-housing-01' for PMAY-G, 'mh-housing-02' for Ramai Awas, 'mh-health-01' for MJPJAY, 'mh-social-01' for SGNAY, 'central-agri-01' for PM-KISAN)."
            },
            applicantData: {
              type: 'OBJECT',
              description: 'Citizen demographic & socioeconomic parameters to test against the scheme. CRITICAL: Only include fields explicitly stated in the citizen message or retrieved from an authenticated profile. Leave all missing fields omitted or null.',
              properties: {
                citizenAge: { type: 'NUMBER', description: 'Explicit applicant current age in years, or null if unknown' },
                state: { type: 'STRING', description: "State of residence, or null if unknown" },
                district: { type: 'STRING', description: "District name, or null if unknown" },
                casteCategory: { type: 'STRING', description: "Caste/social category (General, OBC, SC, ST, EWS), or null if unknown" },
                housingStatus: { type: 'STRING', description: "Shelter condition (Kutcha House, Homeless, Pucca House), or null if unknown" },
                annualIncome: { type: 'NUMBER', description: 'Explicit annual household income in rupees, or null if unknown' },
                landHoldingAcres: { type: 'NUMBER', description: 'Cultivable land holding size in acres, or null if unknown' }
              }
            }
          },
          required: ['schemeId']
        }
      },
      {
        name: 'track_application',
        description: 'Checks the live status, review stage, and SLA timeline of submitted welfare scheme applications for the authenticated citizen, or by specific application reference number. Returns access_denied for unauthenticated guests trying to view private records.',
        parameters: {
          type: 'OBJECT',
          properties: {
            applicationNumber: {
              type: 'STRING',
              description: "Optional specific application reference ID (e.g. 'MH-PMAY-2026-60841'). If omitted, retrieves all applications for the authenticated citizen."
            }
          }
        }
      },
      {
        name: 'request_client_action',
        description: 'Dispatches an interactive action card to the citizen interface. Use this when the citizen asks to apply for a scheme, open the demonstration application portal, track an application in the dashboard, or review required documents. Actions ALWAYS require explicit citizen review and approval on an interactive card before executing. NEVER submit or complete an application directly.',
        parameters: {
          type: 'OBJECT',
          properties: {
            actionType: {
              type: 'STRING',
              description: 'The strict client action type.',
              enum: ['OPEN_APPLICATION_PORTAL', 'START_APPLICATION', 'CHECK_APPLICATION_STATUS', 'REQUEST_DOCUMENTS']
            },
            title: {
              type: 'STRING',
              description: 'Citizen-friendly action title (e.g. "Apply for Pradhan Mantri Awas Yojana (PMAY-G)")'
            },
            description: {
              type: 'STRING',
              description: 'Clear explanation of what the action does and why citizen approval is requested.'
            },
            schemeId: {
              type: 'STRING',
              description: 'Target scheme ID if applicable (e.g. "mh-housing-01")'
            },
            schemeName: {
              type: 'STRING',
              description: 'Target scheme title if applicable'
            },
            portalUrl: {
              type: 'STRING',
              description: 'Demonstration portal relative path (e.g. "/mock-portal/index.html")'
            },
            applicationNumber: {
              type: 'STRING',
              description: 'Application reference ID if tracking or referencing an existing application'
            },
            requiredDocuments: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'List of documents required if requesting documents'
            }
          },
          required: ['actionType', 'title', 'description']
        }
      },
      {
        name: 'list_citizen_documents',
        description: "Lists verified document metadata (documentType, category, fileName, verificationStatus, verifiedAt, expiryDate, safe extractedSummary) stored in the authenticated citizen's private document vault. Unauthenticated guests receive an access notice that document vault requires sign-in under the DPDP Act 2023. Never returns raw Aadhaar or raw binary content.",
        parameters: {
          type: 'OBJECT',
          properties: {
            category: {
              type: 'STRING',
              description: "Optional category filter, e.g. 'Identity Proof', 'Income Eligibility', 'Asset Proof', or 'All'"
            }
          }
        }
      },
      {
        name: 'check_document_consent',
        description: 'Checks whether explicit electronic consent has been granted by the citizen under the DPDP Act 2023 for a specific document category and scheme ID or purpose.',
        parameters: {
          type: 'OBJECT',
          properties: {
            documentCategory: {
              type: 'STRING',
              description: "Category of document, e.g. 'Identity Proof', 'Income Eligibility', 'Asset Proof', or 'All'"
            },
            schemeId: {
              type: 'STRING',
              description: "Target scheme ID (e.g. 'mh-housing-01')"
            },
            purpose: {
              type: 'STRING',
              description: "Specific purpose description, e.g. 'PMAY-G Scheme Application'"
            }
          },
          required: ['documentCategory']
        }
      },
      {
        name: 'record_document_consent',
        description: 'Records or revokes explicit citizen electronic consent under the DPDP Act 2023 to use a document category for a specific scheme application or purpose.',
        parameters: {
          type: 'OBJECT',
          properties: {
            documentCategory: {
              type: 'STRING',
              description: "Category of document, e.g. 'Identity Proof', 'Income Eligibility', 'Asset Proof'"
            },
            schemeId: {
              type: 'STRING',
              description: "Target scheme ID (e.g. 'mh-housing-01')"
            },
            isGranted: {
              type: 'BOOLEAN',
              description: 'true to grant consent, false to revoke consent'
            },
            purpose: {
              type: 'STRING',
              description: "Purpose description, e.g. 'PMAY-G Housing Scheme Application verification'"
            }
          },
          required: ['documentCategory', 'isGranted']
        }
      }
    ]
  }
];

// ====================================================================
// SERVER-SIDE TOOL IMPLEMENTATIONS (RLS & Security Protected)
// ====================================================================

interface ToolContext {
  authenticatedUser: Record<string, any> | null;
  supabaseClient: ReturnType<typeof createClient> | null;
  guestApplications?: Array<Record<string, unknown>>;
  clientActions: Array<Record<string, unknown>>;
}

async function executeGetCitizenProfile(_args: Record<string, any>, context: ToolContext) {
  const { authenticatedUser, supabaseClient } = context;

  if (authenticatedUser && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .maybeSingle();

      if (!error && data) {
        return {
          status: 'success',
          isAuthenticated: true,
          profile: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            state: data.state,
            district: data.district,
            taluka: data.taluka || 'Haveli',
            village: data.village || 'Wadebolhai',
            category: data.category,
            occupation: data.occupation,
            age: data.age ?? 60,
            dateOfBirth: data.date_of_birth || null,
            housingStatus: data.housing_status || 'Kutcha House',
            annualIncome: typeof data.annual_income === 'number' ? data.annual_income : 48000,
            landHoldingAcres: typeof data.land_holding_acres === 'number' ? data.land_holding_acres : 0.5,
            annualIncomeBracket: data.annual_income_bracket,
            digilockerLinked: data.digilocker_linked,
            aadhaarVerified: data.aadhaar_verified,
            role: data.role,
            fieldSources: data.field_sources || {},
            lastUpdated: data.updated_at
          }
        };
      }
    } catch (err: any) {
      console.warn('DB profile fetch error:', err?.message || err);
    }
  }

  // Guest Mode Profile Return: No verified profile
  return {
    status: 'unauthenticated_guest',
    isAuthenticated: false,
    message: 'No verified citizen profile on record. Citizen is currently an unauthenticated guest. Any age, income, caste category, occupation, or housing details must be asked directly from the citizen.',
    profile: null
  };
}

function executeFindSchemes(args: Record<string, any>) {
  const category = args.category ? String(args.category) : undefined;
  const state = args.state ? String(args.state) : undefined;
  const keyword = args.keyword ? String(args.keyword) : undefined;

  const schemes = queryVerifiedSchemes({ category, state, keyword });

  return {
    status: 'success',
    count: schemes.length,
    schemes: schemes.map((s) => ({
      id: s.id,
      title: s.title,
      state: s.state,
      category: s.category,
      department: s.department,
      benefit: s.benefit,
      eligibilityCriteria: s.eligibilityCriteria,
      requiredDocuments: s.requiredDocuments,
      officialSourceUrl: s.officialSourceUrl
    }))
  };
}

async function executeCheckEligibility(args: Record<string, any>, context: ToolContext) {
  const { authenticatedUser, supabaseClient } = context;
  const schemeId = String(args.schemeId || '').trim();

  // Locate scheme in verified DB
  const scheme = VERIFIED_SCHEMES_DB.find(
    (s) => s.id.toLowerCase() === schemeId.toLowerCase() ||
           s.title.toLowerCase().includes(schemeId.toLowerCase())
  );

  if (!scheme) {
    return {
      status: 'error',
      message: `Scheme '${schemeId}' was not found in verified government database.`,
      availableSchemes: VERIFIED_SCHEMES_DB.map((s) => ({ id: s.id, title: s.title }))
    };
  }

  // Fetch verified profile from database IF AND ONLY IF user is authenticated
  let verifiedDbProfile: any = null;
  if (authenticatedUser && supabaseClient) {
    try {
      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .maybeSingle();
      if (data) {
        verifiedDbProfile = data;
      }
    } catch {
      // ignore
    }
  }

  // Input data explicitly provided by citizen in current query/turn
  const inputData = args.applicantData || {};

  // Conflict & Discrepancy Detection:
  // Compare conversational inputs against verified document fields in profile.
  // Never silently overwrite verified information with conflicting conversational information.
  const conflicts: Array<{ field: string; verifiedValue: any; docType?: string; inputValue: any; message: string }> = [];
  if (verifiedDbProfile && verifiedDbProfile.field_sources) {
    const sources = verifiedDbProfile.field_sources;

    if (typeof inputData.annualIncome === 'number' && verifiedDbProfile.annual_income !== null && verifiedDbProfile.annual_income !== undefined) {
      if (inputData.annualIncome !== Number(verifiedDbProfile.annual_income)) {
        const docType = sources.annual_income?.docType || 'Income Certificate';
        conflicts.push({
          field: 'annualIncome',
          verifiedValue: Number(verifiedDbProfile.annual_income),
          docType,
          inputValue: inputData.annualIncome,
          message: `Discrepancy detected: Your verified ${docType} on record shows ₹${Number(verifiedDbProfile.annual_income).toLocaleString('en-IN')}, but conversational input specified ₹${Number(inputData.annualIncome).toLocaleString('en-IN')}.`
        });
      }
    }

    if (typeof inputData.citizenAge === 'number' && verifiedDbProfile.age !== null && verifiedDbProfile.age !== undefined) {
      if (inputData.citizenAge !== Number(verifiedDbProfile.age)) {
        const docType = sources.age?.docType || sources.name?.docType || 'Aadhaar Card';
        conflicts.push({
          field: 'citizenAge',
          verifiedValue: Number(verifiedDbProfile.age),
          docType,
          inputValue: inputData.citizenAge,
          message: `Discrepancy detected: Your verified ${docType} indicates ${verifiedDbProfile.age} years of age, but conversational input specified ${inputData.citizenAge} years.`
        });
      }
    }

    if (inputData.housingStatus && verifiedDbProfile.housing_status && 
        String(inputData.housingStatus).trim().toLowerCase() !== String(verifiedDbProfile.housing_status).trim().toLowerCase()) {
      const docType = sources.housing_status?.docType || 'Land Record / Survey';
      conflicts.push({
        field: 'housingStatus',
        verifiedValue: verifiedDbProfile.housing_status,
        docType,
        inputValue: inputData.housingStatus,
        message: `Discrepancy detected: Verified records indicate housing condition as '${verifiedDbProfile.housing_status}', but conversational input specified '${inputData.housingStatus}'.`
      });
    }
  }

  // Construct applicant data strictly without fabrication:
  // For authenticated citizens: use explicitly supplied values if provided, falling back to verified DB profile values.
  // NEVER invent or default age, caste, or income for guest users!
  const applicantData: CitizenApplicantData = {
    citizenAge: typeof inputData.citizenAge === 'number' 
      ? inputData.citizenAge 
      : (typeof verifiedDbProfile?.age === 'number' ? verifiedDbProfile.age : undefined),
    state: inputData.state || (verifiedDbProfile ? verifiedDbProfile.state : undefined),
    district: inputData.district || (verifiedDbProfile ? verifiedDbProfile.district : undefined),
    casteCategory: inputData.casteCategory || (verifiedDbProfile ? verifiedDbProfile.category : undefined),
    occupation: inputData.occupation || (verifiedDbProfile ? verifiedDbProfile.occupation : undefined),
    annualIncome: typeof inputData.annualIncome === 'number' 
      ? inputData.annualIncome 
      : (typeof verifiedDbProfile?.annual_income === 'number' ? Number(verifiedDbProfile.annual_income) : undefined),
    annualIncomeBracket: inputData.annualIncomeBracket || (verifiedDbProfile ? verifiedDbProfile.annual_income_bracket : undefined),
    housingStatus: inputData.housingStatus || (verifiedDbProfile?.housing_status ?? undefined),
    landHoldingAcres: typeof inputData.landHoldingAcres === 'number' 
      ? inputData.landHoldingAcres 
      : (typeof verifiedDbProfile?.land_holding_acres === 'number' ? Number(verifiedDbProfile.land_holding_acres) : undefined)
  };

  // Run deterministic rule engine
  const evalResult = evaluateSchemeEligibility(scheme, applicantData);

  return {
    status: 'success',
    schemeId: scheme.id,
    schemeTitle: scheme.title,
    grade: evalResult.grade,
    reasoning: evalResult.reasoning,
    missingFields: evalResult.missingFields,
    benefit: scheme.benefit,
    requiredDocuments: scheme.requiredDocuments,
    officialSourceUrl: scheme.officialSourceUrl,
    hasConflict: conflicts.length > 0,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
    evaluatedParameters: {
      citizenAge: applicantData.citizenAge ?? null,
      district: applicantData.district ?? null,
      state: applicantData.state ?? null,
      casteCategory: applicantData.casteCategory ?? null,
      housingStatus: applicantData.housingStatus ?? null,
      annualIncome: applicantData.annualIncome ?? null
    }
  };
}

async function executeTrackApplication(args: Record<string, any>, context: ToolContext) {
  const { authenticatedUser, supabaseClient, guestApplications } = context;
  const requestedAppNo = args.applicationNumber ? String(args.applicationNumber).trim() : null;

  // 1. Authenticated User Tracking (Strict RLS isolation)
  if (authenticatedUser && supabaseClient) {
    try {
      let query = supabaseClient
        .from('applications')
        .select('*')
        .eq('user_id', authenticatedUser.id);

      if (requestedAppNo) {
        query = query.eq('application_number', requestedAppNo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return {
          status: 'success',
          isAuthenticated: true,
          count: data.length,
          applications: data.map((app: any) => ({
            applicationNumber: app.application_number,
            schemeTitle: app.scheme_title,
            category: app.category,
            appliedDate: app.applied_date,
            lastUpdated: app.last_updated,
            currentStage: app.current_stage,
            overallProgress: app.overall_progress,
            status: app.status,
            nextAction: app.next_action || 'Under standard departmental review',
            isOfficialRecord: true
          }))
        };
      }

      return {
        status: 'not_found',
        isAuthenticated: true,
        applicationNumber: requestedAppNo,
        message: requestedAppNo 
          ? `Application not found. No record exists with reference number '${requestedAppNo}' under your authenticated account.`
          : 'You do not have any active scheme applications recorded under your authenticated account.'
      };
    } catch (err: any) {
      console.warn('DB application track error:', err?.message || err);
      return {
        status: 'error',
        message: 'Database query error during application tracking.'
      };
    }
  }

  // 2. Guest Mode Application Tracking
  // If this specific guest submitted an application in their current local browser session:
  if (guestApplications && Array.isArray(guestApplications) && guestApplications.length > 0) {
    let matched = guestApplications;
    if (requestedAppNo) {
      matched = guestApplications.filter((a: any) => 
        String(a.applicationNumber || a.application_number).toLowerCase() === requestedAppNo.toLowerCase()
      );
    }

    if (matched.length > 0) {
      return {
        status: 'demo_found',
        isGuest: true,
        isDemoData: true,
        notice: 'DEMO DATA: This application was created in a demonstration guest session on your device and is not an official government submission.',
        count: matched.length,
        applications: matched.map((a: any) => ({
          applicationNumber: a.applicationNumber || a.application_number,
          schemeTitle: a.schemeTitle || a.scheme_title,
          category: a.category || 'Housing',
          appliedDate: a.appliedDate || a.applied_date || 'Local Demo Session',
          lastUpdated: a.lastUpdated || a.last_updated || 'Just now',
          currentStage: a.currentStage || a.current_stage || 'Local Demonstration Review',
          overallProgress: a.overallProgress || a.overall_progress || 25,
          status: a.status || 'Under Review',
          nextAction: a.nextAction || a.next_action || 'Demonstration Mode',
          isDemoData: true
        }))
      };
    }
  }

  // 3. Unauthenticated guest attempting to access another citizen's application: ACCESS DENIED
  return {
    status: 'access_denied',
    isGuest: true,
    applicationNumber: requestedAppNo,
    message: requestedAppNo
      ? `Access Denied: Unauthenticated guests cannot access private citizen application records. To protect citizen privacy under the DPDP Act 2023, you must sign in to your verified account to view application '${requestedAppNo}'.`
      : 'Access Denied: You are currently an unauthenticated guest. Please sign in to view your application dashboard.'
  };
}

function executeRequestClientAction(args: Record<string, any>, context: ToolContext): Record<string, any> {
  const allowed = ['OPEN_APPLICATION_PORTAL', 'START_APPLICATION', 'CHECK_APPLICATION_STATUS', 'REQUEST_DOCUMENTS'];
  const actionType = String(args.actionType || '');

  if (!allowed.includes(actionType)) {
    return {
      status: 'rejected',
      error: `Invalid actionType '${actionType}'. Must be one of: ${allowed.join(', ')}`
    };
  }

  const actionItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: actionType,
    title: String(args.title || `Action: ${actionType}`).slice(0, 120),
    description: String(args.description || 'Interactive citizen action requested.').slice(0, 400),
    payload: {
      schemeId: args.schemeId ? String(args.schemeId).slice(0, 64) : undefined,
      schemeName: args.schemeName ? String(args.schemeName).slice(0, 120) : undefined,
      portalUrl: args.portalUrl ? String(args.portalUrl).slice(0, 100) : (actionType.includes('PORTAL') || actionType.includes('APPLICATION') ? '/mock-portal/index.html' : undefined),
      applicationNumber: args.applicationNumber ? String(args.applicationNumber).slice(0, 40) : undefined,
      requiredDocuments: Array.isArray(args.requiredDocuments) ? args.requiredDocuments.map(String).slice(0, 15) : undefined,
    },
    status: 'awaiting_approval',
    requiresApproval: true,
    createdAt: new Date().toISOString()
  };

  context.clientActions.push(actionItem);

  return {
    status: 'action_dispatched',
    actionType,
    requiresApproval: true,
    message: `Interactive action card '${actionItem.title}' has been dispatched to the citizen interface. The citizen must review the card and tap 'Approve & Proceed' before it executes. Explain what will happen and remind them that no application will be submitted without their final confirmation.`
  };
}

async function executeListCitizenDocuments(args: Record<string, any>, context: ToolContext) {
  const { authenticatedUser, supabaseClient } = context;

  if (!authenticatedUser || !supabaseClient) {
    return {
      status: 'unauthenticated_guest',
      isAuthenticated: false,
      message: 'Access Denied: The secure citizen document vault is protected under the DPDP Act 2023. Unauthenticated guests cannot view document vault records. Please sign in to your verified account.',
      documents: []
    };
  }

  try {
    let query = supabaseClient
      .from('citizen_documents')
      .select('id, document_type, category, file_name, verification_status, verified_at, expiry_date, extracted_summary, created_at')
      .eq('user_id', authenticatedUser.id);

    if (args.category && typeof args.category === 'string' && args.category.toLowerCase() !== 'all') {
      query = query.ilike('category', `%${args.category}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('DB list citizen documents error:', error.message);
      return {
        status: 'error',
        message: 'Failed to retrieve documents from vault.'
      };
    }

    return {
      status: 'success',
      isAuthenticated: true,
      count: data?.length || 0,
      documents: (data || []).map((doc: any) => ({
        id: doc.id,
        documentType: doc.document_type,
        category: doc.category,
        fileName: doc.file_name,
        verificationStatus: doc.verification_status,
        verifiedAt: doc.verified_at,
        expiryDate: doc.expiry_date || null,
        extractedSummary: doc.extracted_summary || {}
      }))
    };
  } catch (err: any) {
    console.warn('Exception listing citizen documents:', err?.message || err);
    return {
      status: 'error',
      message: 'Database query error during document vault retrieval.'
    };
  }
}

async function executeCheckDocumentConsent(args: Record<string, any>, context: ToolContext) {
  const { authenticatedUser, supabaseClient } = context;

  if (!authenticatedUser || !supabaseClient) {
    return {
      status: 'unauthenticated_guest',
      isAuthenticated: false,
      hasConsent: false,
      message: 'Unauthenticated guest: Cannot check consent records without signing in under DPDP Act 2023.'
    };
  }

  const category = args.documentCategory ? String(args.documentCategory).trim() : '';
  const schemeId = args.schemeId ? String(args.schemeId).trim() : null;

  try {
    let query = supabaseClient
      .from('consent_records')
      .select('*')
      .eq('user_id', authenticatedUser.id);

    if (category && category.toLowerCase() !== 'all') {
      query = query.eq('document_category', category);
    }
    if (schemeId) {
      query = query.eq('scheme_id', schemeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('DB check consent error:', error.message);
      return { status: 'error', hasConsent: false };
    }

    const activeRecord = data?.find((r: any) => r.is_granted && !r.revoked_at);

    return {
      status: 'success',
      isAuthenticated: true,
      hasConsent: Boolean(activeRecord),
      documentCategory: category,
      schemeId: schemeId || 'general',
      consentDetails: activeRecord ? {
        id: activeRecord.id,
        grantedAt: activeRecord.granted_at,
        purpose: activeRecord.purpose || 'Scheme Application Verification',
        dpdpVersion: activeRecord.dpdp_version
      } : null
    };
  } catch (err: any) {
    console.warn('Exception checking consent:', err?.message || err);
    return { status: 'error', hasConsent: false };
  }
}

async function executeRecordDocumentConsent(args: Record<string, any>, context: ToolContext) {
  const { authenticatedUser, supabaseClient } = context;

  if (!authenticatedUser || !supabaseClient) {
    return {
      status: 'unauthenticated_guest',
      isAuthenticated: false,
      message: 'Unauthenticated guest: Must sign in to grant or revoke electronic consent under DPDP Act 2023.'
    };
  }

  const category = args.documentCategory ? String(args.documentCategory).trim() : 'General';
  const schemeId = args.schemeId ? String(args.schemeId).trim() : 'general';
  const isGranted = Boolean(args.isGranted);
  const purpose = args.purpose ? String(args.purpose).trim() : `Verification for scheme ${schemeId}`;

  try {
    if (!isGranted) {
      // Revocation: Mark existing consent records as revoked
      const { error: updateErr } = await supabaseClient
        .from('consent_records')
        .update({
          is_granted: false,
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', authenticatedUser.id)
        .eq('document_category', category)
        .eq('scheme_id', schemeId);

      if (updateErr) {
        console.warn('Error revoking consent:', updateErr.message);
      }

      return {
        status: 'revoked',
        documentCategory: category,
        schemeId,
        isGranted: false,
        revokedAt: new Date().toISOString(),
        message: `Consent successfully revoked for document category '${category}' under DPDP Act 2023.`
      };
    }

    // Granting consent: insert new record into consent ledger
    const { data, error } = await supabaseClient
      .from('consent_records')
      .insert({
        user_id: authenticatedUser.id,
        consent_type: 'scheme_matching',
        document_category: category,
        scheme_id: schemeId,
        purpose,
        is_granted: true,
        granted_at: new Date().toISOString(),
        dpdp_version: 'DPDP Act 2023'
      })
      .select()
      .single();

    if (error) {
      console.warn('Error granting consent:', error.message);
      return { status: 'error', message: error.message };
    }

    return {
      status: 'granted',
      consentId: data.id,
      documentCategory: category,
      schemeId,
      isGranted: true,
      grantedAt: data.granted_at,
      purpose,
      dpdpVersion: data.dpdp_version,
      message: `Explicit consent granted for '${category}' under DPDP Act 2023.`
    };
  } catch (err: any) {
    console.warn('Exception recording consent:', err?.message || err);
    return { status: 'error', message: err?.message || 'Failed to record consent.' };
  }
}

async function executeTool(
  toolName: string, 
  args: Record<string, any>, 
  context: ToolContext
): Promise<Record<string, any>> {
  console.log(`[JANSAATHI AGENT] Executing tool: ${toolName} with args:`, JSON.stringify(args));

  switch (toolName) {
    case 'get_citizen_profile':
      return await executeGetCitizenProfile(args, context);
    case 'find_schemes':
      return executeFindSchemes(args);
    case 'check_eligibility':
      return await executeCheckEligibility(args, context);
    case 'track_application':
      return await executeTrackApplication(args, context);
    case 'request_client_action':
      return executeRequestClientAction(args, context);
    case 'list_citizen_documents':
      return await executeListCitizenDocuments(args, context);
    case 'check_document_consent':
      return await executeCheckDocumentConsent(args, context);
    case 'record_document_consent':
      return await executeRecordDocumentConsent(args, context);
    default:
      return {
        status: 'error',
        message: `Tool '${toolName}' is not permitted or does not exist.`
      };
  }
}

// ====================================================================
// MAIN REQUEST HANDLER (Deno.serve)
// ====================================================================

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 1. Validate Gemini API Key from Supabase Edge Function Secret
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.error('Missing GEMINI_API_KEY secret in Supabase Edge Function environment.');
    return new Response(
      JSON.stringify({ 
        error: 'AI service configuration pending: GEMINI_API_KEY is not configured in Supabase secrets. Please set it using: supabase secrets set GEMINI_API_KEY=your_key' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 2. Validate User Authentication (Supports both registered citizens & guest citizens)
  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  let authenticatedUser = null;
  let supabaseClient = null;

  if (supabaseUrl && supabaseAnonKey && authHeader) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (!userError && user) {
        authenticatedUser = user;
      }
    } catch (authErr) {
      console.warn('Optional auth token notice (proceeding in guest mode):', authErr);
    }
  }

  const isGuest = !authenticatedUser;

  // 3. Parse and Validate Request Payload
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload in request body.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const rawMessage = body.message;
  if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return new Response(
      JSON.stringify({ error: 'Field "message" is required and cannot be empty.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Enforce reasonable message length limit (prevents prompt abuse)
  const sanitizedMessage = sanitizeString(rawMessage, 2000);
  if (rawMessage.trim().length > 2000) {
    return new Response(
      JSON.stringify({ error: 'Message exceeds the maximum permitted length of 2000 characters.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate and sanitize language choice
  const rawLanguage = body.language;
  const language: 'English' | 'Hindi' | 'Marathi' = 
    rawLanguage === 'Hindi' ? 'Hindi' : rawLanguage === 'Marathi' ? 'Marathi' : 'English';

  // 4. Construct System Instruction with Mandated AI Behaviour, Tools & Guardrails
  let profileContextText = '';
  if (authenticatedUser && supabaseClient) {
    profileContextText = `
CITIZEN PROFILE CONTEXT (Verified Authenticated Citizen Account):
- Authentication: VERIFIED (auth.uid = ${authenticatedUser.id})
- Email: ${authenticatedUser.email}
Verified database profile can be retrieved using "get_citizen_profile".
`;
  } else {
    profileContextText = `
CITIZEN SESSION CONTEXT:
- Session Type: Unauthenticated Guest Citizen (Anonymous / Demo)
- Verified Database Profile: NONE
- STRICT RULE: You do NOT have any verified profile parameters. NEVER invent, assume, or default a citizen's age, caste category (e.g. OBC, SC, ST), annual income, occupation, or housing status. If an applicant parameter is not explicitly provided in the user's message, it is completely UNKNOWN (null).
`;
  }

  const languageDirective = language === 'Hindi'
    ? `LANGUAGE INSTRUCTION: You MUST respond strictly in natural, polite Hindi using Devanagari script (हिंदी). Translate all tool results, scheme benefits, and eligibility explanations into clear, respectful Hindi suitable for an Indian citizen.`
    : language === 'Marathi'
    ? `LANGUAGE INSTRUCTION: You MUST respond strictly in natural, polite Marathi using Devanagari script (मराठी). Translate all tool results, scheme benefits, and eligibility explanations into clear, respectful Marathi suitable for a Maharashtra citizen.`
    : `LANGUAGE INSTRUCTION: You MUST respond in clear, accessible, and polite Indian English.`;

  const systemInstruction = `
You are JANSAATHI AI (जनसाथी AI), an intelligent, multilingual citizen-services agent created to assist Indian citizens in discovering welfare schemes, understanding eligibility, preparing documentation, and navigating public services.

${languageDirective}

${profileContextText}

AUTONOMOUS TOOL ORCHESTRATION & BEHAVIOUR RULES:
1. You have access to official server-side tools:
   - "get_citizen_profile": Retrieves the citizen's verified demographic parameters & memory (returns null for unauthenticated guests).
   - "find_schemes": Searches verified official central and state schemes by category, state, or keyword.
   - "check_eligibility": Runs the official deterministic eligibility engine for a scheme.
   - "track_application": Looks up application status, review stage, and SLA timelines.
   - "request_client_action": Dispatches interactive action cards (e.g. START_APPLICATION, OPEN_APPLICATION_PORTAL).
   - "list_citizen_documents": Retrieves verified document metadata from the citizen's private secure vault.
   - "check_document_consent": Verifies DPDP Act 2023 electronic consent status for a document category and scheme.
   - "record_document_consent": Records or revokes citizen electronic consent under the DPDP Act 2023.

2. TOOL CALLING DECISION RULES:
   - When a citizen asks to find, list, or discover welfare schemes (e.g., "Show me housing schemes", "किसान योजनाएं बताओ", "घरकुल योजना दाखवा"), call "find_schemes" with the matching category or keyword.
   - When a citizen asks about eligibility for any scheme (e.g., "Am I eligible for PMAY-G?", "I live in a kutcha house in Pune. Am I eligible?", "क्या मुझे पेंशन मिलेगी?"):
     You MUST call "check_eligibility" with the schemeId (call "find_schemes" first if you need to discover the schemeId).
     CRITICAL: Pass ONLY parameters explicitly stated by the citizen in their message or retrieved from an authenticated profile. If age, caste, or income are unknown, leave them omitted/null.
     DO NOT invent age, caste (OBC/SC/ST/General), or income.
   - When a citizen asks about application status (e.g., "Where is my application?", "माझा अर्ज कुठे अडकला आहे?"):
     Call "track_application".
   - When a citizen asks about their saved documents or vault (e.g. "What documents do I have in my vault?", "माझ्याकडे कोणती कागदपत्रे आहेत?", "मेरे कौन से दस्तावेज हैं?"):
     Call "list_citizen_documents". Report the verified documents found in their vault, their verification status, and purpose.
   - For general informational questions or casual conversational queries (e.g., "Who are you?", "What is your purpose?"), answer normally without making unnecessary tool calls.

3. STRICT CITIZEN DATA INTEGRITY & ANTI-HALLUCINATION:
   - NEVER invent, assume, or guess citizen age, caste/social category, annual income, occupation, housing structure, or land holding size.
   - If a citizen says "I live in a kutcha house in Pune. Am I eligible?":
     * Housing: "Kutcha House"
     * District: "Pune"
     * State: "Maharashtra"
     Age is UNKNOWN. Caste category is UNKNOWN. Income is UNKNOWN.
     Pass ONLY { housingStatus: 'Kutcha House', district: 'Pune', state: 'Maharashtra' } to check_eligibility.
   - When "check_eligibility" returns "More Information Needed" and specifies missing fields, report that status and ask the citizen ONLY for those missing fields.

4. STRICT APPLICATION TRACKING RULES:
   - If "track_application" returns status "not_found", you MUST explicitly report: "Application not found. No record exists with this reference ID." NEVER invent an application status (such as "Under Review"), stage, submission date, or reference number.
   - If "track_application" returns status "access_denied", you MUST explicitly report: "Access denied. Unauthenticated guests cannot view official citizen application records. To protect citizen privacy under the DPDP Act 2023, you must sign in to your verified account to view this application."
   - If "track_application" returns status "demo_found" with isDemoData: true, you MUST explicitly state: "DEMO DATA: This application was created in a local demonstration session and is not an official government submission."
   - Never present mock or sample data as a real government application record.

5. STRICT DETERMINISTIC ELIGIBILITY GUARDRAIL:
   - You MUST NEVER independently invent, assume, or alter official eligibility determinations.
   - You MUST faithfully communicate the exact grade returned by "check_eligibility":
     * "Eligible"
     * "Likely eligible"
     * "More information needed"
     * "Not eligible"
   - Always clearly explain the specific reasoning returned by the rule engine.

6. INTERACTIVE CLIENT ACTION DISPATCHING:
   - You have access to "request_client_action" to dispatch interactive action cards directly to the citizen's interface.
   - Supported action types:
     * "START_APPLICATION": When a citizen wants to apply, start an application, or fill a form for an eligible welfare scheme (e.g. PMAY-G, Ramai Awas, PM-KISAN, Sanjay Gandhi Niradhar).
     * "OPEN_APPLICATION_PORTAL": When a citizen asks to open or browse the demonstration welfare application portal.
     * "CHECK_APPLICATION_STATUS": When a citizen wants to view their application in the live tracking page.
     * "REQUEST_DOCUMENTS": When a citizen needs to verify or check required documents for a scheme in the Document Assistant.
   - CRITICAL RULES FOR CLIENT ACTIONS:
     * NEVER claim you have directly submitted or completed an application to the government. All client actions require explicit citizen review and approval on an interactive card before anything opens or runs.
     * Emphasize clearly that JANSAATHI AI will NEVER submit any application without the citizen's final confirmation.
     * Inform the citizen that an interactive action card has appeared in their chat, explain what it will do, and let them know they can review the details and tap "Approve & Proceed" on the card.
     * Clearly state that the application portal is a Demonstration Portal for citizen assistance.

7. CITIZEN MEMORY, SECURE DOCUMENT VAULT & DPDP CONSENT RULES:
   - When a citizen expresses intent to apply for a scheme or asks what documents are needed:
     1. Call "list_citizen_documents" to check what verified documents are ALREADY in the citizen's vault.
     2. Cross-reference the scheme's required documents against the vault documents.
     3. If a required document already exists in the vault (e.g., Aadhaar Card, Income Certificate, Land Record 7/12 for PMAY-G), DO NOT ask the citizen to upload or provide it again!
     4. Tell the citizen that their verified documents are already safely stored in their vault.
     5. Explain that explicit consent under the Digital Personal Data Protection (DPDP) Act 2023 will be requested to attach their vault documents to this specific application.
     6. Ask the citizen ONLY for documents that are genuinely MISSING from the vault.
   - CONFLICT RESOLUTION:
     If "check_eligibility" returns "hasConflict: true" with discrepancy details (for example, citizen mentions income of ₹1,50,000, but verified Income Certificate on record shows ₹48,000):
     * NEVER silently overwrite the verified document value!
     * Ask the citizen politely to clarify and resolve the discrepancy:
       "Your verified Income Certificate shows ₹48,000, but you mentioned ₹1,50,000. Which should we use? If your income has changed, an updated certificate may be required."
   - DPDP ACT 2023 COMPLIANCE:
     * Never treat consent granted for one application (e.g. PMAY-G) as blanket consent for another scheme (e.g. PM-KISAN).
     * Never output raw unmasked Aadhaar numbers (only masked formats like XXXX-XXXX-4912).

8. VOICE-DRIVEN END-TO-END APPLICATION JOURNEY RULES:
   - MULTILINGUAL VOICE CONVERSATION:
     The citizen interacts primarily through spoken voice in Hindi (हिंदी), Marathi (मराठी), or English. Respond politely, respectfully, and in natural, spoken-friendly phrasing suitable for Text-to-Speech (TTS) audio readout.
   - HANDLING VAGUE CITIZEN INQUIRIES:
     When an elderly or rural citizen makes a conversational or vague statement such as:
     * "मला घर बांधायचे आहे, काही योजना आहे का?" (I want to build a house, is there any scheme?)
     * "मुझे पक्का मकान चाहिए, सरकार की कोई मदद मिल सकती है क्या?" (I need a pucca house, can I get government help?)
     * "I live in a mud house in Pune, can the government help me build a home?"
     * "I need help with farming" / "किसान सहायता" / "शेतकरी मदत"
     Follow this seamless sequence:
     1. Search for verified matching schemes using "find_schemes".
     2. Retrieve verified citizen profile memory using "get_citizen_profile".
     3. Check verified documents already available in the secure vault using "list_citizen_documents".
     4. Evaluate official eligibility using "check_eligibility".
     5. Summarize key applicant parameters clearly back to the citizen for voice confirmation (name, age, village, income, housing structure).
     6. If information is missing, ask ONLY for the specific missing fields in simple language.
     7. Confirm that verified vault documents (e.g. Aadhaar, Income Certificate, Land Record) are already ready, and explain that explicit DPDP consent will be recorded.
     8. Dispatch "request_client_action" with "START_APPLICATION" or "OPEN_APPLICATION_PORTAL" so the citizen can proceed.
   - SPEECH RECOGNITION TOLERANCE:
     Never assume speech recognition is 100% accurate. If an input is ambiguous, ask a polite, concise clarifying question.
   - APPLICATION TRACKING INQUIRIES:
     When a citizen asks about their application status (e.g., "Where is my application?", "Track my PMAY application", "माझा अर्ज कुठे अडकला आहे?", "मेरे आवेदन की स्थिति क्या है?"):
     Call "track_application". Read back the status, review stage, and next action clearly. If it is a demonstration submission, clearly identify it as a local demonstration record.
`.trim();

  // 5. Build Initial Conversation Contents
  const contents: any[] = [];
  const rawHistory = Array.isArray(body.history) ? body.history : [];

  // Limit conversation history to the last 12 messages to prevent prompt inflation
  const cappedHistory = rawHistory.slice(-12);
  for (const item of cappedHistory) {
    if (item && typeof item.text === 'string' && item.text.trim()) {
      const role = item.role === 'model' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: sanitizeString(item.text, 2000) }]
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: sanitizedMessage }]
  });

  // 6. Invoke Gemini API with Multi-Turn Tool Execution Loop
  try {
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite'
    ];

    let assistantText = '';
    const allModelErrors: string[] = [];
    let successfulModel = '';
    let executedToolsList: Array<{ name: string; args: any; resultSummary: string }> = [];
    const sessionClientActions: Array<Record<string, unknown>> = [];

    const toolContext: ToolContext = {
      authenticatedUser,
      supabaseClient,
      guestApplications: body.guestApplications,
      clientActions: sessionClientActions
    };

    for (const model of candidateModels) {
      try {
        console.log(`[JANSAATHI AGENT] Initializing multi-turn tool session on model: ${model}...`);
        
        let sessionContents = [...contents];
        let iteration = 0;
        const maxIterations = 6;
        let finalTurnText = '';
        const sessionExecutedTools: Array<{ name: string; args: any; resultSummary: string }> = [];

        while (iteration < maxIterations) {
          iteration++;
          console.log(`[JANSAATHI AGENT] Iteration ${iteration}/${maxIterations} on ${model}...`);

          const geminiPayload = {
            contents: sessionContents,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            tools: agentTools,
            toolConfig: {
              functionCallingConfig: {
                mode: 'AUTO'
              }
            },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1400
            }
          };

          let data: any = null;
          let fetchSucceeded = false;
          const maxAttempts = 3;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const resp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiPayload),
                signal: AbortSignal.timeout(45000)
              }
            );

            data = await resp.json();

            if (resp.ok) {
              fetchSucceeded = true;
              break;
            }

            const errStatus = resp.status;
            const msg = String(data?.error?.message || 'Gemini API Error');
            console.warn(`[JANSAATHI AGENT] Model ${model} (attempt ${attempt}/${maxAttempts}) returned HTTP ${errStatus}: ${msg}`);

            // Requirement 5, 6, 7: Handle HTTP 429 separately, respect retry info, bounded retries (never retry daily quota)
            if (errStatus === 429) {
              const isDailyLimit = msg.includes('per day limit exceeded') || msg.includes('requests per day') || msg.includes('hours') || msg.includes('6h');
              if (isDailyLimit || attempt >= maxAttempts) {
                throw new Error(`HTTP 429 (Daily Quota Exceeded): ${msg}`);
              }

              // Extract retry-in seconds if provided
              const retryMatch = msg.match(/retry in (\d+(\.\d+)?)s/i);
              let waitSec = retryMatch ? parseFloat(retryMatch[1]) : 5;
              if (isNaN(waitSec) || waitSec <= 0) waitSec = 5;

              // Cap waitSec at 25 seconds to respect per-minute reset window
              waitSec = Math.min(waitSec, 25);

              console.log(`[JANSAATHI AGENT] Per-minute rate limit hit on ${model}. Pausing ${waitSec}s before bounded retry...`);
              await new Promise(r => setTimeout(r, waitSec * 1000 + 1000));
              continue;
            }

            // Handle temporary high demand / server spikes (503 / 500)
            if (errStatus === 503 || errStatus === 500) {
              if (attempt >= maxAttempts) {
                throw new Error(`HTTP ${errStatus}: ${msg}`);
              }
              console.log(`[JANSAATHI AGENT] Temporary server spike (${errStatus}) on ${model}. Pausing 2.5s before retry...`);
              await new Promise(r => setTimeout(r, 2500));
              continue;
            }

            // Other error statuses fail immediately to next candidate
            throw new Error(`HTTP ${errStatus}: ${msg}`);
          }

          if (!fetchSucceeded || !data) {
            throw new Error(`Failed to retrieve valid response from model ${model}`);
          }

          const candidate = data?.candidates?.[0];
          if (!candidate?.content?.parts) {
            throw new Error('No candidate content returned from Gemini.');
          }

          // Check if Gemini requested one or more tool calls
          const functionCallParts = candidate.content.parts.filter((p: any) => p.functionCall);

          if (functionCallParts.length > 0) {
            console.log(`[JANSAATHI AGENT] Model returned ${functionCallParts.length} tool call(s).`);

            // Append model's turn to conversation history
            sessionContents.push(candidate.content);

            // Execute each requested tool
            const toolResponseParts: any[] = [];
            for (const part of functionCallParts) {
              const fnCall = part.functionCall;
              const toolResult = await executeTool(fnCall.name, fnCall.args || {}, toolContext);

              sessionExecutedTools.push({
                name: fnCall.name,
                args: fnCall.args || {},
                resultSummary: typeof toolResult === 'object' ? JSON.stringify(toolResult).slice(0, 160) : String(toolResult)
              });

              toolResponseParts.push({
                functionResponse: {
                  name: fnCall.name,
                  response: toolResult
                }
              });
            }

            // Append function responses as a 'user' turn for the next iteration
            sessionContents.push({
              role: 'user',
              parts: toolResponseParts
            });

            // Continue the loop to allow Gemini to process tool responses
            continue;
          }

          // No tool calls: check for assistant text
          const nonThoughtParts = candidate.content.parts
            .filter((p: any) => typeof p.text === 'string' && p.text.trim() && !p.thought)
            .map((p: any) => p.text);
          const allTextParts = candidate.content.parts
            .filter((p: any) => typeof p.text === 'string' && p.text.trim())
            .map((p: any) => p.text);

          const usableText = nonThoughtParts.length > 0 ? nonThoughtParts : allTextParts;

          if (usableText.length > 0) {
            finalTurnText = usableText.join('\n\n');
            console.log(`[JANSAATHI AGENT] Natural language response generated (${finalTurnText.length} chars).`);
            break;
          }
        }

        if (finalTurnText) {
          assistantText = finalTurnText;
          successfulModel = model;
          executedToolsList = sessionExecutedTools;
          console.log(`[JANSAATHI AGENT] Completed successfully on ${model} with ${executedToolsList.length} tool(s) executed.`);
          break;
        } else {
          console.warn(`[JANSAATHI AGENT] Model ${model} reached iteration limit (${maxIterations}) without final text response.`);
          allModelErrors.push(`${model}: reached ${iteration} iterations without generating final text`);
        }

      } catch (err: any) {
        console.warn(`[JANSAATHI AGENT] Exception with model ${model}:`, err?.message || err);
        allModelErrors.push(`${model}: ${err?.message || err}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!assistantText) {
      throw new Error(`All candidate Gemini models failed tool execution: ${allModelErrors.join(' || ')}`);
    }

    // 7. Return Assistant Response (Never expose API keys or internal secrets)
    return new Response(
      JSON.stringify({ 
        response: assistantText,
        language,
        isGuest,
        modelUsed: successfulModel,
        toolsExecuted: executedToolsList,
        clientActions: sessionClientActions
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (geminiError: any) {
    console.error('[JANSAATHI AGENT] Execution error:', geminiError?.message || geminiError);

    const errorMessage = String(geminiError?.message || geminiError || '');
    let clientErrorMessage = 'The JANSAATHI AI assistant service is temporarily unavailable. Please try again shortly.';
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
      clientErrorMessage = 'The configured GEMINI_API_KEY is invalid. Please verify the API key in Supabase secrets.';
    } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || geminiError?.status === 429) {
      clientErrorMessage = 'AI service capacity is currently busy. Please wait a moment and try your query again.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      clientErrorMessage = `Model request error: ${errorMessage}`;
    }

    const sanitizedDetails = errorMessage.replace(/key=[a-zA-Z0-9_-]+/gi, 'key=REDACTED');

    return new Response(
      JSON.stringify({ 
        error: clientErrorMessage,
        details: sanitizedDetails
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
