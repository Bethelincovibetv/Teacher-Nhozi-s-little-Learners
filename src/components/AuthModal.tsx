import React, { useState } from 'react';
import {
  X,
  BookOpen,
  User,
  ShieldCheck,
  Heart,
  Coins,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  googleSignIn,
  registerWithEmailPassword,
  loginWithEmailPassword,
} from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
  initialMode?: 'signin' | 'register';
}

const AGE_GRADE_OPTIONS = [
  '3–4 yrs (Nursery / EYFS)',
  '5–6 yrs (Reception / Kindergarten)',
  '7–8 yrs (Grade 1–2 / Primary)',
  '9–12 yrs (Upper Primary)',
];

const LEARNING_FOCUS_OPTIONS = [
  'Phonics & Sound Blending',
  'Early Reading & Sight Words',
  'Vocabulary & Spelling Mastery',
  'Comprehension & Creative Writing',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  // Registration Form State
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('5–6 yrs (Reception / Kindergarten)');
  const [phone, setPhone] = useState('');
  const [learningFocus, setLearningFocus] = useState('Phonics & Sound Blending');

  // Sign In State
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!parentName.trim()) {
      setError('Please enter the Parent or Guardian full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid parent email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please choose a secure password with at least 6 characters.');
      return;
    }
    if (!childName.trim()) {
      setError("Please enter the child's (learner's) name.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerWithEmailPassword({
        parentName: parentName.trim(),
        email: email.trim(),
        password,
        childName: childName.trim(),
        childAge,
        phone: phone.trim(),
        learningFocus,
      });

      setSuccessMsg('Account registered successfully! Welcome bonus +60 Credits activated.');
      setTimeout(() => {
        onAuthSuccess(res.profile);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signinEmail.trim()) {
      setError('Please enter your account email.');
      return;
    }
    if (!signinPassword) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmailPassword(signinEmail.trim(), signinPassword);
      onAuthSuccess(res.profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await googleSignIn({
        parentName: parentName.trim() || undefined,
        childName: childName.trim() || undefined,
        childAge: childAge || undefined,
        phone: phone.trim() || undefined,
        learningFocus: learningFocus || undefined,
      });
      if (res?.profile) {
        onAuthSuccess(res.profile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-auto max-h-[94vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#0F1E36] flex items-center justify-center text-white shadow-xs shrink-0">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#0F1E36]">
              Teachers Ngozi <span className="text-[#1A5336]">Little Learners</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Family & Learner Account Access</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-xl my-3 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#0F1E36] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Parent & Learner Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-[#0F1E36] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In / Portal
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {mode === 'register' ? (
            <div>
              {/* Welcome Badge Banner */}
              <div className="p-3 bg-[#E6F4EC] border border-[#1A5336]/25 rounded-2xl flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#1A5336] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#1A5336] flex items-center gap-1.5">
                    <span>Instant +60 Real Welcome Credits</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </p>
                  <p className="text-slate-600 text-[11px] leading-tight mt-0.5">
                    Your child's credit wallet will be created immediately with real credits for games and drills.
                  </p>
                </div>
              </div>

              {/* 1-Click Google Option */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-60 mb-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9c-.2-.7-.4-1.4-.4-2.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Fast Sign Up with Google</span>
              </button>

              <div className="flex items-center gap-3 my-3 text-slate-400 text-[11px]">
                <div className="flex-1 h-px bg-stone-200" />
                <span>or register with email & details</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Full Registration Form */}
              <form onSubmit={handleRegisterWithEmail} className="space-y-3">
                {/* Parent Information Group */}
                <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/80 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#1A5336] uppercase tracking-wider block">
                    1. Parent / Guardian Details
                  </span>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Parent / Guardian Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mrs. Chioma Okonkwo / David Smith"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="parent@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Password (6+ chars) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Create password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      WhatsApp / Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="e.g. +234 803 123 4567 or +44 7123 456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Child / Learner Details Group */}
                <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/80 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#1A5336] uppercase tracking-wider block">
                    2. Child (Learner) Profile
                  </span>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Child's Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chidera / Liam / Olivia"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Child's Age Group / Class
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {AGE_GRADE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setChildAge(opt)}
                          className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg text-left transition-all border cursor-pointer ${
                            childAge === opt
                              ? 'bg-[#1A5336] text-white border-[#1A5336]'
                              : 'bg-white text-slate-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Primary Learning Goal
                    </label>
                    <select
                      value={learningFocus}
                      onChange={(e) => setLearningFocus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336]"
                    >
                      {LEARNING_FOCUS_OPTIONS.map((goal) => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#0F1E36] hover:bg-[#172D52] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account & Live Wallet...
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Complete Registration & Claim +60 Credits</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in to manage your child's learning wallet, track phonics mastery badges, book one-on-one sessions, or open the Educator Administration Console.
              </p>

              {/* 1-Click Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9c-.2-.7-.4-1.4-.4-2.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2 text-slate-400 text-[11px]">
                <div className="flex-1 h-px bg-stone-200" />
                <span>or with your account email</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Email & Password Sign-in Form */}
              <form onSubmit={handleSignInWithEmail} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showSigninPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword(!showSigninPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSigninPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#0F1E36] hover:bg-[#172D52] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Learning Portal</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer Assurance */}
        <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1A5336]" />
            <span>Encrypted & Private</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Child-Safe Learning Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
