import React, { useState, useEffect, useRef } from 'react';
import { 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCw,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot_password';
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  onOpenSetupModal: () => void;
}

export type AuthViewMode = 
  | 'login'               // Email OTP login (primary)
  | 'login_password'      // Password login fallback
  | 'verify_login_otp'    // 6-digit OTP verification for login
  | 'register'            // Citizen registration form
  | 'verify_signup_otp'   // 6-digit OTP verification for signup
  | 'forgot_password';    // Password recovery

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onShowToast,
  onOpenSetupModal
}) => {
  const { t } = useTranslation();
  const { 
    signIn, 
    signUp, 
    sendLoginOtp, 
    verifyLoginOtp, 
    resendLoginOtp, 
    verifySignupOtp, 
    resendSignupOtp, 
    resetPassword, 
    isConfigured 
  } = useAuth();
  
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Synchronize state when initialMode changes
  if (initialMode !== prevInitialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
    setErrorMessage(null);
    setInfoNotice(null);
    setOtpDigits(['', '', '', '', '', '']);
  }

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Auto focus first OTP input when entering an OTP verification screen
  useEffect(() => {
    if (mode === 'verify_login_otp' || mode === 'verify_signup_otp') {
      const timer = setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || '';
    }
    setOtpDigits(nextDigits);

    const focusIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[focusIndex]?.focus();
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || isLoading) return;
    setErrorMessage(null);
    setInfoNotice(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'verify_signup_otp') {
        const { error } = await resendSignupOtp(cleanEmail);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setInfoNotice(t('auth.otpSentNotice'));
          setCooldown(60);
        }
      } else if (mode === 'verify_login_otp') {
        const { error } = await resendLoginOtp(cleanEmail);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setInfoNotice(t('auth.otpSentNotice'));
          setCooldown(60);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoNotice(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase credentials are not configured in .env.local. Please click "View Supabase Setup Guide" below to configure your database.'
      );
      return;
    }

    setIsLoading(true);

    try {
      // 1. Email OTP Login Dispatch
      if (mode === 'login') {
        const { error } = await sendLoginOtp(cleanEmail);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setMode('verify_login_otp');
          setOtpDigits(['', '', '', '', '', '']);
          setCooldown(60);
          setInfoNotice(t('auth.otpSentNotice'));
        }
      }

      // 2. Email OTP Login Verification
      else if (mode === 'verify_login_otp') {
        const token = otpDigits.join('').trim();
        if (token.length !== 6) {
          setErrorMessage('Please enter all 6 digits of the verification code.');
          setIsLoading(false);
          return;
        }

        const { error } = await verifyLoginOtp(cleanEmail, token);
        if (error) {
          setErrorMessage(error.message);
        } else {
          onShowToast('Authentication', t('auth.authSuccessLogin'), 'success');
          onClose();
        }
      }

      // 3. Password Login Fallback
      else if (mode === 'login_password') {
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(cleanEmail, password);
        if (error) {
          let displayMsg = error.message;
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            displayMsg = `${error.message}. Please verify your credentials or use Email OTP login.`;
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            displayMsg = `${error.message}. Please enter the 6-digit confirmation code sent to your email during registration.`;
          }
          setErrorMessage(displayMsg);
        } else {
          onShowToast('Authentication', t('auth.authSuccessLogin'), 'success');
          onClose();
        }
      }

      // 4. Registration - Dispatch Signup OTP
      else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Please enter your full citizen name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(name.trim(), cleanEmail, password);
        if (error) {
          let displayMsg = error.message;
          if (error.message.toLowerCase().includes('rate limit')) {
            displayMsg = `${error.message}. Supabase allows a limited number of emails per hour. Please wait a short while.`;
          }
          setErrorMessage(displayMsg);
        } else {
          // Immediately show OTP screen for email verification
          setMode('verify_signup_otp');
          setOtpDigits(['', '', '', '', '', '']);
          setCooldown(60);
          setInfoNotice(t('auth.otpSentNotice'));
        }
      }

      // 5. Registration - Verify Signup OTP & Auto-Create Profile
      else if (mode === 'verify_signup_otp') {
        const token = otpDigits.join('').trim();
        if (token.length !== 6) {
          setErrorMessage('Please enter all 6 digits of the confirmation code.');
          setIsLoading(false);
          return;
        }

        const { error } = await verifySignupOtp(cleanEmail, token, name.trim());
        if (error) {
          setErrorMessage(error.message);
        } else {
          onShowToast('Registration', 'Account verified and citizen profile created successfully!', 'success');
          onClose();
        }
      }

      // 6. Password Reset Recovery
      else if (mode === 'forgot_password') {
        const { error } = await resetPassword(cleanEmail);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setInfoNotice(`Password recovery email dispatched to ${cleanEmail}. Please check your inbox.`);
          setMode('login');
          onShowToast('Password Reset', t('auth.authSuccessReset'), 'info');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return t('auth.loginOtpTitle');
      case 'login_password': return t('auth.loginPasswordTitle');
      case 'verify_login_otp': return t('auth.verifyLoginOtpTitle');
      case 'register': return t('auth.registerTitle');
      case 'verify_signup_otp': return t('auth.verifySignupOtpTitle');
      case 'forgot_password': return t('auth.forgotTitle');
      default: return t('auth.loginTitle');
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return t('auth.loginOtpSubtitle');
      case 'login_password': return t('auth.loginSubtitle');
      case 'verify_login_otp': return `${t('auth.verifyOtpSubtitle')} ${email}`;
      case 'register': return t('auth.registerSubtitle');
      case 'verify_signup_otp': return `${t('auth.verifyOtpSubtitle')} ${email}`;
      case 'forgot_password': return t('auth.forgotSubtitle');
      default: return t('auth.loginSubtitle');
    }
  };

  const isOtpMode = mode === 'verify_login_otp' || mode === 'verify_signup_otp';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      description={getSubtitle()}
      maxWidth="md"
    >
      <div className="space-y-4 py-2">
        {/* Setup Pending Notification Banner if Supabase is unconfigured */}
        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Database className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('auth.setupPendingTitle')}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              {t('auth.setupPendingDesc')}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenSetupModal();
                }}
                iconRight={<ExternalLink className="w-3.5 h-3.5 text-amber-700" />}
                className="text-[11px] bg-white text-amber-950 hover:bg-amber-100/60"
              >
                {t('auth.viewSetupInstructions')}
              </Button>
            </div>
          </div>
        )}

        {/* Info / OTP Dispatched Notice */}
        {infoNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{infoNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Registration Fields */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.fullNameLabel')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Email Field (Hidden during OTP verification to keep focus on code) */}
          {!isOtpMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@gov.in or email@domain.com"
                  autoComplete="email"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Password Field (Only shown in 'register' and 'login_password') */}
          {(mode === 'register' || mode === 'login_password') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  {t('auth.passwordLabel')}
                </label>
                {mode === 'login_password' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                      setInfoNotice(null);
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
                  >
                    {t('auth.forgotPasswordPrompt')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login_password' ? 'current-password' : 'new-password'}
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* 6-Digit OTP Verification Box (Displayed for verify_login_otp and verify_signup_otp) */}
          {isOtpMode && (
            <div className="space-y-4 py-1">
              <div>
                <label className="block text-center text-xs font-semibold text-slate-700 mb-2">
                  {t('auth.otpLabel')}
                </label>
                <div 
                  className="flex items-center justify-center gap-2 sm:gap-3"
                  onPaste={handleOtpPaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputsRef.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      aria-label={`Digit ${idx + 1}`}
                      className="w-10 sm:w-12 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-slate-50 focus:bg-white text-slate-900 shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Code with 60-Second Cooldown */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'verify_signup_otp') {
                      setMode('register');
                    } else {
                      setMode('login');
                    }
                    setErrorMessage(null);
                    setInfoNotice(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('auth.changeEmailOrDetails')}</span>
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0 || isLoading}
                  onClick={handleResendCode}
                  className={`flex items-center gap-1 font-semibold ${
                    cooldown > 0 || isLoading
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-amber-700 hover:text-amber-800 cursor-pointer'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {cooldown > 0 
                      ? t('auth.resendInSeconds').replace('{seconds}', cooldown.toString()) 
                      : t('auth.resendCode')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center text-xs py-2.5 font-semibold"
              iconRight={
                isOtpMode ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                ) : mode === 'login' ? (
                  <Mail className="w-4 h-4 text-amber-400" />
                ) : mode === 'login_password' ? (
                  <LogIn className="w-4 h-4 text-amber-400" />
                ) : mode === 'register' ? (
                  <UserPlus className="w-4 h-4 text-amber-400" />
                ) : (
                  <KeyRound className="w-4 h-4 text-amber-400" />
                )
              }
              disabled={isLoading}
            >
              {isLoading ? (
                'Processing...'
              ) : mode === 'login' ? (
                t('auth.sendOtpButton')
              ) : mode === 'verify_login_otp' ? (
                t('auth.verifyOtpButton')
              ) : mode === 'login_password' ? (
                t('auth.loginButton')
              ) : mode === 'register' ? (
                t('auth.registerButton')
              ) : mode === 'verify_signup_otp' ? (
                t('auth.verifySignupButton')
              ) : (
                t('auth.resetButton')
              )}
            </Button>
          </div>
        </form>

        {/* Alternate login toggle (OTP vs Password) */}
        {mode === 'login' && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setMode('login_password');
                setErrorMessage(null);
                setInfoNotice(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer underline underline-offset-2"
            >
              {t('auth.signInWithPasswordOption')}
            </button>
          </div>
        )}

        {mode === 'login_password' && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setInfoNotice(null);
              }}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline underline-offset-2"
            >
              {t('auth.signInWithOtpOption')}
            </button>
          </div>
        )}

        {/* Mode Toggle Switchers */}
        <div className="pt-2 border-t border-slate-200 flex flex-col items-center gap-2 text-xs text-slate-600">
          {(mode === 'login' || mode === 'login_password') && (
            <div className="flex items-center gap-1.5">
              <span>{t('auth.noAccountPrompt')}</span>
              <button
                type="button"
                onClick={() => { 
                  setMode('register'); 
                  setErrorMessage(null); 
                  setInfoNotice(null); 
                }}
                className="text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
              >
                {t('auth.registerButton')}
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="flex items-center gap-1.5">
              <span>{t('auth.hasAccountPrompt')}</span>
              <button
                type="button"
                onClick={() => { 
                  setMode('login'); 
                  setErrorMessage(null); 
                  setInfoNotice(null); 
                }}
                className="text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
              >
                {t('auth.loginButton')}
              </button>
            </div>
          )}

          {mode === 'forgot_password' && (
            <button
              type="button"
              onClick={() => { 
                setMode('login'); 
                setErrorMessage(null); 
                setInfoNotice(null); 
              }}
              className="text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
            >
              ← {t('auth.backToLogin')}
            </button>
          )}

          {/* Continue as Guest option */}
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors pt-1 cursor-pointer flex items-center gap-1"
          >
            <span>{t('auth.guestContinue')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
