import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { SchemeItem, SchemeCategory, PageRoute } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface SchemeDiscoveryCardProps {
  schemes: SchemeItem[];
  onRouteChange: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const SchemeDiscoveryCard: React.FC<SchemeDiscoveryCardProps> = ({
  schemes,
  onRouteChange,
  onShowToast
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: SchemeCategory[] = [
    'All',
    'Agriculture',
    'Healthcare',
    'Housing',
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

  const filteredSchemes = schemes.filter(scheme => {
    const matchesCat = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.benefit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }).slice(0, 3);

  const handleSchemeClick = (scheme: SchemeItem) => {
    onShowToast(
      scheme.title,
      '[Demo Placeholder] Live eligibility verification engine will compute personalized match percentage in Phase 2.',
      'info'
    );
  };

  return (
    <Card accent="saffron" className="h-full flex flex-col justify-between">
      <div>
        <CardHeader
          title={t('dashboard.schemesCardTitle')}
          subtitle={t('dashboard.schemesCardSubtitle')}
          icon={<Compass className="w-5 h-5 text-amber-600" />}
          action={
            <Badge variant="saffron" size="sm" icon={<Sparkles className="w-3 h-3 text-amber-600" />}>
              {t('dashboard.demoTag')}
            </Badge>
          }
        />

        <CardBody className="space-y-4">
          {/* Search Input Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('dashboard.searchSchemesPlaceholder')}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Scheme Items List */}
          <div className="space-y-2.5">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => handleSchemeClick(scheme)}
                className="p-3 rounded-xl border border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {scheme.ministry}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors truncate">
                      {scheme.title}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5 line-clamp-1">
                      {t('dashboard.benefitLabel')}: {scheme.benefit}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <Badge variant="slate" size="sm">
                    {getCategoryLabel(scheme.category)}
                  </Badge>
                  {scheme.tags.slice(0, 2).map((tagItem, idx) => (
                    <span key={idx} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {tagItem}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </div>

      <CardFooter>
        <span className="text-slate-500 text-[11px]">Demo preview • Live Scheme API in Phase 2</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRouteChange('schemes')}
          iconRight={<ChevronRight className="w-4 h-4" />}
          className="text-xs text-slate-900 hover:text-amber-600 cursor-pointer"
        >
          {t('dashboard.viewAllSchemes')}
        </Button>
      </CardFooter>
    </Card>
  );
};
