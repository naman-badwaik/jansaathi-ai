import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  Building2, 
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Bot,
  Calendar,
  FileCheck2
} from 'lucide-react';
import type { SchemeItem, SchemeCategory, PageRoute, VerifiedScheme, CitizenIntakeData, EligibilityGrade } from '../types';
import { Card, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useTranslation } from '../context/LanguageContext';
import { VERIFIED_SCHEMES_DB, evaluateSchemeEligibility } from '../services/schemeKnowledgeBase';

export interface DiscoverSchemesPageProps {
  schemes: SchemeItem[];
  intakeData?: CitizenIntakeData;
  onRouteChange: (route: PageRoute) => void;
  onOpenApplicationAgent?: (scheme?: VerifiedScheme) => void;
  onSelectSchemeForDocuments?: (scheme: VerifiedScheme) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const DiscoverSchemesPage: React.FC<DiscoverSchemesPageProps> = ({
  schemes: _fallbackSchemes,
  intakeData,
  onRouteChange,
  onOpenApplicationAgent,
  onSelectSchemeForDocuments,
  onShowToast
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory>('All');
  const [selectedStateFilter, setSelectedStateFilter] = useState<'All' | 'Maharashtra' | 'Central'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected scheme for detailed eligibility modal
  const [inspectingScheme, setInspectingScheme] = useState<VerifiedScheme | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<{ grade: EligibilityGrade; reasoning: string } | null>(null);

  const categories: SchemeCategory[] = [
    'All',
    'Housing',
    'Healthcare',
    'Agriculture',
    'Social Welfare',
    'Women & Child',
    'Skill & Employment'
  ];

  const getCategoryLabel = (cat: SchemeCategory): string => {
    switch (cat) {
      case 'All': return t('categories.All');
      case 'Agriculture': return t('categories.Agriculture');
      case 'Healthcare': return t('categories.Healthcare');
      case 'Housing': return t('categories.Housing');
      case 'Social Welfare': return t('categories.SocialWelfare');
      case 'Women & Child': return t('categories.WomenChild');
      case 'Skill & Employment': return t('categories.SkillEmployment');
      default: return cat;
    }
  };

  const filteredSchemes = VERIFIED_SCHEMES_DB.filter(scheme => {
    const matchesCat = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesState = selectedStateFilter === 'All' || scheme.state === selectedStateFilter;
    const matchesSearch = searchQuery === '' || 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesState && matchesSearch;
  });

  const handleInspectScheme = (scheme: VerifiedScheme) => {
    const result = evaluateSchemeEligibility(scheme, intakeData || {
      citizenAge: 60,
      state: 'Maharashtra',
      district: 'Pune',
      housingStatus: 'Kutcha House',
      annualIncome: 48000
    });
    setInspectingScheme(scheme);
    setEvaluationResult(result);
  };

  const handleApplyClick = (scheme: VerifiedScheme) => {
    if (onOpenApplicationAgent) {
      onOpenApplicationAgent(scheme);
    } else {
      onShowToast(scheme.title, 'Launching portal browser automation...', 'info');
    }
  };

  const getGradeBadge = (grade: EligibilityGrade) => {
    switch (grade) {
      case 'Eligible':
        return <Badge variant="green" size="sm">✓ Eligible</Badge>;
      case 'Likely Eligible':
        return <Badge variant="green" size="sm">★ Likely Eligible</Badge>;
      case 'More Information Needed':
        return <Badge variant="amber" size="sm">ℹ More Info Needed</Badge>;
      case 'Not Eligible':
        return <Badge variant="red" size="sm">✕ Not Eligible</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="amber" size="sm" icon={<Compass className="w-3.5 h-3.5 text-amber-400" />}>
              CITY-02 Verified Repository
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Official Central & Maharashtra Welfare Schemes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Grounded in official .gov.in and maharashtra.gov.in directives. Never hallucinates criteria, guarantees eligibility, or displays fake government links.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRouteChange('dashboard')}
            iconLeft={<ArrowLeft className="w-4 h-4" />}
          >
            {t('common.back')}
          </Button>
        </div>
      </div>

      {/* Active Citizen Profile Banner from Guided Intake */}
      {intakeData && (
        <div className="p-4 bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="space-y-0.5 text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm">Active Citizen Profile Loaded</Badge>
              <span className="font-bold text-slate-900">{intakeData.needCategory}</span>
            </div>
            <p className="text-slate-600">
              Age: <strong className="text-slate-900">{intakeData.citizenAge || 60} Years</strong> • Location: <strong className="text-slate-900">{intakeData.district}, {intakeData.state} ({intakeData.areaType})</strong> • Shelter: <strong className="text-slate-900">{intakeData.housingStatus || 'Kutcha'}</strong> • Income: <strong className="text-slate-900">₹{intakeData.annualIncome?.toLocaleString() || '48,000'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
              Dynamic Eligibility Active
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scheme name, subsidy, or department..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>

          {/* State Jurisdiction Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-slate-500 mr-1">Jurisdiction:</span>
            {(['All', 'Maharashtra', 'Central'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStateFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedStateFilter === s
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 mt-3 pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </Card>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchemes.map((scheme) => {
          const evalResult = evaluateSchemeEligibility(scheme, intakeData || {});
          return (
          <Card key={scheme.id} className="border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <CardBody className="p-5 space-y-4">
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={scheme.state === 'Maharashtra' ? 'amber' : 'blue'} size="sm">
                      {scheme.state}
                    </Badge>
                    <Badge variant="slate" size="sm">
                      {scheme.category}
                    </Badge>
                    {getGradeBadge(evalResult.grade)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug mt-1">
                    {scheme.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{scheme.department}</span>
                  </p>
                </div>

                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>

              {/* Benefit Highlight Box */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Assistance / Benefit</p>
                <p className="text-xs font-semibold text-slate-900 leading-relaxed">{scheme.benefit}</p>
              </div>

              {/* Eligibility Preview */}
              <div className="space-y-1 text-xs text-slate-600">
                <p className="font-bold text-slate-800 text-[11px]">Key Eligibility Criteria:</p>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600">
                  {scheme.eligibilityCriteria.slice(0, 2).map((crit, idx) => (
                    <li key={idx} className="leading-relaxed">{crit}</li>
                  ))}
                </ul>
              </div>

              {/* Source & Last Verification Info */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Verified: {scheme.lastVerifiedDate}</span>
                </span>
                <a 
                  href={scheme.officialSourceUrl.split(' ')[0]} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 underline"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </CardBody>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInspectScheme(scheme)}
                >
                  Check Eligibility
                </Button>

                {onSelectSchemeForDocuments && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectSchemeForDocuments(scheme)}
                    iconLeft={<FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />}
                    className="text-xs"
                  >
                    Required Docs ({scheme.requiredDocuments.length})
                  </Button>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApplyClick(scheme)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                <Bot className="w-3.5 h-3.5 mr-1 text-amber-400" />
                <span>Apply via Agent</span>
              </Button>
            </div>
          </Card>
        );
        })}
      </div>

      {/* Scheme Eligibility Evaluation Modal */}
      {inspectingScheme && evaluationResult && (
        <Modal
          isOpen={!!inspectingScheme}
          onClose={() => setInspectingScheme(null)}
          title={`Eligibility Assessment: ${inspectingScheme.title}`}
          description={`Verified criteria assessment based on citizen demographic inputs.`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Grade Outcome Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Assessed Classification</span>
                <div className="pt-0.5">
                  {getGradeBadge(evaluationResult.grade)}
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 font-mono">
                <span>Verified: {inspectingScheme.lastVerifiedDate}</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Rule Evaluation</span>
              </p>
              <p className="leading-relaxed text-emerald-900">{evaluationResult.reasoning}</p>
            </div>

            {/* Required Documents Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Required Verification Documents
              </h4>
              <div className="space-y-1.5">
                {inspectingScheme.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-800">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Source Link */}
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700 flex items-center justify-between">
              <span>Official Government Source Portal:</span>
              <a 
                href={inspectingScheme.officialSourceUrl.split(' ')[0]}
                target="_blank" 
                rel="noreferrer"
                className="text-amber-800 font-bold flex items-center gap-1 hover:underline"
              >
                <span>{inspectingScheme.officialSourceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setInspectingScheme(null)}>
                Close
              </Button>

              <div className="flex items-center gap-2">
                {onSelectSchemeForDocuments && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const s = inspectingScheme;
                      setInspectingScheme(null);
                      onSelectSchemeForDocuments(s);
                    }}
                    className="border-emerald-500 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    <span>Verify Required Documents</span>
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const s = inspectingScheme;
                    setInspectingScheme(null);
                    handleApplyClick(s);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  <Bot className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  <span>Proceed to Portal Automation</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
