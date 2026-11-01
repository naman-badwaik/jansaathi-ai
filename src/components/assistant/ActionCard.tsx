import React from 'react';
import { 
  ExternalLink, 
  FileText, 
  Clock, 
  FolderCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  X
} from 'lucide-react';
import type { ClientAction, ClientActionType } from '../../types';

export interface ActionCardProps {
  action: ClientAction;
  onApprove: (action: ClientAction) => void;
  onCancel: (action: ClientAction) => void;
  onRetry?: (action: ClientAction) => void;
  isExecuting?: boolean;
}

function getActionIcon(type: ClientActionType) {
  switch (type) {
    case 'OPEN_APPLICATION_PORTAL':
      return <ExternalLink className="w-4 h-4 text-blue-600" />;
    case 'START_APPLICATION':
      return <FileText className="w-4 h-4 text-amber-600" />;
    case 'CHECK_APPLICATION_STATUS':
      return <Clock className="w-4 h-4 text-indigo-600" />;
    case 'REQUEST_DOCUMENTS':
      return <FolderCheck className="w-4 h-4 text-emerald-600" />;
  }
}

function getActionTypeLabel(type: ClientActionType): string {
  switch (type) {
    case 'OPEN_APPLICATION_PORTAL':
      return 'Portal Navigation';
    case 'START_APPLICATION':
      return 'Automated Application';
    case 'CHECK_APPLICATION_STATUS':
      return 'Application Tracker';
    case 'REQUEST_DOCUMENTS':
      return 'Document Assistant';
  }
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onApprove,
  onCancel,
  onRetry,
  isExecuting = false
}) => {
  const isAwaiting = action.status === 'awaiting_approval';
  const isRunning = action.status === 'running' || isExecuting;
  const isCompleted = action.status === 'completed';
  const isFailed = action.status === 'failed';
  const isPending = action.status === 'pending';

  return (
    <div
      role="region"
      aria-label={`Action: ${action.title}`}
      className={`my-2.5 rounded-2xl border transition-all text-xs overflow-hidden shadow-sm ${
        isCompleted
          ? 'bg-emerald-50/60 border-emerald-300'
          : isFailed
          ? 'bg-rose-50/60 border-rose-300'
          : isRunning
          ? 'bg-blue-50/60 border-blue-300 animate-pulse'
          : isAwaiting
          ? 'bg-amber-50/50 border-amber-300'
          : 'bg-slate-50 border-slate-300'
      }`}
    >
      {/* Header Bar */}
      <div className="px-3.5 py-2.5 bg-white/80 border-b border-inherit flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <div className="p-1 rounded-lg bg-slate-100 shrink-0">
            {getActionIcon(action.type)}
          </div>
          <span className="font-semibold text-slate-900 truncate text-[11px]">
            {getActionTypeLabel(action.type)}
          </span>
        </div>

        {/* State Badge (Requirement 7: Pending, Awaiting Approval, Running, Completed, Failed) */}
        <div>
          {isPending && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              Pending
            </span>
          )}
          {isAwaiting && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              Awaiting Approval
            </span>
          )}
          {isRunning && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              Running
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Completed
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 space-y-2">
        <h4 className="font-bold text-slate-900 text-xs leading-snug">
          {action.title}
        </h4>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          {action.description}
        </p>

        {/* Action Metadata Chips */}
        {(action.payload.schemeName || action.payload.applicationNumber || action.payload.requiredDocuments) && (
          <div className="pt-1 flex flex-wrap gap-1.5">
            {action.payload.schemeName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700 font-medium">
                🎯 {action.payload.schemeName}
              </span>
            )}
            {action.payload.applicationNumber && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-800 font-mono font-bold">
                📄 Ref: {action.payload.applicationNumber}
              </span>
            )}
            {action.payload.requiredDocuments && action.payload.requiredDocuments.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                📋 {action.payload.requiredDocuments.length} Document(s) Needed
              </span>
            )}
          </div>
        )}

        {/* Human Verification & Demo Notice */}
        {isAwaiting && (
          <div className="mt-2 p-2 bg-amber-100/70 border border-amber-200/90 rounded-xl text-[10px] text-amber-950 flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Human Confirmation Required:</strong> The assistant will open the demonstration application workflow. No final submission will occur without your separate review and signature.
            </p>
          </div>
        )}

        {/* Live Browser Automation Progress Stages (Requirement 3) */}
        {(isRunning || action.currentStage) && !isCompleted && !isFailed && (
          <div className="mt-2 p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-blue-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Live Portal Automation</span>
              </span>
              <span className="text-[10px] text-blue-700 font-mono">
                {action.currentStage ? action.currentStage.replace(/_/g, ' ') : 'RUNNING'}
              </span>
            </div>

            {/* Stepper Display */}
            <div className="grid grid-cols-5 gap-1 pt-1 text-[9px] text-center font-medium">
              {[
                { stage: 'PORTAL_OPENED', label: '1. Opened' },
                { stage: 'APPLICANT_DETAILS_FILLED', label: '2. Filled' },
                { stage: 'DOCUMENTS_ADDED', label: '3. Docs' },
                { stage: 'VALIDATION_COMPLETED', label: '4. Validated' },
                { stage: 'AWAITING_FINAL_APPROVAL', label: '5. Approval' },
              ].map((step, idx) => {
                const stages = ['PORTAL_OPENED', 'APPLICANT_DETAILS_FILLED', 'DOCUMENTS_ADDED', 'VALIDATION_COMPLETED', 'AWAITING_FINAL_APPROVAL'];
                const currentIdx = action.currentStage ? stages.indexOf(action.currentStage) : -1;
                const isStepCompleted = currentIdx > idx;
                const isStepActive = currentIdx === idx;

                return (
                  <div
                    key={step.stage}
                    className={`py-1 px-0.5 rounded transition-colors ${
                      isStepCompleted
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : isStepActive
                        ? 'bg-blue-200 text-blue-900 font-bold ring-1 ring-blue-400'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {action.progressMessage && (
              <p className="text-[10px] text-blue-800 leading-tight">
                {action.progressMessage}
              </p>
            )}

            {action.currentStage === 'AWAITING_FINAL_APPROVAL' && (
              <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-[10px] text-amber-900 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Awaiting final declaration & submission in the demonstration portal window.</span>
              </div>
            )}
          </div>
        )}

        {/* Execution Result Banner */}
        {isCompleted && action.result && (
          <div className="mt-2 p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-[11px] text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Action Successfully Executed</span>
            </div>
            <p className="text-[10px] text-emerald-900 leading-tight">
              {action.result.message}
            </p>
          </div>
        )}

        {/* Error Banner */}
        {isFailed && (
          <div className="mt-2 p-2.5 bg-rose-100/80 border border-rose-300 rounded-xl text-[11px] text-rose-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
              <span>Execution Error</span>
            </div>
            <p className="text-[10px] text-rose-900 leading-tight">
              {action.error || action.result?.message || 'The action could not be completed.'}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons (Requirement 9: Large touch targets, accessible without typing) */}
      <div className="px-3.5 py-2.5 bg-white/70 border-t border-inherit flex items-center justify-end gap-2">
        {isAwaiting && (
          <>
            <button
              type="button"
              onClick={() => onCancel(action)}
              className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={() => onApprove(action)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approve & Proceed</span>
            </button>
          </>
        )}

        {isRunning && (
          <div className="flex items-center gap-2 text-[11px] text-blue-700 font-semibold py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Processing action in browser...</span>
          </div>
        )}

        {isCompleted && (
          <span className="text-[10px] text-emerald-800 font-medium py-1">
            ✓ Logged in session audit trail
          </span>
        )}

        {isFailed && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(action)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            Retry Action
          </button>
        )}
      </div>
    </div>
  );
};
