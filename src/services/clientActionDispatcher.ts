import type { 
  ClientAction, 
  ClientActionType, 
  ClientActionResult, 
  PageRoute,
  PortalProgressEvent,
  PortalValidationFailedEvent
} from '../types';

export const ALLOWED_ACTION_TYPES: readonly ClientActionType[] = [
  'OPEN_APPLICATION_PORTAL',
  'START_APPLICATION',
  'CHECK_APPLICATION_STATUS',
  'REQUEST_DOCUMENTS'
] as const;

export interface PortalBridgeCallbacks {
  onSubmission: (payload: Record<string, unknown>) => void;
  onProgress?: (event: PortalProgressEvent) => void;
  onValidationFailed?: (event: PortalValidationFailedEvent) => void;
}

export interface ActionExecutionContext {
  openApplicationModal: (schemeId?: string, applicantData?: Record<string, unknown>) => void;
  openMockPortalTab: (params?: Record<string, string>) => Window | null;
  navigateTo: (route: PageRoute, params?: Record<string, unknown>) => void;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  broadcastPortalMessage: (action: string, payload: Record<string, unknown>, step?: number) => void;
}

/**
 * Strips HTML tags, script syntax, and controls string length for safe rendering.
 */
function sanitizeString(str: unknown, maxLen = 300): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Validates a relative mock portal URL to prevent open redirects or protocol injection.
 */
function isValidPortalUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  // Strictly enforce relative path under /mock-portal/
  if (!url.startsWith('/mock-portal/') && url !== '/mock-portal') return false;
  // Disallow colon, protocols, or double slashes
  if (url.includes(':') || url.includes('//')) return false;
  return true;
}

/**
 * Validates and sanitizes a raw action request received from Gemini Edge Function.
 * Returns null if the action does not match the strict allowlist.
 */
