import React, { useState } from 'react';
import { Sparkles, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import type { 
  CitizenProfile, 
  SchemeItem, 
  ApplicationItem, 
  ActivityItem, 
  AssistanceCentre, 
  PageRoute,
  CitizenIntakeData
} from '../types';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { SchemeDiscoveryCard } from '../components/dashboard/SchemeDiscoveryCard';
import { DocumentAssistantCard } from '../components/dashboard/DocumentAssistantCard';
import { ApplicationsCard } from '../components/dashboard/ApplicationsCard';
import { AssistanceCentresCard } from '../components/dashboard/AssistanceCentresCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { PrivacyConsentSection } from '../components/dashboard/PrivacyConsentSection';
import { CitizenIntakeWorkflow } from '../components/intake/CitizenIntakeWorkflow';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export interface DashboardPageProps {
  profile: CitizenProfile;
  schemes: SchemeItem[];
  applications: ApplicationItem[];
  activities: ActivityItem[];
  centres: AssistanceCentre[];
  intakeData?: CitizenIntakeData;
  onRouteChange: (route: PageRoute) => void;
  onOpenVoiceModal: () => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  onIntakeCompleted?: (data: CitizenIntakeData) => void;
  onOpenDemoRunner?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  schemes,
  applications,
  activities,
  centres,
  intakeData: _intakeData,
  onRouteChange,
  onOpenVoiceModal,
  onShowToast,
  onIntakeCompleted,
  onOpenDemoRunner
}) => {
  const [isIntakeExpanded, setIsIntakeExpanded] = useState(true);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <WelcomeBanner
        profile={profile}
        onRouteChange={onRouteChange}
        onOpenVoiceModal={onOpenVoiceModal}
      />

      {/* Track 3 CITY-02 Feature Showcase & 1-Click Interactive Demo Card */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-lg border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm">CODEKSHETRA 2026 • Track 3: CITY-02</Badge>
              <span className="text-xs text-amber-300 font-mono">Personal Civic Agent</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <span>Every Citizen Gets an Autonomous Civic Agent</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              From an unclear need in Hindi/Marathi to scheme evaluation, document OCR, government portal automation, and proactive voice escalation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenDemoRunner && (
              <Button
                variant="saffron"
                size="md"
                onClick={onOpenDemoRunner}
                iconLeft={<Sparkles className="w-4 h-4 text-amber-900" />}
                className="font-bold shadow-md cursor-pointer"
              >
                Launch 12-Step Live Demo
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsIntakeExpanded(!isIntakeExpanded)}
              iconRight={isIntakeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white border-slate-700 cursor-pointer"
            >
              {isIntakeExpanded ? 'Hide Intake Agent' : 'Open Guided Intake'}
            </Button>
          </div>
        </div>

        {/* Guided Intake Workflow embedded directly */}
        {isIntakeExpanded && (
          <div className="mt-5 pt-5 border-t border-slate-700/80 bg-white/5 rounded-2xl p-4 sm:p-5 text-slate-900">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <CitizenIntakeWorkflow
                onIntakeCompleted={(data) => {
                  onIntakeCompleted?.(data);
                  onRouteChange('schemes');
                }}
                onShowToast={onShowToast}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 2. Discover Government Schemes Card */}
        <div className="h-full">
          <SchemeDiscoveryCard
            schemes={schemes}
            onRouteChange={onRouteChange}
            onShowToast={onShowToast}
          />
        </div>

        {/* 3. My Applications Card */}
        <div className="h-full">
          <ApplicationsCard
            applications={applications}
            onRouteChange={onRouteChange}
            onShowToast={onShowToast}
          />
        </div>

        {/* 4. Document Assistant Card */}
        <div className="h-full">
          <DocumentAssistantCard
            onRouteChange={onRouteChange}
            onShowToast={onShowToast}
          />
        </div>

        {/* 5. Find Assistance Centres Card */}
        <div className="h-full">
          <AssistanceCentresCard
            centres={centres}
            onRouteChange={onRouteChange}
            onShowToast={onShowToast}
          />
        </div>
      </div>

      {/* 6. Recent Activity Section */}
      <div>
        <RecentActivity
          activities={activities}
          onShowToast={onShowToast}
        />
      </div>

      {/* 7. Privacy and Consent Information Section */}
      <div>
        <PrivacyConsentSection
          onShowToast={onShowToast}
        />
      </div>
    </div>
  );
};
