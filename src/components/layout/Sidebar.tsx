import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  FileCheck2, 
  Layers3, 
  MapPin, 
  UserCheck, 
  Bot, 
  ChevronRight, 
  Home, 
  X, 
  ExternalLink, 
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut
} from 'lucide-react';
import type { PageRoute, CitizenProfile } from '../../types';
import { BrandLogo } from './BrandLogo';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  currentRoute: PageRoute;
  onRouteChange: (route: PageRoute) => void;
  isOpen: boolean;
  onClose: () => void;
  onToggleAssistant: () => void;
  isAssistantOpen: boolean;
  profile: CitizenProfile;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  isOpen,
  onClose,
  onToggleAssistant,
  isAssistantOpen,
  profile: fallbackProfile,
  onOpenAuthModal
}) => {
  const { t } = useTranslation();
  const { user, profile: authProfile, isAuthenticated, isAdmin, signOut } = useAuth();

  const activeProfile = authProfile || fallbackProfile;
  const displayName = authProfile?.name || user?.user_metadata?.name || (isAuthenticated && user?.email ? user.email.split('@')[0] : t('nav.guest'));

  const navItems: { route: PageRoute; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      route: 'dashboard',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      route: 'schemes',
      label: t('nav.schemes'),
      icon: <Compass className="w-5 h-5" />,
      badge: '2,500+'
    },
    {
      route: 'documents',
      label: t('nav.documents'),
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: 'Smart OCR'
    },
    {
      route: 'applications',
      label: t('nav.applications'),
      icon: <Layers3 className="w-5 h-5" />,
      badge: '3 Active'
    },
    {
      route: 'centres',
      label: t('nav.centres'),
      icon: <MapPin className="w-5 h-5" />,
      badge: 'Nearby'
    },
    {
      route: 'profile',
      label: t('nav.profile'),
      icon: <UserCheck className="w-5 h-5" />
    }
  ];

  if (isAdmin) {
    navItems.push({
      route: 'admin',
      label: t('nav.admin'),
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      badge: 'Admin'
    });
  }

  const handleNavClick = (route: PageRoute) => {
    onRouteChange(route);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Citizen Navigation Sidebar"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <BrandLogo size="sm" variant="light" />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Public Home Link */}
          <button
            type="button"
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all mb-3 text-slate-300 hover:bg-slate-800/80 hover:text-white cursor-pointer ${
              currentRoute === 'landing' ? 'bg-slate-800 text-white font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-amber-500" />
              <span>{t('nav.home')}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('nav.citizenServices')}
          </div>

          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-800 to-slate-800/90 text-white shadow-sm border-l-4 border-l-amber-500 pl-3'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-amber-500" />}
                </div>
              </button>
            );
          })}

          {/* AI Assistant Quick Toggle Button */}
          <div className="pt-4 px-1">
            <button
              type="button"
              onClick={onToggleAssistant}
              className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                isAssistantOpen 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-sm'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    {t('assistant.title')}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isAssistantOpen ? 'Active' : t('nav.activeAssistant')}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Profile Summary Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div 
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-emerald-600 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate">{displayName}</span>
                <span title="Verified Citizen">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {isAdmin ? 'Administrator' : isAuthenticated ? `${activeProfile.district}, ${activeProfile.state}` : 'National Portal'}
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal('login');
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav.login')} / {t('nav.register')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                onClose();
                onRouteChange('landing');
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-900/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>{t('nav.signOut')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