export function validateAndSanitizeAction(raw: unknown): ClientAction | null {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Record<string, unknown>;
  const rawType = candidate.type || candidate.actionType;

  if (typeof rawType !== 'string' || !ALLOWED_ACTION_TYPES.includes(rawType as ClientActionType)) {
    console.warn('[JANSAATHI DISPATCHER] Rejected untrusted action type:', rawType);
    return null;
  }

  const type = rawType as ClientActionType;
  const title = sanitizeString(candidate.title || `Action: ${type}`, 120);
  const description = sanitizeString(
    candidate.description || 'Interactive civic action requested by JANSAATHI AI assistant.',
    400
  );

  const rawPayload = (candidate.payload || {}) as Record<string, unknown>;
  const payload: ClientAction['payload'] = {};

  // Validate schemeId
  if (rawPayload.schemeId && typeof rawPayload.schemeId === 'string') {
    const cleanSchemeId = rawPayload.schemeId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    if (cleanSchemeId) payload.schemeId = cleanSchemeId;
  } else if (candidate.schemeId && typeof candidate.schemeId === 'string') {
    payload.schemeId = sanitizeString(candidate.schemeId, 64);
  }

  // Validate schemeName
  if (rawPayload.schemeName && typeof rawPayload.schemeName === 'string') {
    payload.schemeName = sanitizeString(rawPayload.schemeName, 120);
  } else if (candidate.schemeName && typeof candidate.schemeName === 'string') {
    payload.schemeName = sanitizeString(candidate.schemeName, 120);
  }

  // Validate portalUrl
  const portalUrlCandidate = rawPayload.portalUrl || candidate.portalUrl;
  if (portalUrlCandidate && isValidPortalUrl(portalUrlCandidate)) {
    payload.portalUrl = String(portalUrlCandidate);
  } else if (type === 'OPEN_APPLICATION_PORTAL' || type === 'START_APPLICATION') {
    payload.portalUrl = '/mock-portal/index.html';
  }

  // Validate applicationNumber
  const appNumCandidate = rawPayload.applicationNumber || candidate.applicationNumber;
  if (appNumCandidate && typeof appNumCandidate === 'string') {
    const cleanAppNum = appNumCandidate.replace(/[^A-Za-z0-9-]/g, '').slice(0, 40);
    if (cleanAppNum) payload.applicationNumber = cleanAppNum;
  }

  // Validate requiredDocuments
  const docsCandidate = rawPayload.requiredDocuments || candidate.requiredDocuments;
  if (Array.isArray(docsCandidate)) {
    payload.requiredDocuments = docsCandidate
      .filter((d) => typeof d === 'string')
      .map((d) => sanitizeString(d, 80))
      .slice(0, 15);
  }

  // Validate applicantData
  const applicantCandidate = rawPayload.applicantData as Record<string, unknown> | undefined;
  if (applicantCandidate && typeof applicantCandidate === 'object') {
    payload.applicantData = {
      name: sanitizeString(applicantCandidate.name, 100) || undefined,
      age: typeof applicantCandidate.age === 'number' && applicantCandidate.age > 0 ? applicantCandidate.age : undefined,
      district: sanitizeString(applicantCandidate.district, 60) || undefined,
      state: sanitizeString(applicantCandidate.state, 60) || undefined,
      housingStatus: sanitizeString(applicantCandidate.housingStatus, 60) || undefined,
      annualIncome: typeof applicantCandidate.annualIncome === 'number' ? applicantCandidate.annualIncome : undefined,
      casteCategory: sanitizeString(applicantCandidate.casteCategory, 40) || undefined,
    };
  }

  const id = typeof candidate.id === 'string' && candidate.id.length > 0 
    ? candidate.id 
    : `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const requiresApproval = candidate.requiresApproval !== false;

  return {
    id,
    type,
    title,
    description,
    payload,
    status: requiresApproval ? 'awaiting_approval' : 'pending',
    requiresApproval,
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString()
  };
}

/**
 * Centralized executor for allowed client actions.
 * Enforces citizen approval verification and invokes existing application components.
 */
export async function executeClientAction(
  action: ClientAction,
  context: ActionExecutionContext
): Promise<ClientActionResult> {
  // Security verification
  if (!ALLOWED_ACTION_TYPES.includes(action.type)) {
    return {
      success: false,
      message: `Execution blocked: Action type '${action.type}' is not permitted.`
    };
  }

  if (action.requiresApproval && !action.approvalGranted) {
    return {
      success: false,
      message: 'Citizen explicit approval is mandatory before executing this action.'
    };
  }

  try {
    switch (action.type) {
      case 'OPEN_APPLICATION_PORTAL': {
        const queryParams: Record<string, string> = {};
        if (action.payload.schemeId) queryParams.scheme = action.payload.schemeId;
        if (action.payload.applicantData?.name) queryParams.name = action.payload.applicantData.name;
        if (action.payload.applicantData?.age) queryParams.age = String(action.payload.applicantData.age);
        if (action.payload.applicantData?.district) queryParams.district = action.payload.applicantData.district;
        if (action.payload.applicantData?.annualIncome) queryParams.income = String(action.payload.applicantData.annualIncome);
        if (action.payload.applicantData?.housingStatus) queryParams.housing = action.payload.applicantData.housingStatus;

        context.openMockPortalTab(queryParams);

        // Also broadcast to any already open portal tabs
        context.broadcastPortalMessage('PREFILL_AND_NAVIGATE', queryParams, 1);
        context.showToast(
          'Demonstration Portal Opened',
          'Opened demonstration welfare portal in a separate tab. Complete citizen review and authorization there.',
          'info'
        );

        return {
          success: true,
          message: 'Demonstration welfare portal opened in real browser window. Citizen review and authorization required in portal.',
          data: {
            portalUrl: action.payload.portalUrl || '/mock-portal/index.html',
            params: queryParams
          }
        };
      }

      case 'START_APPLICATION': {
        context.openApplicationModal(action.payload.schemeId, action.payload.applicantData);

        // Broadcast prefill payload across channel
        if (action.payload.applicantData) {
          context.broadcastPortalMessage('PREFILL_AND_NAVIGATE', action.payload.applicantData, 1);
        }

        context.showToast(
          'Application Assistant Started',
          `Application for ${action.payload.schemeName || 'selected scheme'} is ready for review.`,
          'info'
        );

        return {
          success: true,
          message: `Application assistant started for ${action.payload.schemeName || 'welfare scheme'}. Form prepared with verified citizen information; waiting for citizen confirmation.`,
          data: {
            schemeId: action.payload.schemeId,
            schemeName: action.payload.schemeName
          }
        };
      }

      case 'CHECK_APPLICATION_STATUS': {
        context.navigateTo('applications', { applicationNumber: action.payload.applicationNumber });
        context.showToast(
          'Applications Tracker',
          action.payload.applicationNumber 
            ? `Viewing tracking timeline for ${action.payload.applicationNumber}.` 
            : 'Viewing live application tracking dashboard.',
          'info'
        );

        return {
          success: true,
          message: `Opened live application tracking page${action.payload.applicationNumber ? ` for reference ${action.payload.applicationNumber}` : ''}.`,
          data: { applicationNumber: action.payload.applicationNumber }
        };
      }

      case 'REQUEST_DOCUMENTS': {
        context.navigateTo('documents', { schemeId: action.payload.schemeId });
        context.showToast(
          'Document Assistant',
          'Opened Document Assistant to review required verification credentials.',
          'info'
        );

        return {
          success: true,
          message: `Opened Document Assistant to review required verification credentials for ${action.payload.schemeName || 'application'}.`,
          data: { requiredDocuments: action.payload.requiredDocuments }
        };
      }

      default: {
        return {
          success: false,
          message: `Unknown action type: ${(action as any).type}`
        };
      }
    }
  } catch (err: any) {
    console.error('[JANSAATHI DISPATCHER] Action execution failed:', err);
    return {
      success: false,
      message: `Failed to execute action: ${err?.message || 'Internal execution error'}`
    };
  }
}

/**
 * Creates a BroadcastChannel bridge to monitor portal progress events, validation alerts, and submissions.
 */
export function createPortalBroadcastBridge(
  callbacks: PortalBridgeCallbacks | ((payload: Record<string, unknown>) => void)
): () => void {
  const handler: PortalBridgeCallbacks = typeof callbacks === 'function'
    ? { onSubmission: callbacks }
    : callbacks;

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel('jansaathi_portal_channel');
    channel.onmessage = (event) => {
      if (!event.data) return;
      if (event.data.type === 'APPLICATION_SUBMITTED') {
        handler.onSubmission(event.data);
      } else if (event.data.type === 'PORTAL_PROGRESS') {
        handler.onProgress?.(event.data);
      } else if (event.data.type === 'PORTAL_VALIDATION_FAILED') {
        handler.onValidationFailed?.(event.data);
      }
    };
  } catch (err) {
    console.warn('[JANSAATHI DISPATCHER] BroadcastChannel error:', err);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'jansaathi_latest_submitted_app' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && parsed.applicationNumber) {
          handler.onSubmission(parsed);
        }
      } catch {
        // Ignore JSON parse error
      }
    } else if (event.key === 'jansaathi_portal_progress' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && parsed.stage) {
          handler.onProgress?.(parsed);
        }
      } catch {
        // Ignore JSON parse error
      }
    } else if (event.key === 'jansaathi_portal_validation_failed' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && parsed.missingFields) {
          handler.onValidationFailed?.(parsed);
        }
      } catch {
        // Ignore JSON parse error
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) channel.close();
    window.removeEventListener('storage', handleStorage);
  };
}
