import React, { useState } from 'react';
import { 
  Menu, 
  Mic, 
  Bot, 
  ArrowRight,
  User,
  LogOut,
  ShieldAlert,
  LogIn,
  Sparkles
} from 'lucide-react';
import type { PageRoute } from '../../types';
import { BrandLogo } from './BrandLogo';
import { Button } from '../common/Button';
import { LanguageSelector } from '../common/LanguageSelector';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export interface HeaderProps {
  currentRoute: PageRoute;
  onRouteChange: (route: PageRoute) => void;
  onOpenSidebar: () => void;
  onOpenVoiceModal: () => void;
  onToggleAssistant: () => void;
  isAssistantOpen: boolean;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenDemoRunner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onRouteChange,
  onOpenSidebar,
  onOpenVoiceModal,
  onToggleAssistant,
  isAssistantOpen,
  onShowToast,
  onOpenAuthModal,
  onOpenDemoRunner
}) => {
  const { t } = useTranslation();
  const { user, profile, isAuthenticated, isAdmin, signOut } = useAuth();
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleFontSizeCycle = () => {
    if (fontSize === 'normal') {
      setFontSize('large');
      document.documentElement.style.fontSize = '17px';
      onShowToast('Accessibility', 'Text size set to Large (A+)', 'info');
    } else if (fontSize === 'large') {
      setFontSize('larger');
      document.documentElement.style.fontSize = '18.5px';
      onShowToast('Accessibility', 'Text size set to Extra Large (A++)', 'info');
    } else {
      setFontSize('normal');
      document.documentElement.style.fontSize = '16px';
      onShowToast('Accessibility', 'Text size reset to Standard', 'info');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    onShowToast('Authentication', 'Signed out successfully.', 'info');
    onRouteChange('landing');
  };

  const isPublicPage = currentRoute === 'landing';
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || t('nav.guest');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger (for internal pages) + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isPublicPage && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => onRouteChange('landing')} 
            className="cursor-pointer transition-opacity hover:opacity-90"
            title="Go to JANSAATHI AI Home"
          >
            <BrandLogo size="md" variant="dark" />
          </div>
        </div>

        {/* Center / Navigation Links for Landing Page */}
        {isPublicPage && (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              type="button" 
              onClick={() => onRouteChange('dashboard')} 
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {t('nav.dashboard')}
            </button>
            <button 
              type="button" 
              onClick={() => onRouteChange('schemes')} 
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {t('nav.schemes')}
            </button>
            <button 
              type="button" 
              onClick={() => onRouteChange('documents')} 
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {t('nav.documents')}
            </button>
            <button 
              type="button" 
              onClick={() => onRouteChange('centres')} 
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {t('nav.centres')}
            </button>
            {isAdmin && (
              <button 
                type="button" 
                onClick={() => onRouteChange('admin')} 
                className="text-amber-700 hover:text-amber-800 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                {t('nav.admin')}
              </button>
            )}
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Track 3 CITY-02 1-Click Interactive Demo Button */}
          {onOpenDemoRunner && (
            <button
              type="button"
              onClick={onOpenDemoRunner}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/80 text-amber-900 text-xs font-bold transition-all shadow-2xs hover:shadow-sm cursor-pointer shrink-0"
              title="Launch Track 3: CITY-02 End-to-End Agent Walkthrough"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span className="hidden sm:inline">CITY-02 Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}

          {/* Visible Language Selector with Hindi, English, and Marathi */}
          <LanguageSelector
            onLanguageChangeNotification={(lang) => {
              const label = lang === 'Hindi' ? 'हिंदी (Hindi)' : lang === 'Marathi' ? 'मराठी (Marathi)' : 'English';
              onShowToast('Language Changed', `Interface switched to ${label}`, 'info');
            }}
          />

          {/* Accessibility Font Size Toggle */}
          <button
            type="button"
            onClick={handleFontSizeCycle}
            title="Adjust text size for readability"
            className="hidden md:inline-flex items-center justify-center h-8.5 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            A{fontSize === 'large' ? '+' : fontSize === 'larger' ? '++' : ''}
          </button>

          {/* Voice Assistant Button */}
          <Button
            variant="saffron"
            size="sm"
            onClick={onOpenVoiceModal}
            iconLeft={<Mic className="w-3.5 h-3.5 animate-pulse" />}
            className="shadow-xs shrink-0 py-1.5 sm:py-2"
          >
            <span className="hidden sm:inline">{t('nav.voiceAssistant')}</span>
            <span className="sm:hidden">{t('nav.voiceAssistant').split(' ')[0]}</span>
          </Button>

          {/* AI Assistant Toggle Button */}
          <button
            type="button"
            onClick={onToggleAssistant}
            aria-label="Toggle AI Assistant Panel"
            title={t('assistant.title')}
            className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isAssistantOpen
                ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <Bot className="w-4.5 h-4.5" />
          </button>

          {/* User Authentication Menu / Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                aria-label="Open User Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{displayName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isAdmin ? 'Admin' : t('auth.authenticatedWelcome')}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onRouteChange('profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>{t('nav.profile')}</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onRouteChange('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-amber-900 font-semibold hover:bg-amber-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>{t('nav.admin')}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{t('nav.signOut')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAuthModal('login')}
              iconLeft={<LogIn className="w-3.5 h-3.5 text-slate-700" />}
              className="text-xs font-semibold py-1.5"
            >
              {t('nav.login')}
            </Button>
          )}

          {/* If on Landing Page: Get Started Button that opens the Citizen Dashboard */}
          {isPublicPage && !isAuthenticated && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenAuthModal('register')}
              iconRight={<ArrowRight className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />}
              className="shrink-0 font-semibold"
            >
              {t('nav.register')}
            </Button>
          )}

          {isPublicPage && isAuthenticated && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onRouteChange('dashboard')}
              iconRight={<ArrowRight className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />}
              className="shrink-0 font-semibold"
            >
              {t('nav.dashboard')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
