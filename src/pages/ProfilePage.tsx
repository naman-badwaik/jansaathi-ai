import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Edit3, 
  Lock, 
  Download,
  ArrowLeft,
  X,
  Save,
  LogIn,
  Home,
  FileCheck,
  Calendar
} from 'lucide-react';
import type { CitizenProfile, PageRoute } from '../types';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PlaceholderBanner } from '../components/common/PlaceholderBanner';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export interface ProfilePageProps {
  profile: CitizenProfile;
  onRouteChange?: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onUpdateProfile?: (updates: Partial<CitizenProfile>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  profile, 
  onRouteChange, 
  onShowToast,
  onOpenAuthModal,
  onUpdateProfile 
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, isConfigured, updateProfileData, profile: dbProfile } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    state: profile.state,
    district: profile.district,
    category: profile.category,
    occupation: profile.occupation,
    annualIncomeBracket: profile.annualIncomeBracket
  });

  const handleOpenEdit = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
      state: profile.state,
      district: profile.district,
      category: profile.category,
      occupation: profile.occupation,
      annualIncomeBracket: profile.annualIncomeBracket
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isAuthenticated && isConfigured) {
        const { error } = await updateProfileData({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          state: formData.state.trim(),
          district: formData.district.trim(),
          category: formData.category.trim(),
          occupation: formData.occupation.trim(),
          annual_income_bracket: formData.annualIncomeBracket.trim()
        });

        if (error) {
          onShowToast('Update Failed', error.message, 'warning');
          setIsSaving(false);
          return;
        }

        onShowToast('Profile Updated', 'Your profile details have been securely synchronized with your database record.', 'success');
      } else {
        onShowToast('Session Profile Updated', 'Profile updated for your current session. Sign in to save across devices.', 'info');
      }

      onUpdateProfile?.({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        category: formData.category.trim(),
        occupation: formData.occupation.trim(),
        annualIncomeBracket: formData.annualIncomeBracket.trim()
      });

      setIsEditModalOpen(false);
    } catch (err: any) {
      onShowToast('Error', err.message || 'Could not update profile', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      profile: {
        ...profile,
        authEmail: user?.email ?? 'guest@local',
        exportedAt: new Date().toISOString(),
        dpdpCompliance: 'Digital Personal Data Protection Act, 2023'
      }
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jansaathi_citizen_profile_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onShowToast('Data Exported', 'Your profile data copy has been downloaded in JSON format.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="green" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}>
                {t('profilePage.badge')}
              </Badge>
              {isAuthenticated && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Supabase Verified Account
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {isAuthenticated && user?.email ? `${user.email} • ` : ''}
              {t('profilePage.verifiedProfile')} • {profile.district}, {profile.state}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRouteChange && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRouteChange('dashboard')}
                iconLeft={<ArrowLeft className="w-4 h-4" />}
              >
                {t('common.backToDashboard')}
              </Button>
            )}
            <Button
              variant="saffron"
              size="sm"
              onClick={handleOpenEdit}
              iconLeft={<Edit3 className="w-4 h-4" />}
            >
              {t('profilePage.updateProfile')}
            </Button>
          </div>
        </div>
      </div>

      <PlaceholderBanner
        title="Citizen Profile Security"
        description="Profile data is encrypted and protected by Supabase Row-Level Security (RLS). Aadhaar-based OTP re-verification and DigiLocker profile pulls will be enabled in future stages."
        variant="compact"
      />

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Card */}
        <Card accent="green">
          <CardHeader
            title={t('profilePage.identityTrustTitle')}
            subtitle={t('profilePage.identityTrustSubtitle')}
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          />
          <CardBody className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">UIDAI Aadhaar Verified</h4>
                  <p className="text-[10px] text-slate-500">Biometric & Demographic seeded (Demo)</p>
                </div>
              </div>
              <Badge variant="green" size="sm">Active</Badge>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">DigiLocker National Vault</h4>
                  <p className="text-[10px] text-slate-500">Auto-sync enabled for issued documents (Demo)</p>
                </div>
              </div>
              <Badge variant="green" size="sm">Linked</Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">NPCI Direct Benefit Transfer (DBT)</h4>
                  <p className="text-[10px] text-slate-500">Primary bank account linked (Demo)</p>
                </div>
              </div>
              <Badge variant="blue" size="sm">Verified</Badge>
            </div>
          </CardBody>
        </Card>

        {/* Socio-Economic Profile Card */}
        <Card accent="navy">
          <CardHeader
            title={t('profilePage.socioEconomicTitle')}
            subtitle={t('profilePage.socioEconomicSubtitle')}
            icon={<Briefcase className="w-5 h-5 text-slate-900" />}
          />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {t('profilePage.occupationLabel')}
              </span>
              <span className="font-semibold text-slate-900">{profile.occupation}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> {t('profilePage.incomeLabel')}
              </span>
              <span className="font-semibold text-slate-900 font-mono">{profile.annualIncomeBracket}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t('profilePage.locationLabel')}
              </span>
              <span className="font-semibold text-slate-900">{profile.district}, {profile.state}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" /> {t('profilePage.categoryLabel')}
              </span>
              <span className="font-semibold text-slate-900">{profile.category}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {t('profilePage.phoneLabel')}
              </span>
              <span className="font-semibold text-slate-900 font-mono">{profile.phone}</span>
            </div>
          </CardBody>
        </Card>

        {/* Step 4 Reusable Application Memory & Provenance */}
        <Card accent="green" className="md:col-span-2">
          <CardHeader
            title="Persistent Citizen Application Memory & Provenance"
            subtitle="Cross-scheme application memory with cryptographic verification provenance"
            icon={<FileCheck className="w-5 h-5 text-emerald-600" />}
          />
          <CardBody className="space-y-4">
            <p className="text-xs text-slate-600">
              JANSAATHI AI stores verified citizen parameters in your private authenticated profile. These verified values are reused across welfare scheme applications to prevent redundant data entry. Discrepancies between conversational statements and verified documents are automatically detected and flagged for citizen resolution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Age / DOB */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Applicant Age</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Verified Doc</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{dbProfile?.age ?? 60} Years</div>
                <div className="text-[10px] text-slate-400">Source: Aadhaar Card (e-KYC verified)</div>
              </div>

              {/* Annual Household Income */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Annual Income</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Verified Doc</span>
                </div>
                <div className="text-sm font-bold text-emerald-700 font-mono">₹{Number(dbProfile?.annual_income ?? 48000).toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">Source: Tehsildar Income Certificate 2026</div>
              </div>

              {/* Housing Condition */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-slate-400" /> Housing Condition</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Land Survey</span>
                </div>
                <div className="text-sm font-bold text-amber-900">{dbProfile?.housing_status || 'Kutcha House'}</div>
                <div className="text-[10px] text-slate-400">Source: Land Record 7/12 & Gram Panchayat</div>
              </div>

              {/* Taluka & Village */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Village / Taluka</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Profile</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{dbProfile?.village || 'Wadebolhai'}, Taluka {dbProfile?.taluka || 'Haveli'}</div>
                <div className="text-[10px] text-slate-400">District: {dbProfile?.district || 'Pune'}</div>
              </div>

              {/* Land Holding */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Land Holding</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Profile</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{dbProfile?.land_holding_acres ?? 0.5} Acres (Small / Marginal)</div>
                <div className="text-[10px] text-slate-400">Eligible for PM-KISAN & PMAY-G</div>
              </div>

              {/* Memory Integrity */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Data Integrity</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">Active</span>
                </div>
                <div className="text-xs text-emerald-900 leading-snug">Zero Silent Overwrite Guardrail Enabled</div>
                <div className="text-[10px] text-emerald-700">Conversational conflicts prompt for citizen resolution</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Citizen Privacy & Security Section */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              {t('profilePage.dataGuaranteeTitle')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {t('profilePage.dataGuaranteeDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isAuthenticated && onOpenAuthModal && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenAuthModal('login')}
                iconLeft={<LogIn className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {t('nav.login')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              iconLeft={<Download className="w-3.5 h-3.5" />}
              className="text-xs cursor-pointer"
            >
              {t('profilePage.exportMyData')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{t('profilePage.updateProfile')}</h3>
                  <p className="text-[11px] text-slate-300">Update your citizen profile & demographic attributes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  required
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Income Bracket
                </label>
                <select
                  value={formData.annualIncomeBracket}
                  onChange={(e) => setFormData({ ...formData, annualIncomeBracket: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                  <option value="₹1 Lakh - ₹1.8 Lakh">₹1 Lakh - ₹1.8 Lakh</option>
                  <option value="₹1.8 Lakh - ₹2.5 Lakh">₹1.8 Lakh - ₹2.5 Lakh</option>
                  <option value="₹2.5 Lakh - ₹5 Lakh">₹2.5 Lakh - ₹5 Lakh</option>
                  <option value="Above ₹5 Lakh">Above ₹5 Lakh</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="saffron"
                  size="sm"
                  isLoading={isSaving}
                  iconLeft={<Save className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
