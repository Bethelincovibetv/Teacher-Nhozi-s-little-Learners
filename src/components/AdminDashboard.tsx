import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Send,
  MessageCircle,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  Settings,
  LogOut,
  Sparkles,
  Inbox,
  AlertCircle,
  Coins,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Gamepad2,
  Rocket,
  Shield,
  Menu,
  ChevronRight,
  RefreshCw,
  User,
  Users,
  Star,
  Activity,
  Check,
  Cpu,
  Upload,
  Volume2,
  BookOpen,
  Lock,
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db, loginWithEmailPassword, googleSignIn, logout, getAccessToken, isUserAdminEmail } from '../lib/firebase';
import { sendGmailMessage, fetchRecentEnquiries, sendBookingConfirmationEmails } from '../lib/gmail';
import { creditWallet, debitWallet, approveTopUpRequest, rejectTopUpRequest } from '../lib/wallet';
import { generateEducationalGameWithAI, GenerateGameParams } from '../lib/aiGameGenerator';
import { audioVoice } from '../lib/audioVoice';
import { compressImage } from '../lib/imageCompressor';
import { HeroSlide, BookingRecord, SiteSettings, UserWallet, CreditTransaction, EducationalGame, UserProfile, TopUpRequest } from '../types';
import { getWhatsAppUrl, WHATSAPP_CONFIG, resolveImageUrl } from '../data/content';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onAuthChange: (user: FirebaseUser | null) => void;
  currentSettings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthChange,
  currentSettings,
  onUpdateSettings,
}) => {
  // Navigation Section (Space App Nav Menu)
  const [activeMenu, setActiveMenu] = useState<'overview' | 'wallets' | 'aigames' | 'bookings' | 'slides' | 'gmail' | 'settings'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Firestore Hero Slides state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);

  // Firestore Bookings state
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  // Firestore Wallets & Users state
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [walletSearchQuery, setWalletSearchQuery] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(50);
  const [creditReason, setCreditReason] = useState<string>('Lesson Progress / Top-up Bonus');
  const [debitAmount, setDebitAmount] = useState<number>(10);
  const [debitReason, setDebitReason] = useState<string>('Game Session Adjustment');
  const [walletFeedback, setWalletFeedback] = useState<string | null>(null);

  // Top-Up Orders Verification State
  const [topUpRequests, setTopUpRequests] = useState<TopUpRequest[]>([]);
  const [walletSubView, setWalletSubView] = useState<'orders' | 'wallets'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Transactions state
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);

  // AI Game Studio State
  const [aiTopic, setAiTopic] = useState('Vowel Digraphs /oa/ and /ai/');
  const [aiCategory, setAiCategory] = useState<'Phonics' | 'Early Reading' | 'Vocabulary' | 'Comprehension'>('Phonics');
  const [aiTargetAge, setAiTargetAge] = useState('Ages 5–8');
  const [aiDifficulty, setAiDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [aiMechanic, setAiMechanic] = useState<'asteroid' | 'vowel' | 'racer' | 'riddle'>('asteroid');
  const [aiCustomInstructions, setAiCustomInstructions] = useState('');
  const [isGeneratingAiGame, setIsGeneratingAiGame] = useState(false);
  const [generatedGamePreview, setGeneratedGamePreview] = useState<EducationalGame | null>(null);
  const [publishedGames, setPublishedGames] = useState<EducationalGame[]>([]);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);

  // Gmail State
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  // Global site settings local state
  const [localWhatsapp, setLocalWhatsapp] = useState(currentSettings.whatsappNumber || WHATSAPP_CONFIG.cleanNumber);
  const [localEmail, setLocalEmail] = useState(currentSettings.supportEmail || 'contact@teachersngozilearners.com');
  const [localAnnouncement, setLocalAnnouncement] = useState(currentSettings.announcement || '');
  const [localTutorPhoto, setLocalTutorPhoto] = useState(currentSettings.tutorPhotoUrl || '');
  const [localTutorTitle, setLocalTutorTitle] = useState(currentSettings.tutorTitle || 'Certified Digital Educator & EduConsultant');
  const [localTutorBio, setLocalTutorBio] = useState(currentSettings.tutorBio || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Listen to Firestore hero_slides
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'hero_slides'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: HeroSlide[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as HeroSlide));
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setSlides(list);
          } else {
            setSlides([]);
          }
        },
        (err) => {
          console.warn('Hero slides listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Hero slides listener note:', e);
    }
  }, []);

  // Listen to Firestore bookings
  useEffect(() => {
    if (!currentUser) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'bookings'),
        (snapshot) => {
          const list: BookingRecord[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as BookingRecord));
          list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setBookings(list);
        },
        (err) => {
          console.warn('Bookings listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Bookings listener note:', e);
    }
  }, [currentUser]);

  // Listen to Firestore Wallets
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'wallets'),
        (snapshot) => {
          const list: UserWallet[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as UserWallet));
          setWallets(list);
        },
        (err) => {
          console.warn('Wallets listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Wallets listener note:', e);
    }
  }, []);

  // Listen to Firestore Users
  useEffect(() => {
    if (!currentUser) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((d) => list.push({ uid: d.id, ...d.data() } as UserProfile));
          setUsersList(list);
        },
        (err) => {
          console.warn('Users listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Users listener note:', e);
    }
  }, [currentUser]);

  // Listen to Firestore Published Games
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'games'),
        (snapshot) => {
          const list: EducationalGame[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as EducationalGame));
          setPublishedGames(list);
        },
        (err) => {
          console.warn('Games listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Games listener note:', e);
    }
  }, []);

  // Listen to Firestore Transactions
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'transactions'),
        (snapshot) => {
          const list: CreditTransaction[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as CreditTransaction));
          list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setRecentTransactions(list);
        },
        (err) => {
          console.warn('Transactions listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Transactions listener note:', e);
    }
  }, []);

  // Listen to Firestore Top-Up Orders / Requests
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'topup_requests'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: TopUpRequest[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as TopUpRequest));
            list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
            setTopUpRequests(list);
          } else {
            setTopUpRequests([]);
          }
        },
        (err) => {
          console.warn('Topup requests listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Topup requests listener note:', e);
    }
  }, []);

  // Handle Approving a Parent Top-Up Order
  const handleApproveTopUpOrder = async (order: TopUpRequest) => {
    setProcessingOrderId(order.id);
    const adminName = currentUser?.displayName || 'Teacher Ngozi (Admin)';
    const res = await approveTopUpRequest(order, adminName);
    setProcessingOrderId(null);

    if (res.success) {
      audioVoice.playFanfare();
      setWalletFeedback(`✓ Approved Order ${order.reference}! +${order.totalCredits} credits deposited to ${order.studentName}’s wallet.`);
      setTimeout(() => setWalletFeedback(null), 5000);
    } else {
      audioVoice.playErrorBuzz();
      alert(`Approval error: ${res.error || 'Failed to approve order'}`);
    }
  };

  // Handle Rejecting a Parent Top-Up Order
  const handleRejectTopUpOrder = async (order: TopUpRequest) => {
    const reason = prompt('Enter rejection note for record (optional):', 'Payment unverified');
    if (reason === null) return;

    setProcessingOrderId(order.id);
    const adminName = currentUser?.displayName || 'Teacher Ngozi (Admin)';
    await rejectTopUpRequest(order.id, adminName, reason);
    setProcessingOrderId(null);
    audioVoice.playBubblePop();
    setWalletFeedback(`Order ${order.reference} marked as rejected.`);
    setTimeout(() => setWalletFeedback(null), 4000);
  };

  // Handle Email Auth for Admin
  const handleAdminEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setAuthError('Please enter both admin email and password.');
      return;
    }
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await loginWithEmailPassword(adminEmail.trim(), adminPassword);
      if (result?.user) {
        if (!isUserAdminEmail(result.user.email)) {
          setAuthError(`The account (${result.user.email}) is not an authorized administrator. Regular accounts cannot access management.`);
          onAuthChange(result.user);
          return;
        }
        onAuthChange(result.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Google Auth for Admin
  const handleAdminGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        if (!isUserAdminEmail(result.user.email)) {
          setAuthError(`The account (${result.user.email}) is not an authorized administrator.`);
          onAuthChange(result.user);
          return;
        }
        onAuthChange(result.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAdminSignOut = async () => {
    await logout();
    onAuthChange(null);
  };

  // Perform Credit
  const handlePerformCredit = async (w: UserWallet) => {
    if (creditAmount <= 0) return;
    const res = await creditWallet(w.id, creditAmount, creditReason, 'Teacher Ngozi');
    if (res.success) {
      setWalletFeedback(`Successfully credited +${creditAmount} to ${w.studentName}!`);
      setTimeout(() => setWalletFeedback(null), 3500);
      setSelectedWallet(null);
    }
  };

  // Perform Debit
  const handlePerformDebit = async (w: UserWallet) => {
    if (debitAmount <= 0) return;
    const res = await debitWallet(w.id, debitAmount, debitReason);
    if (res.success) {
      setWalletFeedback(`Successfully debited -${debitAmount} from ${w.studentName}!`);
      setTimeout(() => setWalletFeedback(null), 3500);
      setSelectedWallet(null);
    }
  };

  // Delete a specific user profile & wallet
  const handleDeleteUserAccount = async (w: UserWallet, matchingUser?: UserProfile) => {
    if (!window.confirm(`Permanently delete account for "${matchingUser?.childName || w.studentName || w.email}"?`)) return;
    try {
      if (matchingUser?.uid) {
        await deleteDoc(doc(db, 'users', matchingUser.uid));
      }
      await deleteDoc(doc(db, 'wallets', w.id));
      setWalletFeedback(`Successfully deleted account & wallet for ${w.studentName || w.id}`);
      setTimeout(() => setWalletFeedback(null), 3500);
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Purge all test accounts (keeping admin accounts intact)
  const handlePurgeAllTestAccounts = async () => {
    if (!window.confirm('Are you sure you want to clean up and delete all non-admin user accounts and test wallets from Firestore?')) return;
    try {
      let count = 0;
      for (const w of wallets) {
        if (!isUserAdminEmail(w.email)) {
          await deleteDoc(doc(db, 'wallets', w.id));
          count++;
        }
      }
      for (const u of usersList) {
        if (!isUserAdminEmail(u.email)) {
          await deleteDoc(doc(db, 'users', u.uid));
          count++;
        }
      }
      setWalletFeedback(`✨ Database cleaned! Purged ${count} test documents.`);
      setTimeout(() => setWalletFeedback(null), 4000);
    } catch (err: any) {
      alert(`Purge error: ${err.message}`);
    }
  };

  // Generate AI Educational Game
  const handleGenerateAiGame = async () => {
    setIsGeneratingAiGame(true);
    setGameFeedback(null);
    try {
      const params: GenerateGameParams = {
        topic: aiTopic,
        category: aiCategory,
        targetAge: aiTargetAge,
        difficulty: aiDifficulty,
        mechanic: aiMechanic,
        customInstructions: aiCustomInstructions,
      };
      const game = await generateEducationalGameWithAI(params);
      setGeneratedGamePreview(game);
      setGameFeedback('✨ AI Game generated successfully! You can test voice prompts and publish below.');
      audioVoice.playSuccessChime();
    } catch (err: any) {
      setGameFeedback(`Error generating game: ${err.message}`);
    } finally {
      setIsGeneratingAiGame(false);
    }
  };

  // Publish Game to Firestore Live Arcade
  const handlePublishGame = async () => {
    if (!generatedGamePreview) return;
    try {
      await setDoc(doc(db, 'games', generatedGamePreview.id), generatedGamePreview);
      setGameFeedback(`🎉 "${generatedGamePreview.title}" is now LIVE in the Little Learners Arcade!`);
      audioVoice.playFanfare();
      setTimeout(() => {
        setGeneratedGamePreview(null);
        setGameFeedback(null);
      }, 3500);
    } catch (err: any) {
      setGameFeedback(`Failed to publish: ${err.message}`);
    }
  };

  // Delete Published Game
  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm('Remove this game from the live arcade?')) {
      await deleteDoc(doc(db, 'games', gameId));
    }
  };

  // Handle Tutor Photo Upload from Admin Panel
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleTutorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoCompressing(true);
      setPhotoError(null);
      try {
        // Compress image to 480x600 JPEG at 75% quality (~20KB - 40KB)
        // so it comfortably fits within Firestore's 1MB document boundary
        const compressedDataUrl = await compressImage(file, 480, 600, 0.75);
        setLocalTutorPhoto(compressedDataUrl);
      } catch (err: any) {
        console.error('Image compression error:', err);
        setPhotoError('Could not compress photo: ' + err.message);
      } finally {
        setPhotoCompressing(false);
      }
    }
  };

  // Trigger Manual Gmail Confirmation Dispatch
  const handleTriggerGmailConfirmation = async (booking: BookingRecord) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        alert('Please sign in with Google to enable the Gmail API dispatcher.');
        return;
      }
      const res = await sendBookingConfirmationEmails(booking, 'ngokonkwo2020@gmail.com', token);
      if (res.parentSent) {
        await setDoc(
          doc(db, 'bookings', booking.id),
          {
            emailSentToParent: res.parentSent,
            emailSentToEducator: res.educatorSent,
            emailSentAt: new Date().toISOString(),
          },
          { merge: true }
        );
        alert(`Success! Confirmation emails sent via Gmail to parent (${booking.email}) and educator!`);
      } else {
        alert(`Gmail error: ${res.error || 'Failed to dispatch emails.'}`);
      }
    } catch (e: any) {
      alert(`Dispatch error: ${e.message}`);
    }
  };

  // Filtered Real Wallets (excluding unverified orphan/guest wallets)
  const filteredWallets = wallets.filter((w) => {
    // Only real registered student wallets
    const isOrphanGuest = (!w.email || w.email.trim() === '') && (w.studentName === 'Young Explorer' || w.id.startsWith('wallet-17'));
    if (isOrphanGuest) return false;

    const q = walletSearchQuery.toLowerCase();
    return (
      w.studentName?.toLowerCase().includes(q) ||
      w.email?.toLowerCase().includes(q) ||
      w.id?.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  const isVerifiedAdmin = !!(currentUser && isUserAdminEmail(currentUser.email));

  // ACCESS GATE: If not verified administrator, show restricted authentication screen
  if (!isVerifiedAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-[#0D1829] text-slate-100 rounded-3xl max-w-md w-full border border-slate-700/80 shadow-2xl relative p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Educator Administration Console</h3>
              <p className="text-xs text-emerald-400 font-medium">Restricted Access · Authorized Personnel Only</p>
            </div>
          </div>

          {currentUser ? (
            // A non-admin user is currently logged in
            <div className="space-y-4 py-2">
              <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Access Denied</span>
                </div>
                <p>
                  You are signed in as <strong className="text-white font-mono">{currentUser.email}</strong>. This account does not possess educator administrator permissions.
                </p>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  Regular learner and family accounts cannot access the management console.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleAdminSignOut}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out & Switch Account</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Return to Main Site
                </button>
              </div>
            </div>
          ) : (
            // Unauthenticated user attempting to open admin console
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with your verified educator administrator credentials to access live bookings, learner credit wallets, curriculum games, and operational parameters.
              </p>

              {authError && (
                <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* 1-Click Google Sign-In for Admin */}
              <button
                type="button"
                onClick={handleAdminGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-60"
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
                <span>{isSigningIn ? 'Authenticating...' : 'Sign In with Google'}</span>
              </button>

              <div className="flex items-center gap-3 my-2 text-slate-500 text-[11px]">
                <div className="flex-1 h-px bg-slate-800" />
                <span>or with administrator credentials</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <form onSubmit={handleAdminEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSigningIn ? 'Verifying...' : 'Sign In to Management Console'}
                </button>
              </form>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel and return to site
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#070D18] text-slate-100 rounded-3xl max-w-7xl w-full h-[94vh] flex overflow-hidden border border-slate-800 shadow-2xl relative">
        {/* MOBILE SIDEBAR OVERLAY */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* SPACE APP SIDEBAR NAVIGATION */}
        <aside
          className={`fixed md:static top-0 bottom-0 left-0 z-30 w-72 bg-[#0A1324] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div>
            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-white tracking-wide">
                    MISSION CONTROL
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-mono">Teachers Ngozi v3.0</p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 md:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu Items */}
            <nav className="p-3 space-y-1">
              {[
                { id: 'overview', label: 'Mission Overview', icon: Activity, badge: null },
                {
                  id: 'wallets',
                  label: 'Learners & Top-Ups',
                  icon: Coins,
                  badge:
                    topUpRequests.filter((r) => r.status === 'pending').length > 0
                      ? `${topUpRequests.filter((r) => r.status === 'pending').length} Pending`
                      : `${wallets.length}`,
                },
                { id: 'aigames', label: 'AI Game Studio', icon: Cpu, badge: 'New AI' },
                { id: 'bookings', label: 'Bookings & Gmail', icon: Clock, badge: `${bookings.length}` },
                { id: 'slides', label: 'Hero Slide Studio', icon: Layers, badge: `${slides.length}` },
                { id: 'gmail', label: 'Gmail Dispatch', icon: Mail, badge: null },
                { id: 'settings', label: 'Profile & WhatsApp', icon: Settings, badge: null },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id as any);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-600/20 text-white border border-emerald-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer / Current Admin Status */}
          <div className="p-4 border-t border-slate-800/80 bg-[#08101E]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser?.displayName?.[0] || 'A'}
                </div>
                <div className="text-xs truncate max-w-[120px]">
                  <p className="font-bold text-white truncate">{currentUser?.displayName || 'Educator Admin'}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Admin Verified</p>
                </div>
              </div>
              <button
                onClick={handleAdminSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN MISSION CONTROL CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#070D18] overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 md:hidden text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  MISSION // {activeMenu.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                  {currentUser?.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Exit Mission Control"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* VIEW: OVERVIEW */}
          {activeMenu === 'overview' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Active Enquiries</span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="font-display font-black text-3xl text-white">{bookings.length}</span>
                </div>

                <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Registered Learners</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-display font-black text-3xl text-emerald-400">{wallets.length}</span>
                </div>

                <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Interactive Games</span>
                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="font-display font-black text-3xl text-amber-400">{publishedGames.length}</span>
                </div>

                <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Live Carousel Slides</span>
                    <Layers className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-display font-black text-3xl text-white">{slides.length}</span>
                </div>
              </div>

              {/* Quick Jump Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span>AI Game Studio Executive</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Create new high-value educational phonics and vocabulary games using Gemini AI in seconds.
                  </p>
                  <button
                    onClick={() => setActiveMenu('aigames')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open AI Game Studio →
                  </button>
                </div>

                <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>Find & Credit Learner Wallets</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Search registered parents and students to deposit learning play credits or adjust balances.
                  </p>
                  <button
                    onClick={() => setActiveMenu('wallets')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Manage Wallets →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: REGISTERED LEARNERS & WALLETS & TOP-UP ORDERS */}
          {activeMenu === 'wallets' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              {walletFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{walletFeedback}</span>
                </div>
              )}

              {/* Sub-View Switcher Tabs */}
              <div className="flex bg-[#0D1829] p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setWalletSubView('orders')}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    walletSubView === 'orders'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Top-Up Orders & Verification</span>
                  {topUpRequests.filter((r) => r.status === 'pending').length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      {topUpRequests.filter((r) => r.status === 'pending').length} New
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setWalletSubView('wallets')}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    walletSubView === 'wallets'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>All Registered Wallets ({wallets.length})</span>
                </button>
              </div>

              {/* SUB-VIEW 1: TOP-UP ORDERS & VERIFICATION */}
              {walletSubView === 'orders' && (
                <div className="space-y-4">
                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                    <div className="flex items-center gap-2">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => {
                        const count =
                          st === 'all'
                            ? topUpRequests.length
                            : topUpRequests.filter((r) => r.status === st).length;
                        return (
                          <button
                            key={st}
                            onClick={() => setOrderStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize cursor-pointer flex items-center gap-1.5 ${
                              orderStatusFilter === st
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                : 'bg-[#0D1829] text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            <span>{st}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      Live Firestore Orders Database
                    </div>
                  </div>

                  {/* Orders List */}
                  {topUpRequests.filter(
                    (r) => orderStatusFilter === 'all' || r.status === orderStatusFilter
                  ).length === 0 ? (
                    <div className="p-8 text-center bg-[#0D1829] border border-slate-800 rounded-2xl text-slate-400 text-xs">
                      No {orderStatusFilter !== 'all' ? orderStatusFilter : ''} top-up orders recorded yet. When parents request credits, orders will appear here for verification.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topUpRequests
                        .filter(
                          (r) => orderStatusFilter === 'all' || r.status === orderStatusFilter
                        )
                        .map((order) => (
                          <div
                            key={order.id}
                            className="bg-[#0D1829] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                          >
                            <div className="space-y-2 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-800 font-bold">
                                  {order.reference}
                                </span>
                                <span className="font-display font-bold text-white text-sm">
                                  {order.packageName}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                    order.status === 'approved'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : order.status === 'rejected'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                      : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                  }`}
                                >
                                  {order.status === 'approved'
                                    ? '✓ Approved'
                                    : order.status === 'rejected'
                                    ? '✕ Declined'
                                    : '⏳ Pending Verification'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-300">
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Learner & Wallet:</span>
                                  <strong className="text-white">{order.studentName}</strong>{' '}
                                  <span className="text-[10px] font-mono text-slate-400">({order.walletId})</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Parent / Payer:</span>
                                  <strong className="text-white">{order.parentName}</strong>{' '}
                                  {order.parentPhone && <span className="text-slate-400">({order.parentPhone})</span>}
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Amount & Date:</span>
                                  <strong className="text-emerald-400 font-mono">
                                    ₦{order.amountNGN.toLocaleString()}
                                  </strong>{' '}
                                  <span className="text-slate-400">(${order.amountUSD})</span> ·{' '}
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(order.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {order.notes && (
                                <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                                  <strong>Transfer Note / Ref:</strong> {order.notes}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons for Order */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                              <span className="font-mono font-black text-amber-400 text-base mr-2">
                                +{order.totalCredits} Cr
                              </span>

                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveTopUpOrder(order)}
                                    disabled={processingOrderId === order.id}
                                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                      {processingOrderId === order.id ? 'Crediting...' : 'Approve & Deposit'}
                                    </span>
                                  </button>

                                  <button
                                    onClick={() => handleRejectTopUpOrder(order)}
                                    disabled={processingOrderId === order.id}
                                    className="py-2 px-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    <span>Decline</span>
                                  </button>
                                </>
                              )}

                              {order.parentPhone && (
                                <a
                                  href={getWhatsAppUrl(
                                    `Hello ${order.parentName}, this is Teacher Ngozi regarding your Top-Up Order ${order.reference} for ${order.studentName}.`,
                                    order.parentPhone
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-colors"
                                  title="WhatsApp Parent"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-VIEW 2: ALL REGISTERED WALLETS */}
              {walletSubView === 'wallets' && (
                <div className="space-y-6">
                  {/* Search Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Find learner by student name, email, or ID..."
                        value={walletSearchQuery}
                        onChange={(e) => setWalletSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-400">
                        Showing <strong>{filteredWallets.length}</strong> wallets
                      </div>
                      <button
                        onClick={handlePurgeAllTestAccounts}
                        className="py-1.5 px-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Delete all non-admin test accounts and wallets to clean the database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge Test Accounts</span>
                      </button>
                    </div>
                  </div>

                  {/* Wallet Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWallets.map((w) => {
                      const matchingUser = usersList.find((u) => u.walletId === w.id || u.email === w.email);
                      return (
                        <div
                          key={w.id}
                          className="bg-[#0D1829] border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-display font-bold text-base text-white">
                                {matchingUser?.childName || w.studentName || 'Learner'}
                              </span>
                              <div className="flex items-center gap-1 font-mono text-amber-400 font-bold text-sm bg-slate-900 px-2.5 py-1 rounded-lg">
                                <Coins className="w-3.5 h-3.5" />
                                <span>{w.credits} Credits</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                              {matchingUser?.displayName && (
                                <p className="text-xs text-emerald-400 font-medium">
                                  Parent: {matchingUser.displayName} {matchingUser.childAge ? `(${matchingUser.childAge})` : ''}
                                </p>
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                                {w.tier || 'Free Starter'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">Email: {w.email || matchingUser?.email || 'N/A'}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">ID: {w.id}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                              <span>Games: <strong>{w.gamesPlayed || 0}</strong></span>
                              <span>Stars: <strong className="text-amber-400">{w.starsWon || 0} ⭐</strong></span>
                              {w.totalDeposited !== undefined && w.totalDeposited > 0 && (
                                <span>Paid: <strong className="text-emerald-400 font-mono">₦{w.totalDeposited.toLocaleString()}</strong></span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                            <button
                              onClick={() => setSelectedWallet(w)}
                              className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>Credit / Debit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUserAccount(w, matchingUser)}
                              className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-xl transition-colors cursor-pointer"
                              title="Delete this learner account and wallet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODAL: CREDIT / DEBIT OPERATION */}
              {selectedWallet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                  <div className="bg-[#0D1829] border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
                      <div>
                        <h4 className="font-display font-bold text-base text-white">
                          Manage Wallet: {selectedWallet.studentName}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">ID: {selectedWallet.id}</p>
                      </div>
                      <button onClick={() => setSelectedWallet(null)} className="text-slate-400 hover:text-white cursor-pointer">
                        ✕
                      </button>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-6 flex items-center justify-around">
                      <div>
                        <span className="text-xs text-slate-400 block">Current Balance</span>
                        <span className="font-display font-black text-2xl text-amber-400">
                          {selectedWallet.credits} Credits
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Total Stars</span>
                        <span className="font-display font-black text-2xl text-emerald-400">
                          {selectedWallet.starsWon} ⭐
                        </span>
                      </div>
                    </div>

                    {/* Credit Operation */}
                    <div className="mb-4 p-4 bg-[#08101E] rounded-xl border border-emerald-900/40">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                        + Fund / Deposit Credits
                      </span>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="number"
                          placeholder="Credits (e.g. 50)"
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(Number(e.target.value))}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Reason"
                          value={creditReason}
                          onChange={(e) => setCreditReason(e.target.value)}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <button
                        onClick={() => handlePerformCredit(selectedWallet)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Apply +{creditAmount} Credits
                      </button>
                    </div>

                    {/* Debit Operation */}
                    <div className="p-4 bg-[#08101E] rounded-xl border border-rose-900/40">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2">
                        - Deduct / Debit Credits
                      </span>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="number"
                          placeholder="Credits (e.g. 10)"
                          value={debitAmount}
                          onChange={(e) => setDebitAmount(Number(e.target.value))}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Reason"
                          value={debitReason}
                          onChange={(e) => setDebitReason(e.target.value)}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <button
                        onClick={() => handlePerformDebit(selectedWallet)}
                        className="w-full py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Deduct -{debitAmount} Credits
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: AI GAME STUDIO EXECUTIVE */}
          {activeMenu === 'aigames' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <span>AI Game Studio & Creator Executive</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Generate complete educational games with spoken teacher voice-over, interactive questions, and instant arcade publishing.
                </p>
              </div>

              {gameFeedback && (
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{gameFeedback}</span>
                </div>
              )}

              {/* Generator Form */}
              <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Educational Topic / Skill Focus *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Blends /tr/ and /dr/ or African Animal Reading"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Subject Category
                    </label>
                    <select
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Phonics">Phonics & Sound Blending</option>
                      <option value="Early Reading">Early Reading & Fluency</option>
                      <option value="Vocabulary">Vocabulary Expansion</option>
                      <option value="Comprehension">Reading Comprehension</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Age</label>
                    <input
                      type="text"
                      value={aiTargetAge}
                      onChange={(e) => setAiTargetAge(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Difficulty</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Game Style</label>
                    <select
                      value={aiMechanic}
                      onChange={(e) => setAiMechanic(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="asteroid">3D Asteroid Blaster</option>
                      <option value="vowel">3D Magic Missing Stone</option>
                      <option value="racer">Speed Sight-Word Racer</option>
                      <option value="riddle">Mystery Riddle Vault</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Tutor Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Include words like train, tree, drum, dragon; joyful voice tone"
                    value={aiCustomInstructions}
                    onChange={(e) => setAiCustomInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleGenerateAiGame}
                  disabled={isGeneratingAiGame}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingAiGame ? 'Executive AI Designing Game...' : 'Generate Educational Game with Gemini AI'}</span>
                </button>
              </div>

              {/* Game Preview & Test Zone */}
              {generatedGamePreview && (
                <div className="bg-[#0B1528] border-2 border-emerald-500/50 p-6 rounded-3xl space-y-4 max-w-2xl shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-900 rounded-xl">{generatedGamePreview.icon}</span>
                      <div>
                        <h4 className="font-display font-bold text-lg text-white">{generatedGamePreview.title}</h4>
                        <span className="text-xs text-emerald-400 font-mono">
                          {generatedGamePreview.category} · {generatedGamePreview.difficulty} · Cost: {generatedGamePreview.costCredits} cr
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handlePublishGame}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Publish to Live Arcade</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">{generatedGamePreview.description}</p>

                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Generated Questions & Spoken Voice Prompts ({generatedGamePreview.questions?.length ?? 0}):
                    </span>
                    {generatedGamePreview.questions?.map((q, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Round {idx + 1}: {q.instruction}</span>
                          <button
                            onClick={() => audioVoice.speak(q.soundSpoken)}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] p-1"
                            title="Hear voice prompt"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Play Voice</span>
                          </button>
                        </div>
                        <p className="text-slate-400 italic">"{q.soundSpoken}"</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {q.options.map((opt) => (
                            <span
                              key={opt}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                                opt === q.correct ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {opt} {opt === q.correct ? '✓' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Published Games Management */}
              {publishedGames.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h4 className="font-display font-bold text-sm text-white">
                    Tutor-Published Games in Arcade ({publishedGames.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publishedGames.map((g) => (
                      <div key={g.id} className="bg-[#0D1829] border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{g.icon}</span>
                          <div>
                            <p className="font-bold text-xs text-white">{g.title}</p>
                            <p className="text-[11px] text-slate-400">{g.category} · {g.costCredits} cr</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGame(g.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: BOOKINGS & GMAIL */}
          {activeMenu === 'bookings' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Bookings & Automatic Gmail Confirmation Pipeline
                  </h3>
                  <p className="text-xs text-slate-400">
                    Parent submissions trigger confirmation emails via the Gmail API to parent and educator.
                  </p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-[#0D1829] border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No lesson bookings recorded yet in Firestore. When parents submit bookings or enquiry forms, they will appear here in real-time.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#0D1829] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-base text-white">{b.parentName}</h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              Child: {b.childName} ({b.childAge})
                            </span>
                          </div>
                          <p className="text-xs text-emerald-400 font-medium mt-1">
                            {b.learningArea} · {b.currentClass} · {b.preferredSchedule}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {b.emailSentToParent ? (
                            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
                              <Check className="w-3.5 h-3.5" />
                              <span>Parent Confirmed via Gmail</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleTriggerGmailConfirmation(b)}
                              className="text-xs bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-600/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Auto-Dispatch Gmail Confirmation</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#08101E] p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1 mb-3">
                        <p><strong>WhatsApp:</strong> {b.whatsappNumber} · <strong>Email:</strong> {b.email}</p>
                        {b.message && <p className="italic text-slate-400">"{b.message}"</p>}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <a
                          href={getWhatsAppUrl(`Hello ${b.parentName}, this is Teacher Ngozi following up on your booking for ${b.childName}.`, b.whatsappNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: HERO SLIDE STUDIO */}
          {activeMenu === 'slides' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              <h3 className="font-display font-bold text-base text-white">Hero Slides Management</h3>
              {slides.length === 0 ? (
                <div className="p-8 text-center bg-[#0D1829] border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
                  <p>No custom hero slides currently stored in Firestore.</p>
                  <p className="text-[11px] text-slate-500">The site is currently presenting the default core hero slides on the homepage. Any custom slides saved in Firestore will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slides.map((s, idx) => (
                    <div key={s.id} className="bg-[#0D1829] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div className="relative aspect-[16/9]">
                        <img
                          src={resolveImageUrl(s.imageUrl)}
                          alt={s.headline}
                          onError={(e) => {
                            e.currentTarget.src = resolveImageUrl();
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono">
                          Slide #{idx + 1}
                        </span>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">{s.kicker}</span>
                        <h4 className="font-display font-bold text-sm text-white mb-1">{s.headline}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{s.subtitle}</p>
                      </div>
                      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Action: {s.ctaAction}</span>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete slide?')) {
                              await deleteDoc(doc(db, 'hero_slides', s.id));
                            }
                          }}
                          className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: GMAIL DISPATCH */}
          {activeMenu === 'gmail' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              <h3 className="font-display font-bold text-base text-white">Direct Gmail Comms</h3>
              <div className="bg-[#0D1829] border border-slate-800 p-5 rounded-2xl max-w-xl">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const token = await getAccessToken();
                    if (!token) {
                      alert('Please sign in with Google first.');
                      return;
                    }
                    setEmailSending(true);
                    const res = await sendGmailMessage(token, { to: emailTo, subject: emailSubject, body: emailBody });
                    setEmailSending(false);
                    if (res.success) {
                      alert('Email sent successfully!');
                      setEmailTo('');
                      setEmailSubject('');
                      setEmailBody('');
                    } else {
                      alert(`Error: ${res.error}`);
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    required
                    placeholder="Recipient email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <textarea
                    rows={6}
                    required
                    placeholder="Body text"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-sans"
                  />
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
                  >
                    {emailSending ? 'Sending...' : 'Send via Gmail API'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS & TUTOR PROFILE PHOTO UPLOAD */}
          {activeMenu === 'settings' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-2xl">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Teacher Profile, Photo & Operational Parameters
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Updates to WhatsApp, profile photo, and support emails are stored in Firestore and updated across the site in real-time.
                </p>
              </div>

              {settingsSaved && (
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Profile and operational settings saved to Firestore!</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    let safePhoto = localTutorPhoto;
                    // Guard against oversized payload before writing to Firestore
                    if (safePhoto && safePhoto.length > 200000) {
                      console.warn('Tutor photo exceeds safe size, truncating or compressing');
                      safePhoto = '';
                    }
                    const updated: SiteSettings = {
                      whatsappNumber: localWhatsapp,
                      supportEmail: localEmail,
                      announcement: localAnnouncement,
                      tutorPhotoUrl: safePhoto,
                      tutorTitle: localTutorTitle,
                      tutorBio: localTutorBio,
                      updatedAt: new Date().toISOString(),
                    };
                    await setDoc(doc(db, 'site_settings', 'global'), updated);
                    onUpdateSettings(updated);
                    setSettingsSaved(true);
                    setTimeout(() => setSettingsSaved(false), 3500);
                  } catch (err: any) {
                    console.error('Settings save error:', err);
                    alert(`Could not save settings: ${err.message}`);
                  }
                }}
                className="space-y-4 bg-[#0D1829] border border-slate-800 p-5 rounded-2xl"
              >
                {/* Tutor Profile Photo Upload Section */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Teacher Ngozi's Official Profile Photograph
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative shrink-0">
                      {localTutorPhoto ? (
                        <img src={localTutorPhoto} alt="Teacher Ngozi" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-300 font-bold text-xs">
                          TN
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-600 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{photoCompressing ? 'Optimizing Photo...' : 'Upload Teacher Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={photoCompressing}
                          onChange={handleTutorPhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {localTutorPhoto && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ✓ Optimized (~{Math.round(localTutorPhoto.length / 1024)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => setLocalTutorPhoto('')}
                            className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {photoError && (
                        <p className="text-[11px] text-rose-400">{photoError}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp Business Contact Number (Connected to all buttons)
                  </label>
                  <input
                    type="text"
                    value={localWhatsapp}
                    onChange={(e) => setLocalWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">Current: +234 806 092 7203</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teacher Professional Title
                  </label>
                  <input
                    type="text"
                    value={localTutorTitle}
                    onChange={(e) => setLocalTutorTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teacher Teaching Bio & Philosophy
                  </label>
                  <textarea
                    rows={3}
                    value={localTutorBio}
                    onChange={(e) => setLocalTutorBio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Public Support Email</label>
                  <input
                    type="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Top Announcement Banner</label>
                  <input
                    type="text"
                    value={localAnnouncement}
                    onChange={(e) => setLocalAnnouncement(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Global Settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
