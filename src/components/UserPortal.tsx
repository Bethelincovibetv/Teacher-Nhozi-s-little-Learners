import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Coins,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Gift,
  Heart,
  MessageCircle,
  Phone,
  Play,
  Save,
  ShieldCheck,
  Smile,
  Volume2,
  Zap,
  Check,
  ChevronRight,
  RefreshCw,
  Star,
  BookMarked,
  Gamepad2,
  LogOut,
  Music,
  ExternalLink,
  Sliders,
  Flame,
  CheckSquare,
  CreditCard,
  ShoppingBag,
  Receipt,
  History,
  Trophy,
  Menu,
  X,
  Lock,
  Building2,
  AlertCircle,
  FileText,
  Send,
  Copy,
} from 'lucide-react';
import { UserProfile, UserWallet, BookingRecord, EducationalGame, CreditPackage, CreditTransaction, TopUpRequest } from '../types';
import { db, updateUserProfileDoc, logout } from '../lib/firebase';
import {
  creditWallet,
  awardGameStars,
  debitWallet,
  convertStarsToCredits,
  redeemRealVoucherCode,
  getWalletTransactions,
  createTopUpRequest,
  OFFICIAL_CREDIT_PACKAGES,
  determineWalletTier,
} from '../lib/wallet';
import { audioVoice } from '../lib/audioVoice';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { getWhatsAppUrl, WHATSAPP_CONFIG, OFFICIAL_BANK_DETAILS } from '../data/content';
import { ActiveGamePlayer } from './EducationalGamesSuite';

interface UserPortalProps {
  onBackToHome: () => void;
  currentUserProfile: UserProfile | null;
  wallet: UserWallet | null;
  onOpenBooking: (programName?: string) => void;
  onOpenAuth?: (mode?: 'signin' | 'register') => void;
  whatsappNumber?: string;
  onProfileUpdated?: (updated: UserProfile) => void;
}

const PHONICS_SOUNDS = [
  { sound: 'a', word: 'apple', icon: '🍎' },
  { sound: 'b', word: 'ball', icon: '⚽' },
  { sound: 'c', word: 'cat', icon: '🐱' },
  { sound: 'd', word: 'dog', icon: '🐶' },
  { sound: 'e', word: 'egg', icon: '🥚' },
  { sound: 'f', word: 'fish', icon: '🐟' },
  { sound: 'g', word: 'goat', icon: '🐐' },
  { sound: 'h', word: 'hat', icon: '🎩' },
  { sound: 'i', word: 'igloo', icon: '🧊' },
  { sound: 'j', word: 'jug', icon: '🧃' },
  { sound: 'k', word: 'kite', icon: '🪁' },
  { sound: 'l', word: 'lion', icon: '🦁' },
  { sound: 'm', word: 'moon', icon: '🌙' },
  { sound: 'n', word: 'nest', icon: '🪺' },
  { sound: 'o', word: 'octopus', icon: '🐙' },
  { sound: 'p', word: 'pencil', icon: '✏️' },
  { sound: 'q', word: 'queen', icon: '👑' },
  { sound: 'r', word: 'rocket', icon: '🚀' },
  { sound: 's', word: 'sun', icon: '☀️' },
  { sound: 't', word: 'tiger', icon: '🐯' },
  { sound: 'u', word: 'umbrella', icon: '☂️' },
  { sound: 'v', word: 'van', icon: '🚐' },
  { sound: 'w', word: 'water', icon: '💧' },
  { sound: 'x', word: 'xylophone', icon: '🎹' },
  { sound: 'y', word: 'yo-yo', icon: '🪀' },
  { sound: 'z', word: 'zebra', icon: '🦓' },
];

const DIGRAPHS = [
  { sound: 'sh', word: 'ship', example: 'sh - i - p' },
  { sound: 'ch', word: 'chair', example: 'ch - ai - r' },
  { sound: 'th', word: 'thumb', example: 'th - u - m - b' },
  { sound: 'wh', word: 'whale', example: 'wh - a - l - e' },
  { sound: 'ck', word: 'duck', example: 'd - u - ck' },
  { sound: 'ee', word: 'tree', example: 't - r - ee' },
  { sound: 'oo', word: 'moon', example: 'm - oo - n' },
  { sound: 'ai', word: 'rain', example: 'r - ai - n' },
];

const BADGES = [
  { id: 'starter', title: 'Phonics Pioneer', desc: 'Started the literacy journey', icon: '🔤', req: 'Initial Sign Up', unlocked: true },
  { id: 'vowels', title: 'Vowel Virtuoso', desc: 'Mastered 5 vowel sounds', icon: '🌟', req: '5 Vowels Check', minSounds: 5 },
  { id: 'child_sound', title: 'Child Echo Champ', desc: 'Mastered child phonics echo quest', icon: '👧', req: 'Played Child Phonics Game', minGames: 1 },
  { id: 'arcade', title: 'Arcade Champion', desc: 'Played 3 learning games', icon: '🎮', req: '3 Games Played', minGames: 3 },
  { id: 'stars50', title: 'Super Star Collector', desc: 'Collected 20+ game stars', icon: '⭐', req: '20 Stars Won', minStars: 20 },
  { id: 'alphabet', title: 'Alphabet Master', desc: 'Mastered all 26 letter sounds', icon: '👑', req: '26 Letter Sounds', minSounds: 26 },
];

export const UserPortal: React.FC<UserPortalProps> = ({
  onBackToHome,
  currentUserProfile,
  wallet,
  onOpenBooking,
  onOpenAuth,
  whatsappNumber,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'games' | 'bookings' | 'mastery' | 'resources' | 'profile'>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Active game player inside portal
  const [activePortalGame, setActivePortalGame] = useState<EducationalGame | null>(null);

  // Real Wallet sub-tab state inside Portal
  const [walletSubTab, setWalletSubTab] = useState<'packages' | 'stars' | 'voucher' | 'history'>('packages');
  const [recentTxns, setRecentTxns] = useState<CreditTransaction[]>([]);
  const [userTopUpOrders, setUserTopUpOrders] = useState<TopUpRequest[]>([]);
  const [selectedOrderPkg, setSelectedOrderPkg] = useState<CreditPackage | null>(null);
  const [orderPayerName, setOrderPayerName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'bank_transfer' | 'whatsapp_desk' | 'card_gateway'>('bank_transfer');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submittedOrderReceipt, setSubmittedOrderReceipt] = useState<TopUpRequest | null>(null);
  const [copiedBankAcct, setCopiedBankAcct] = useState(false);

  const [starsToConvert, setStarsToConvert] = useState<number>(25);
  const [starConvertMsg, setStarConvertMsg] = useState<string | null>(null);
  const [portalVoucherCode, setPortalVoucherCode] = useState('');
  const [portalVoucherMsg, setPortalVoucherMsg] = useState<string | null>(null);
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [phone, setPhone] = useState('');
  const [learningFocus, setLearningFocus] = useState('Phonics & Early Reading');
  const [preferredSchedule, setPreferredSchedule] = useState('Weekend Mornings');
  const [masteredSounds, setMasteredSounds] = useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Daily reward mini-challenge state
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  // Sound feedback state
  const [speakingSound, setSpeakingSound] = useState<string | null>(null);

  // Children 3D Experience: Interactive Teacher Ngozi Companion State
  const [teacherBubbleText, setTeacherBubbleText] = useState<string>(
    'Welcome back! Tap me anytime to hear Teacher Ngozi cheer for you! 🌟'
  );
  const [isTeacherGreeting, setIsTeacherGreeting] = useState(false);

  const handleTeacherNgoziGreet = () => {
    audioVoice.playBubblePop();
    audioVoice.playCoinReward();
    setIsTeacherGreeting(true);
    const greeting = `Hello my marvelous superstar, ${displayChildName}! Teacher Ngozi is right here cheering for you! Let's sound out our words and collect shiny stars today!`;
    setTeacherBubbleText(greeting);
    audioVoice.speakTeacherCheer(greeting, () => setIsTeacherGreeting(false));
  };

  const handleTeacherMagicWord = () => {
    audioVoice.playBubblePop();
    setIsTeacherGreeting(true);
    const words = [
      { sound: 's', word: 'SUN', tip: '/s/ makes the warm sunny sound!' },
      { sound: 'c', word: 'CAT', tip: '/k/ makes the playful kitten sound!' },
      { sound: 'r', word: 'ROCKET', tip: '/r/ zooms high into space!' },
      { sound: 'a', word: 'APPLE', tip: '/æ/ is crunchy and sweet!' },
      { sound: 'd', word: 'DOG', tip: '/d/ is for a loyal puppy!' },
    ];
    const picked = words[Math.floor(Math.random() * words.length)];
    const tipMsg = `Teacher Ngozi's Magic Sound is /${picked.sound}/ as in ${picked.word}! ${picked.tip}`;
    setTeacherBubbleText(tipMsg);
    audioVoice.speakTeacherNgozi(tipMsg, () => setIsTeacherGreeting(false));
  };

  // Load real transactions whenever wallet or wallet tab changes
  useEffect(() => {
    if (wallet?.id) {
      getWalletTransactions(wallet.id).then((txns) => {
        setRecentTxns(txns);
      });
    }
  }, [wallet?.id, activeTab, walletSubTab]);

  // Real-time listener for user's Top-Up Orders
  useEffect(() => {
    if (!wallet?.id) return;
    try {
      const q = query(
        collection(db, 'topup_requests'),
        where('walletId', '==', wallet.id),
        orderBy('createdAt', 'desc'),
        limit(15)
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: TopUpRequest[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as TopUpRequest);
          });
          setUserTopUpOrders(list);
        },
        (err) => {
          console.warn('Orders listener note:', err);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Orders listener note:', err);
    }
  }, [wallet?.id]);

  // Handle clicking package to open official order modal
  const handleOpenTopUpModal = (pkg: CreditPackage) => {
    audioVoice.playBubblePop();
    setSelectedOrderPkg(pkg);
    setSubmittedOrderReceipt(null);
    setOrderPayerName(currentUserProfile?.displayName || wallet?.studentName || '');
    setOrderPhone(currentUserProfile?.phone || '');
    setOrderNotes('');
  };

  // Submit Official Top-Up Request to Admin Desk
  const handleSubmitTopUpOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !selectedOrderPkg) return;

    setIsSubmittingOrder(true);
    const res = await createTopUpRequest({
      walletId: wallet.id,
      packageId: selectedOrderPkg.id,
      packageName: selectedOrderPkg.name,
      credits: selectedOrderPkg.credits,
      bonusCredits: selectedOrderPkg.bonusCredits,
      totalCredits: selectedOrderPkg.totalCredits,
      amountNGN: selectedOrderPkg.priceNGN,
      amountUSD: selectedOrderPkg.priceUSD,
      studentName: displayChildName,
      parentName: orderPayerName || displayParentName,
      parentEmail: currentUserProfile?.email || wallet.email || '',
      parentPhone: orderPhone,
      paymentMethod: orderPaymentMethod,
      notes: orderNotes,
    });
    setIsSubmittingOrder(false);

    if (res.success && res.request) {
      audioVoice.playFanfare();
      audioVoice.speak(`Splendid! Top-up order submitted for ${displayChildName}. Reference ${res.request.reference}.`);
      setSubmittedOrderReceipt(res.request);
    } else {
      audioVoice.playErrorBuzz();
      alert(`Top-up order error: ${res.error || 'Failed to submit order'}`);
    }
  };

  const handleCopyAccount = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(OFFICIAL_BANK_DETAILS.accountNumber);
      setCopiedBankAcct(true);
      audioVoice.playBubblePop();
      setTimeout(() => setCopiedBankAcct(false), 2500);
    }
  };

  const handlePortalConvertStars = async () => {
    if (!wallet) return;
    setStarConvertMsg(null);
    const res = await convertStarsToCredits(wallet.id, starsToConvert);
    if (res.success) {
      audioVoice.playCoinReward();
      audioVoice.speak(`Terrific! Exchanged ${starsToConvert} stars for ${res.creditsAwarded} real game credits!`);
      setStarConvertMsg(`🌟 Exchanged ${starsToConvert} ⭐ into +${res.creditsAwarded} Game Credits!`);
      const txns = await getWalletTransactions(wallet.id);
      setRecentTxns(txns);
    } else {
      audioVoice.playErrorBuzz();
      setStarConvertMsg(res.error || 'Conversion failed.');
    }
  };

  const handlePortalRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !portalVoucherCode.trim()) return;

    setIsRedeemingVoucher(true);
    setPortalVoucherMsg(null);
    const res = await redeemRealVoucherCode(wallet.id, portalVoucherCode);
    setIsRedeemingVoucher(false);

    if (res.success) {
      audioVoice.playCoinReward();
      audioVoice.speak(`Hooray! ${res.creditsAdded} credits added to your wallet!`);
      setPortalVoucherMsg(res.message);
      setPortalVoucherCode('');
      const txns = await getWalletTransactions(wallet.id);
      setRecentTxns(txns);
    } else {
      audioVoice.playErrorBuzz();
      setPortalVoucherMsg(res.message);
    }
  };

  useEffect(() => {
    if (currentUserProfile) {
      setDisplayName(currentUserProfile.displayName || '');
      setChildName(currentUserProfile.childName || '');
      setChildAge(currentUserProfile.childAge || '');
      setPhone(currentUserProfile.phone || '');
      setLearningFocus(currentUserProfile.learningFocus || 'Phonics & Early Reading');
      setPreferredSchedule(currentUserProfile.preferredSchedule || 'Weekend Mornings');
      setMasteredSounds(currentUserProfile.masteredSounds || []);
    }
  }, [currentUserProfile]);

  // Fetch bookings associated with this parent's email
  useEffect(() => {
    if (!currentUserProfile?.email) return;

    setLoadingBookings(true);
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('email', '==', currentUserProfile.email)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: BookingRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push({ id: docSnap.id, ...docSnap.data() } as BookingRecord);
        });
        records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyBookings(records);
        setLoadingBookings(false);
      },
      (err) => {
        console.warn('Parent bookings listener note:', err);
        setLoadingBookings(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserProfile?.email]);

  const handleSpeak = (text: string, title?: string) => {
    audioVoice.speak(text, {
      onEnd: () => setSpeakingSound(null),
    });
    setSpeakingSound(title || text);
  };

  const handleSpeakChildPhonics = (sound: string, word: string) => {
    audioVoice.playBubblePop();
    audioVoice.speakChildPhonics(sound, word, () => setSpeakingSound(null));
    setSpeakingSound(sound);
  };

  const handleToggleSoundMastery = async (sound: string) => {
    const isCurrentlyMastered = masteredSounds.includes(sound);
    const updated = isCurrentlyMastered
      ? masteredSounds.filter((s) => s !== sound)
      : [...masteredSounds, sound];

    setMasteredSounds(updated);

    if (currentUserProfile?.uid) {
      try {
        const saved = await updateUserProfileDoc(currentUserProfile.uid, {
          masteredSounds: updated,
        });
        if (onProfileUpdated) onProfileUpdated(saved);

        if (!isCurrentlyMastered && wallet?.id) {
          audioVoice.playCoinReward();
          await awardGameStars(wallet.id, 1);
        }
      } catch (err) {
        console.warn('Failed to persist sound mastery:', err);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserProfile?.uid) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      const updated = await updateUserProfileDoc(currentUserProfile.uid, {
        displayName,
        childName,
        childAge,
        phone,
        learningFocus,
        preferredSchedule,
        masteredSounds,
      });

      if (onProfileUpdated) onProfileUpdated(updated);
      setProfileSuccessMsg('Learner profile updated successfully! 🎉');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Error updating profile: ' + (err.message || 'Please try again.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleClaimDailyReward = async () => {
    if (!wallet?.id || dailyClaimed) return;
    setClaimingReward(true);
    try {
      const rewardCredits = 15;
      const res = await creditWallet(wallet.id, rewardCredits, 'Daily Literacy Practice Bonus 🌟', 'parent_portal');
      if (res.success) {
        setDailyClaimed(true);
        audioVoice.playSuccessChime();
        audioVoice.speakChildCheer('Yay! You claimed your daily fifteen practice credits! Have fun playing!');
        setRewardMsg(`🎉 +${rewardCredits} Practice Credits added to your Arcade Wallet!`);
      }
    } catch (e) {
      console.warn('Daily reward error:', e);
    } finally {
      setClaimingReward(false);
    }
  };

  const childSoundGame: EducationalGame = {
    id: 'game-child-phonics-echo',
    title: 'Kids Phonics Sound & Echo Quest',
    category: 'Phonics',
    description: 'Listen to joyful child phonics sound-bites, repeat the letters, and match playful picture cards with sweet child voice rewards!',
    costCredits: 5,
    rewardStars: 25,
    icon: '👧',
    badge: 'Child Voice & Sounds',
    difficulty: 'Beginner',
    mechanic: 'child_sound',
  };

  const displayChildName = currentUserProfile?.childName || 'Little Learner';
  const displayParentName = currentUserProfile?.displayName || 'Parent';

  // STRICT AUTHENTICATION GUARD (No Demo / Anonymous Access)
  if (!currentUserProfile) {
    return (
      <div className="min-h-screen w-full bg-[#0F1E36] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-2xl text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#0F1E36] text-amber-300 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-display font-extrabold text-xl text-[#0F1E36]">
            Strict Account Access Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Learner & Family Portal is strictly reserved for registered families and enrolled students. Demo and guest access is not permitted to protect child learning records and real wallet transactions.
          </p>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth('register');
              }}
              className="w-full py-3 px-4 bg-[#1A5336] hover:bg-[#133E28] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Register Account (+60 Real Credits)</span>
            </button>
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth('signin');
              }}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Sign In with Existing Account
            </button>
            <button
              onClick={onBackToHome}
              className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
            >
              ← Back to Main Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden flex flex-col md:flex-row relative bg-[#FAF9F5] text-slate-800 antialiased selection:bg-[#E6F4EC] selection:text-[#1A5336]">
      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* LEARNER & FAMILY SIDEBAR NAVIGATION (like Admin Mission Control) */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-72 lg:w-80 bg-[#0F1E36] text-slate-100 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 shrink-0 select-none shadow-2xl md:shadow-none ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Sidebar Brand Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1A5336] to-emerald-500 flex items-center justify-center text-amber-300 shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-white tracking-wide">
                  LITTLE LEARNERS
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium">Family & Learner Space</p>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 md:hidden text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile & Wallet Card */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1A5336] to-[#2E8B57] text-white flex items-center justify-center font-display font-bold text-lg shadow-inner shrink-0 border border-emerald-400/30">
                {displayChildName[0] || '🌟'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-display font-bold text-sm text-white truncate">
                    {displayChildName}
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    {wallet?.tier || determineWalletTier(wallet?.credits || 0)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Parent: <span className="text-slate-200">{displayParentName}</span>
                </p>
              </div>
            </div>

            {/* Live Stats Strip */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-black/30 rounded-xl p-2 border border-white/5 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Play Credits</span>
                  <span className="font-mono font-black text-xs text-amber-300 leading-tight block truncate">
                    {wallet?.credits ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-2 border border-white/5 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Stars Won</span>
                  <span className="font-mono font-black text-xs text-white leading-tight block truncate">
                    {wallet?.starsWon ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu List */}
          <nav className="p-3 space-y-1 flex-1">
            {[
              {
                id: 'dashboard',
                label: 'Dashboard & Quests',
                icon: Sparkles,
                badge: 'Live',
                color: 'text-amber-400',
              },
              {
                id: 'wallet',
                label: 'Real Credit Wallet',
                icon: Coins,
                badge: `${wallet?.credits ?? 0} Cr`,
                color: 'text-amber-400',
              },
              {
                id: 'games',
                label: 'Phonics Games Arcade',
                icon: Gamepad2,
                badge: '3D Play',
                color: 'text-emerald-400',
              },
              {
                id: 'bookings',
                label: 'My Lessons & Trials',
                icon: Calendar,
                badge: myBookings.length > 0 ? `${myBookings.length}` : undefined,
                color: 'text-blue-400',
              },
              {
                id: 'mastery',
                label: 'Phonics Sound Mastery',
                icon: Award,
                badge: `${masteredSounds.length}/26`,
                color: 'text-purple-400',
              },
              {
                id: 'resources',
                label: 'Parent Toolkit & PDFs',
                icon: BookMarked,
                color: 'text-teal-400',
              },
              {
                id: 'profile',
                label: 'Learner & Family Profile',
                icon: User,
                color: 'text-rose-400',
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePortalGame(null);
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1A5336] to-[#14422B] text-white shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-black/30 text-amber-300'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-2 shrink-0">
          {/* Daily Reward Mini Widget */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/30 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-300 block leading-tight">Daily Quest Bonus</span>
              <span className="text-[11px] text-white font-medium block leading-tight">+15 Play Credits</span>
            </div>
            {!dailyClaimed ? (
              <button
                onClick={handleClaimDailyReward}
                disabled={claimingReward}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                {claimingReward ? '...' : 'Claim'}
              </button>
            ) : (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Done
              </span>
            )}
          </div>

          {/* WhatsApp Direct Line */}
          <a
            href={getWhatsAppUrl(
              `Hello Teacher Ngozi, this is ${displayParentName}, reaching out from ${displayChildName}’s learner portal.`,
              whatsappNumber
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#1A5336] hover:bg-[#15442C] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat Teacher Ngozi</span>
          </a>

          <div className="flex items-center gap-2 pt-1">
            {/* Back to Home Button */}
            <button
              onClick={onBackToHome}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Main Site</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await logout();
                onBackToHome();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE AREA */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden min-w-0 max-w-full bg-[#FAF9F5]">
        {/* Top App Header (Frame Safe & Mobile Responsive) */}
        <header className="h-16 sm:h-20 bg-white border-b border-stone-200 px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 shrink-0 shadow-2xs z-10 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 md:hidden rounded-xl bg-stone-100 text-slate-700 hover:bg-stone-200 cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <span className="text-[#1A5336] font-bold">Learner Hub</span>
                <span>/</span>
                <span className="text-slate-600 truncate">
                  {activeTab === 'dashboard' && 'Dashboard & Quests'}
                  {activeTab === 'wallet' && 'Real Credit Wallet'}
                  {activeTab === 'games' && 'Phonics Games Arcade'}
                  {activeTab === 'bookings' && 'My Lessons & Bookings'}
                  {activeTab === 'mastery' && 'Phonics Mastery & Sounds'}
                  {activeTab === 'resources' && 'Parent Resources & Guides'}
                  {activeTab === 'profile' && 'Learner Profile Settings'}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-xs sm:text-base lg:text-lg text-[#0F1E36] leading-tight truncate">
                {activeTab === 'dashboard' && `Welcome back, ${displayChildName}! 🌟`}
                {activeTab === 'wallet' && 'Official Learner Credit Wallet'}
                {activeTab === 'games' && 'Child Sound & Interactive 3D Arcade'}
                {activeTab === 'bookings' && 'Enrolled Lessons & Trial Requests'}
                {activeTab === 'mastery' && 'Phonics Sounds Mastery & Badges'}
                {activeTab === 'resources' && 'Parent Literacy Toolkit & Printables'}
                {activeTab === 'profile' && 'Learner & Guardian Profile'}
              </h2>
            </div>
          </div>

          {/* Top Header Quick Controls (Tight & responsive) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live Wallet Chip */}
            <button
              onClick={() => {
                setActivePortalGame(null);
                setActiveTab('wallet');
              }}
              className="flex items-center gap-1 sm:gap-1.5 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-300/80 px-2 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:translate-y-0.5 shrink-0"
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400 shrink-0" />
              <span className="font-mono font-black text-xs sm:text-sm text-[#0F1E36]">
                {wallet?.credits ?? 0}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-800 hidden md:inline">Credits</span>
            </button>

            {/* Kids Sound Toggle (Desktop/Tablet) */}
            <button
              onClick={() => audioVoice.toggleBackgroundMusic()}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:translate-y-0.5"
              title="Toggle Children's Background Sound"
            >
              <Music className="w-3.5 h-3.5 text-amber-600" />
              <span>Kids Sound</span>
            </button>

            {/* Quick Booking CTA */}
            <button
              onClick={() => onOpenBooking('Phonics & Early Reading')}
              className="px-2.5 sm:px-3.5 py-1.5 bg-[#1A5336] hover:bg-[#133E28] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 active:translate-y-0.5"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">Book Lesson</span>
              <span className="sm:hidden">Book</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Tab Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 w-full max-w-7xl mx-auto min-w-0">
        {rewardMsg && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-medium animate-fade-in">
            <span className="truncate pr-2">{rewardMsg}</span>
            <button onClick={() => setRewardMsg('')} className="text-amber-700 font-bold hover:underline cursor-pointer shrink-0">
              Dismiss
            </button>
          </div>
        )}

        {/* ACTIVE IN-PORTAL GAME PLAYER */}
        {activePortalGame && (
          <div className="mb-6 sm:mb-8 animate-fade-in w-full max-w-full">
            <ActiveGamePlayer
              game={activePortalGame}
              wallet={wallet}
              onClose={() => setActivePortalGame(null)}
              onWinStars={async (stars) => {
                if (wallet?.id) {
                  await awardGameStars(wallet.id, stars);
                }
              }}
            />
          </div>
        )}

        {/* TAB 1: DASHBOARD & 3D CHILDREN EXPERIENCE */}
        {activeTab === 'dashboard' && !activePortalGame && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in w-full max-w-full overflow-hidden">
            {/* 3D INTERACTIVE TEACHER NGOZI COMPANION HERO BANNER */}
            <div className="bg-gradient-to-br from-white via-emerald-50/50 to-amber-50/40 p-4 sm:p-6 lg:p-8 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden w-full max-w-full">
              {/* Playful Floating Sparkle Badges */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 relative z-10">
                <div className="flex items-start sm:items-center gap-3 sm:gap-5 min-w-0">
                  {/* 3D Animated Teacher Avatar Mascot */}
                  <div className="relative shrink-0">
                    <div
                      onClick={handleTeacherNgoziGreet}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#1A5336] via-emerald-500 to-amber-400 p-1 shadow-[0_6px_0_#14422B] hover:shadow-[0_8px_0_#14422B] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_1px_0_#14422B] transition-all cursor-pointer select-none flex items-center justify-center ${
                        isTeacherGreeting ? 'scale-105 rotate-2' : ''
                      }`}
                      title="Tap Teacher Ngozi to hear audio greeting!"
                    >
                      <div className="w-full h-full rounded-[20px] bg-[#0F1E36] flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                        👩🏾‍🏫
                      </div>
                    </div>
                    {isTeacherGreeting && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] animate-bounce">
                        ⭐
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A5336] uppercase tracking-wide mb-1">
                      <span className="text-sm">👩🏾‍🏫</span>
                      <span>TEACHER NGOZI INTERACTIVE READING COMPANION</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-[#0F1E36] leading-tight">
                      Hello, {displayChildName}! Ready to Read?
                    </h2>

                    {/* Interactive Speech Bubble */}
                    <div className="mt-2.5 p-2.5 sm:p-3 bg-white/95 border border-emerald-500/30 rounded-2xl shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed relative">
                      <p className="font-medium text-emerald-950">
                        "{teacherBubbleText}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3D Tactile Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-start lg:justify-end shrink-0 w-full lg:w-auto">
                  <button
                    onClick={handleTeacherNgoziGreet}
                    className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-b from-[#1A5336] to-[#14422B] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-[0_4px_0_#0d2b1c] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>Say Hello</span>
                  </button>

                  <button
                    onClick={handleTeacherMagicWord}
                    className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🪄 Magic Sound</span>
                  </button>

                  <button
                    onClick={() => setActivePortalGame(childSoundGame)}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-b from-[#0F1E36] to-[#0A1424] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-[0_4px_0_#050a12] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Play Phonics Quest (5 Cr)</span>
                  </button>
                </div>
              </div>

              {/* Phonics mastery progress bar */}
              <div className="mt-6 pt-5 border-t border-stone-200/80">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2 font-semibold flex-wrap gap-1">
                  <span className="text-slate-700">Phonics Sounds Mastered with Teacher Ngozi:</span>
                  <span className="text-[#1A5336] font-mono font-bold">
                    {Math.round((masteredSounds.length / 26) * 100)}% ({masteredSounds.length}/26 Letters)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-[#1A5336] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(8, (masteredSounds.length / 26) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3D TACTILE PHONICS SOUNDBOARD & TOY BOX BLOCKS */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-stone-200 shadow-2xs w-full max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">
                    <span>🎲</span>
                    <span>3D PHONICS SOUNDBOARD & TACTILE TOY BLOCKS</span>
                  </div>
                  <h3 className="font-display font-extrabold text-base sm:text-xl text-[#0F1E36]">
                    Tap a 3D Sound Block to Hear the Pronunciation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Press any colorful block to trigger real child & teacher phonics audio!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('mastery')}
                  className="text-xs font-bold text-[#1A5336] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>View All 26 Sounds</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 8 3D Tactile Cubes with Physical Press Shadow */}
              <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3.5 w-full">
                {PHONICS_SOUNDS.slice(0, 8).map((item, idx) => {
                  const isMastered = masteredSounds.includes(item.sound);
                  // Cute distinctive palette for toy blocks
                  const blockPalettes = [
                    { bg: 'from-amber-400 to-amber-500', shadow: 'shadow-[0_5px_0_#b45309]', text: 'text-amber-950' },
                    { bg: 'from-emerald-400 to-emerald-500', shadow: 'shadow-[0_5px_0_#047857]', text: 'text-emerald-950' },
                    { bg: 'from-sky-400 to-sky-500', shadow: 'shadow-[0_5px_0_#0369a1]', text: 'text-sky-950' },
                    { bg: 'from-rose-400 to-rose-500', shadow: 'shadow-[0_5px_0_#be123c]', text: 'text-rose-950' },
                    { bg: 'from-purple-400 to-purple-500', shadow: 'shadow-[0_5px_0_#6b21a8]', text: 'text-purple-950' },
                    { bg: 'from-teal-400 to-teal-500', shadow: 'shadow-[0_5px_0_#0f766e]', text: 'text-teal-950' },
                    { bg: 'from-orange-400 to-orange-500', shadow: 'shadow-[0_5px_0_#c2410c]', text: 'text-orange-950' },
                    { bg: 'from-indigo-400 to-indigo-500', shadow: 'shadow-[0_5px_0_#4338ca]', text: 'text-indigo-950' },
                  ];
                  const pal = blockPalettes[idx % blockPalettes.length];

                  return (
                    <button
                      key={item.sound}
                      onClick={() => handleSpeakChildPhonics(item.sound, item.word)}
                      className={`p-3 rounded-2xl text-center border-2 border-white/60 bg-gradient-to-b ${pal.bg} ${pal.shadow} ${pal.text} hover:-translate-y-1 active:translate-y-1.5 active:shadow-none transition-all cursor-pointer select-none flex flex-col items-center justify-between min-h-[96px] w-full`}
                      title={`Tap to sound out ${item.sound.toUpperCase()} for ${item.word}`}
                    >
                      <span className="text-2xl sm:text-3xl block drop-shadow-sm">{item.icon}</span>
                      <span className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider block">
                        {item.sound}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-tight block truncate w-full">
                        {item.word}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 ACTION & LEARNING CARDS (Responsive & Frame-Safe) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
              {/* Card 1: 1-on-1 Class */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between w-full">
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 sm:mb-4 shadow-2xs">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F1E36]">1-on-1 Live Online Lessons</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {myBookings.length > 0
                      ? `You have ${myBookings.length} lesson booking record(s) on file with Teacher Ngozi.`
                      : 'Experience Teacher Ngozi’s interactive live reading lessons.'}
                  </p>
                </div>
                <button
                  onClick={() => onOpenBooking(learningFocus)}
                  className="mt-5 w-full py-2.5 sm:py-3 bg-stone-100 hover:bg-stone-200 text-[#0F1E36] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span>{myBookings.length > 0 ? 'Book Another Session' : 'Book a Trial Lesson'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Games Arcade */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between w-full">
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 sm:mb-4 shadow-2xs">
                    <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F1E36]">Child Sound Games Arcade</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Play phonics asteroids, 3D vowel kingdom, and child echo match challenges.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('games')}
                  className="mt-5 w-full py-2.5 sm:py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span>Open Arcade ({wallet?.credits ?? 0} Credits)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 3: Direct WhatsApp */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between w-full">
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 sm:mb-4 shadow-2xs">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F1E36]">Teacher Ngozi Live Desk</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Need lesson advice or custom scheduling? Message Teacher Ngozi directly on WhatsApp.
                  </p>
                </div>
                <a
                  href={getWhatsAppUrl(
                    `Hello Teacher Ngozi, this is ${displayParentName}, parent of ${displayChildName}. Reaching out from our learner portal.`,
                    whatsappNumber
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full py-2.5 sm:py-3 bg-[#E6F4EC] hover:bg-[#d8ece1] text-[#1A5336] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px] text-center"
                >
                  <span className="truncate">Chat on WhatsApp</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REAL LEARNER CREDIT WALLET & TOP-UPS */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Balance Card */}
            <div className="bg-gradient-to-br from-[#0F1E36] via-[#172D52] to-[#1A5336] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-700/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-500/30">
                      LIVE VERIFIED DATABASE WALLET
                    </span>
                    <span className="text-xs text-amber-300">
                      Tier: <strong>{wallet?.tier || determineWalletTier(wallet?.credits || 0)}</strong>
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                    {displayChildName}’s Real Credit Wallet
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                    Wallet ID: <span className="font-mono text-emerald-200">{wallet?.id}</span> · Linked Parent: <strong>{displayParentName}</strong>
                  </p>
                </div>

                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">Available Balance</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-display font-black text-3xl sm:text-4xl text-amber-300">
                        {wallet?.credits ?? 0}
                      </span>
                      <span className="text-xs font-semibold text-emerald-200">Credits</span>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/20" />

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">Star Rewards</span>
                    <div className="flex items-center gap-1 text-amber-400 font-display font-bold text-xl sm:text-2xl mt-0.5">
                      <Star className="w-5 h-5 fill-amber-400" />
                      <span>{wallet?.starsWon ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Sub-Tabs */}
            <div className="flex overflow-x-auto no-scrollbar scrollbar-none gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 shadow-2xs text-xs font-semibold max-w-full">
              {[
                { id: 'packages', label: 'Top-Up Packages', shortLabel: 'Packages', icon: ShoppingBag },
                { id: 'stars', label: 'Exchange Stars for Credits', shortLabel: 'Star Exchange', icon: Star },
                { id: 'voucher', label: 'Voucher & Promo Code', shortLabel: 'Vouchers', icon: Gift },
                { id: 'history', label: 'Real-Time Transaction Ledger', shortLabel: 'Ledger', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = walletSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setWalletSubTab(tab.id as any)}
                    className={`flex-1 min-w-[95px] sm:min-w-0 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:translate-y-0.5 ${
                      isActive
                        ? 'bg-[#0F1E36] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-[11px] font-bold">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* SUB-TAB 1: PACKAGES */}
            {walletSubTab === 'packages' && (
              <div className="space-y-6">
                {/* Official Payment Instructions & Verification Banner */}
                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-3xl text-xs space-y-3 text-emerald-900 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950">Official Top-Up & Payment Desk</h4>
                        <p className="text-slate-600 text-xs">
                          Select your package below, transfer via bank or WhatsApp, and Teacher Ngozi will verify & credit your learner’s wallet.
                        </p>
                      </div>
                    </div>
                    <a
                      href={getWhatsAppUrl(
                        `Hello Teacher Ngozi, I want to purchase practice credits for ${displayChildName} (Wallet ID: ${wallet?.id}).`,
                        whatsappNumber
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#1A5336] hover:bg-[#133E28] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Payment Desk</span>
                    </a>
                  </div>

                  <div className="pt-3 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-slate-500 block">Bank Name</span>
                      <strong className="text-slate-900">{OFFICIAL_BANK_DETAILS.bankName}</strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 block">Account Number</span>
                        <strong className="text-slate-900 font-mono">{OFFICIAL_BANK_DETAILS.accountNumber}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy Account Number"
                      >
                        {copiedBankAcct ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px] font-bold">{copiedBankAcct ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-slate-500 block">Account Name</span>
                      <strong className="text-slate-900 truncate block">{OFFICIAL_BANK_DETAILS.accountName}</strong>
                    </div>
                  </div>
                </div>

                {/* Package Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {OFFICIAL_CREDIT_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`bg-white p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                        pkg.popular
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-stone-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-bold text-sm text-[#0F1E36]">
                            {pkg.name}
                          </span>
                          {pkg.badge && (
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                pkg.popular ? 'bg-[#1A5336] text-white' : 'bg-stone-100 text-slate-700'
                              }`}
                            >
                              {pkg.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="font-display font-black text-3xl text-[#1A5336]">
                            +{pkg.totalCredits}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">Credits</span>
                        </div>

                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                          {pkg.description}
                        </p>
                        <p className="text-[11px] text-[#1A5336] font-semibold mb-4">
                          🎯 {pkg.gamesEstimated}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-display font-bold text-base text-[#0F1E36] block">
                            ₦{pkg.priceNGN.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ${pkg.priceUSD} / £{pkg.priceGBP}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenTopUpModal(pkg)}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            pkg.popular
                              ? 'bg-[#1A5336] hover:bg-[#133E28] text-white'
                              : 'bg-[#0F1E36] hover:bg-[#172D52] text-white'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Order Pack</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MY TOP-UP ORDERS & VERIFICATION STATUS */}
                {userTopUpOrders.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#0F1E36] flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-emerald-600" />
                        <span>My Credit Top-Up Orders & Verification</span>
                      </h3>
                      <span className="text-xs text-slate-500">
                        {userTopUpOrders.length} Order(s) Logged
                      </span>
                    </div>

                    <div className="space-y-2">
                      {userTopUpOrders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{order.packageName}</span>
                              <span className="font-mono text-[11px] bg-stone-200 text-slate-700 px-2 py-0.5 rounded-md">
                                {order.reference}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                  order.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : order.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {order.status === 'approved'
                                  ? '✓ Approved & Credited'
                                  : order.status === 'rejected'
                                  ? '✕ Declined'
                                  : '⏳ Awaiting Admin Approval'}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px]">
                              Learner: <strong>{order.studentName}</strong> · Amount: <strong>₦{order.amountNGN.toLocaleString()}</strong> (${order.amountUSD}) ·{' '}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-black text-emerald-700 text-sm">
                              +{order.totalCredits} Credits
                            </span>
                            {order.status === 'pending' && (
                              <a
                                href={getWhatsAppUrl(
                                  `Hello Teacher Ngozi, here is my payment confirmation for Order ${order.reference} (${order.packageName}, ₦${order.amountNGN.toLocaleString()}) for ${order.studentName}.`,
                                  whatsappNumber
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Send WhatsApp Proof</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-5 bg-white border border-stone-200 rounded-3xl flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#1A5336] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 text-sm">Secure Payment & Educator Credit Assurance</p>
                    <p>
                      All learner credit deposits are officially authenticated and verified by Teacher Ngozi. Your child’s balance never expires and can be used for any interactive game, phonics quiz, or vocabulary mission.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: TOP-UP ORDER & INVOICE */}
            {selectedOrderPkg && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
                <div className="bg-white rounded-3xl border border-stone-300 max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-800 relative my-8">
                  <button
                    onClick={() => {
                      setSelectedOrderPkg(null);
                      setSubmittedOrderReceipt(null);
                    }}
                    className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {!submittedOrderReceipt ? (
                    <form onSubmit={handleSubmitTopUpOrder} className="space-y-5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          OFFICIAL TOP-UP ORDER
                        </span>
                        <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#0F1E36] mt-2">
                          Order {selectedOrderPkg.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Deposit for learner: <strong>{displayChildName}</strong> (Wallet: {wallet?.id})
                        </p>
                      </div>

                      {/* Package Summary Box */}
                      <div className="p-4 bg-[#FAF9F5] border border-stone-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-500 block">Credits to Add</span>
                          <span className="font-display font-black text-2xl text-[#1A5336]">
                            +{selectedOrderPkg.totalCredits} Credits
                          </span>
                          <span className="text-[11px] text-emerald-700 block mt-0.5">
                            Includes {selectedOrderPkg.bonusCredits} free bonus credits
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Package Price</span>
                          <span className="font-display font-black text-2xl text-[#0F1E36]">
                            ₦{selectedOrderPkg.priceNGN.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            ${selectedOrderPkg.priceUSD} USD / £{selectedOrderPkg.priceGBP} GBP
                          </span>
                        </div>
                      </div>

                      {/* Bank Details & Payment Instructions */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-emerald-950">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-700" />
                            <span>Official Bank Transfer Details</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyAccount}
                            className="text-[11px] text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md hover:bg-emerald-300 font-semibold cursor-pointer"
                          >
                            {copiedBankAcct ? '✓ Copied' : 'Copy Account'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Bank:</span>
                            <span className="font-semibold text-slate-800">{OFFICIAL_BANK_DETAILS.bankName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Account Number:</span>
                            <span className="font-mono font-bold text-slate-900 text-xs">{OFFICIAL_BANK_DETAILS.accountNumber}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 block">Account Name:</span>
                            <span className="font-semibold text-slate-800">{OFFICIAL_BANK_DETAILS.accountName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Form Inputs */}
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Parent / Payer Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={orderPayerName}
                            onChange={(e) => setOrderPayerName(e.target.value)}
                            placeholder="e.g. Mrs. Ngozi Okonkwo"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              WhatsApp / Phone Number
                            </label>
                            <input
                              type="tel"
                              value={orderPhone}
                              onChange={(e) => setOrderPhone(e.target.value)}
                              placeholder="+234..."
                              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Payment Method
                            </label>
                            <select
                              value={orderPaymentMethod}
                              onChange={(e) => setOrderPaymentMethod(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="bank_transfer">Direct Bank Transfer</option>
                              <option value="whatsapp_desk">WhatsApp Payment Desk</option>
                              <option value="card_gateway">Online Card Payment</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Transfer Reference or Notes (Optional)
                          </label>
                          <input
                            type="text"
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="e.g. Paid via Access Bank app ref #99214"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="submit"
                          disabled={isSubmittingOrder}
                          className="w-full sm:flex-1 py-3.5 bg-[#1A5336] hover:bg-[#133E28] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSubmittingOrder ? 'Submitting Order...' : 'Submit Top-Up Order'}</span>
                        </button>
                        <a
                          href={getWhatsAppUrl(
                            `Hello Teacher Ngozi, I am paying for ${selectedOrderPkg.name} (+${selectedOrderPkg.totalCredits} credits, ₦${selectedOrderPkg.priceNGN.toLocaleString()}) for my child ${displayChildName}.`,
                            whatsappNumber
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>Pay via WhatsApp</span>
                        </a>
                      </div>
                    </form>
                  ) : (
                    /* Order Submitted Confirmation Receipt */
                    <div className="space-y-5 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      </div>

                      <div>
                        <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                          REF: {submittedOrderReceipt.reference}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#0F1E36] mt-2">
                          Top-Up Order Recorded!
                        </h3>
                        <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                          Your order for <strong>+{submittedOrderReceipt.totalCredits} Credits</strong> (₦{submittedOrderReceipt.amountNGN.toLocaleString()}) has been submitted. Teacher Ngozi will verify your deposit and activate your credits promptly.
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs space-y-2 text-emerald-950">
                        <p className="font-bold flex items-center gap-1.5">
                          <ExternalLink className="w-4 h-4 text-emerald-700" />
                          <span>Next Step: Send Proof on WhatsApp</span>
                        </p>
                        <p className="text-slate-600 text-[11px]">
                          Click the button below to message Teacher Ngozi directly with your order reference so your deposit is confirmed immediately.
                        </p>
                        <a
                          href={getWhatsAppUrl(
                            `Hello Teacher Ngozi! I just submitted Top-Up Order ${submittedOrderReceipt.reference} for ${submittedOrderReceipt.studentName} (${submittedOrderReceipt.packageName}, ₦${submittedOrderReceipt.amountNGN.toLocaleString()}). Here is my payment confirmation!`,
                            whatsappNumber
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center py-2.5 bg-[#1A5336] hover:bg-[#133E28] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                        >
                          Send Payment Proof on WhatsApp Now
                        </a>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrderPkg(null);
                          setSubmittedOrderReceipt(null);
                        }}
                        className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Done & View Order Status
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: EXCHANGE STARS */}
            {walletSubTab === 'stars' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#0F1E36] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span>Convert Game Stars into Real Play Credits</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Earn stars by answering questions correctly in the arcade and cash them in for free practice credits.
                    </p>
                  </div>
                  <span className="font-bold font-mono text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
                    {wallet?.starsWon ?? 0} ⭐ Available
                  </span>
                </div>

                <div className="p-6 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-4">
                  <span className="text-xs font-bold text-amber-900 block">
                    Choose Amount of Stars to Convert (Rate: 5 Stars = 1 Credit):
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {[25, 50, 100, 200].map((num) => (
                      <button
                        key={num}
                        onClick={() => setStarsToConvert(num)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          starsToConvert === num
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white border border-amber-300 text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        {num} ⭐ → +{num / 5} Credits
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handlePortalConvertStars}
                    disabled={(wallet?.starsWon || 0) < starsToConvert}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Convert {starsToConvert} Stars into +{starsToConvert / 5} Credits</span>
                  </button>

                  {starConvertMsg && (
                    <p className="text-xs font-semibold text-center text-amber-900 mt-2">
                      {starConvertMsg}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: VOUCHER CODE */}
            {walletSubTab === 'voucher' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6 max-w-xl">
                <div>
                  <h3 className="font-bold text-lg text-[#0F1E36]">Redeem Parent Voucher Code</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter promotional or school scholarship codes provided by Teacher Ngozi.
                  </p>
                </div>

                <form onSubmit={handlePortalRedeemVoucher} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. NGOZI50 or LITTLELEARNER"
                      value={portalVoucherCode}
                      onChange={(e) => setPortalVoucherCode(e.target.value)}
                      className="flex-1 px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-slate-900 uppercase font-mono tracking-wider focus:outline-none focus:border-[#1A5336]"
                    />
                    <button
                      type="submit"
                      disabled={isRedeemingVoucher || !portalVoucherCode.trim()}
                      className="px-6 py-3 bg-[#1A5336] hover:bg-[#133E28] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-60"
                    >
                      {isRedeemingVoucher ? 'Checking...' : 'Redeem'}
                    </button>
                  </div>

                  {portalVoucherMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                      {portalVoucherMsg}
                    </div>
                  )}
                </form>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-1.5 text-slate-600">
                  <p className="font-bold text-slate-800">Verified Codes for Registered Parents:</p>
                  <p>• <strong>NGOZI50</strong>: +50 Bonus Credits for early reading</p>
                  <p>• <strong>LITTLELEARNER</strong>: +75 Bonus Credits for new students</p>
                  <p>• <strong>READINGJOY</strong>: +100 Bonus Credits scholarship award</p>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: TRANSACTION LEDGER */}
            {walletSubTab === 'history' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#0F1E36]">Real-time Transaction Ledger</h3>
                    <p className="text-xs text-slate-500">Every deposit, game deduction, and bonus credit recorded in Firestore.</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    {recentTxns.length} Total Records
                  </span>
                </div>

                {recentTxns.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                    No transactions recorded yet. Top up credits or play a game to see your entries.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                    {recentTxns.map((t) => (
                      <div key={t.id} className="p-4 bg-white hover:bg-stone-50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{t.reason}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(t.createdAt).toLocaleString()} · Authorized by {t.performedBy} {t.reference ? `· Ref: ${t.reference}` : ''}
                          </p>
                        </div>
                        <span
                          className={`font-mono font-bold text-sm ${
                            t.amount > 0 ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                        >
                          {t.amount > 0 ? `+${t.amount}` : t.amount} cr
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHILD SOUND & GAMES ARCADE */}
        {activeTab === 'games' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0F1E36]">
                  Educational Games with Child Audio & Voice-Overs
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Launch interactive phonics challenges directly inside your full-page portal.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="font-mono font-black text-base text-[#0F1E36]">{wallet?.credits ?? 0} Credits</span>
                </div>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Game 1: Child Sound Phonics Game */}
              <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-3 bg-emerald-50 rounded-2xl">👧</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
                      Child Voice & Sounds
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#0F1E36] mb-1">
                    Kids Phonics Sound & Echo Quest
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    Listen to sweet child voice sound-bites, repeat phonemes aloud, and tap matching phonics cards to win stars and celebratory cheers!
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 font-mono">5 Credits • +25 Stars</span>
                  <button
                    onClick={() => setActivePortalGame(childSoundGame)}
                    className="px-5 py-2.5 bg-[#1A5336] hover:bg-[#14422b] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>

              {/* Game 2: Asteroid Blaster */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-3 bg-stone-50 rounded-2xl">🚀</span>
                    <span className="text-[10px] font-bold text-[#1A5336] bg-[#E6F4EC] px-3 py-1 rounded-full uppercase">
                      Phonics Asteroids
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#0F1E36] mb-1">
                    3D Phonics Asteroid Blaster
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    Listen to target sounds (/sh/, /ch/, /th/, /ai/), aim your laser, and blast the correct flying asteroids.
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 font-mono">5 Credits • +20 Stars</span>
                  <button
                    onClick={() =>
                      setActivePortalGame({
                        id: 'game-phonics-asteroids',
                        title: '3D Phonics Asteroid Blaster',
                        category: 'Phonics',
                        description: 'Blast asteroids with target sounds',
                        costCredits: 5,
                        rewardStars: 20,
                        icon: '🚀',
                        badge: 'Space Phonics',
                        difficulty: 'Beginner',
                        mechanic: 'asteroid',
                      })
                    }
                    className="px-5 py-2.5 bg-[#0F1E36] hover:bg-[#162D4A] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>

              {/* Game 3: Vowel Kingdom */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-3 bg-stone-50 rounded-2xl">🏰</span>
                    <span className="text-[10px] font-bold text-[#1A5336] bg-[#E6F4EC] px-3 py-1 rounded-full uppercase">
                      Vowel Kingdom
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#0F1E36] mb-1">
                    3D Magical Vowel Kingdom
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    Hop across floating stone platforms to blend C-V-C words into magic golden keys.
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 font-mono">5 Credits • +20 Stars</span>
                  <button
                    onClick={() =>
                      setActivePortalGame({
                        id: 'game-vowel-kingdom',
                        title: '3D Magical Vowel Kingdom',
                        category: 'Early Reading',
                        description: 'Blend CVC words',
                        costCredits: 5,
                        rewardStars: 20,
                        icon: '🏰',
                        badge: 'Vowel Kingdom',
                        difficulty: 'Beginner',
                        mechanic: 'vowel',
                      })
                    }
                    className="px-5 py-2.5 bg-[#0F1E36] hover:bg-[#162D4A] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MY BOOKINGS & SCHEDULE */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
              <div>
                <h2 className="text-xl font-bold text-[#0F1E36]">My Enrolled Lessons & Consultations</h2>
                <p className="text-xs text-slate-500">
                  Track the status of your trial classes and scheduled online learning sessions.
                </p>
              </div>
              <button
                onClick={() => onOpenBooking(learningFocus)}
                className="px-5 py-2.5 bg-[#0F1E36] hover:bg-[#162D4A] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book New Lesson</span>
              </button>
            </div>

            {loadingBookings ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                <RefreshCw className="w-8 h-8 text-[#1A5336] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading your bookings...</p>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
                <Calendar className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-[#0F1E36]">No lesson bookings recorded yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                  Ready to help your child read fluently? Book a personalized trial lesson with Teacher Ngozi today.
                </p>
                <button
                  onClick={() => onOpenBooking(learningFocus)}
                  className="px-6 py-3.5 bg-[#1A5336] hover:bg-[#14422b] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Book a Trial Session</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b) => {
                  const statusColor =
                    b.status === 'scheduled' || b.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : b.status === 'contacted'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200';

                  return (
                    <div
                      key={b.id}
                      className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase px-3 py-0.5 rounded-full border ${statusColor}`}>
                            {b.status.toUpperCase()}
                          </span>
                          <span className="text-sm font-bold text-[#0F1E36]">
                            Program: {b.learningArea}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Learner: <strong>{b.childName}</strong> ({b.childAge || 'Enrolled'}, {b.currentClass || 'Level'})
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Preferred Schedule: <strong>{b.preferredSchedule}</strong></span>
                          <span>•</span>
                          <span>Requested on: {new Date(b.createdAt).toLocaleDateString()}</span>
                        </p>
                        {b.message && (
                          <p className="text-xs bg-stone-50 p-2.5 rounded-xl text-slate-600 mt-2 italic">
                            "{b.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={getWhatsAppUrl(
                            `Hello Teacher Ngozi, regarding our booking for ${b.childName} (${b.learningArea}), could we confirm our session schedule?`,
                            whatsappNumber
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-[#E6F4EC] hover:bg-[#d8ece1] text-[#1A5336] text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp Status</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PHONICS SOUNDS & BADGES MASTERY */}
        {activeTab === 'mastery' && (
          <div className="space-y-8 animate-fade-in">
            {/* Badges Carousel */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1E36]">Earned Milestone Badges</h2>
                  <p className="text-xs text-slate-500">Collect stars and master sounds to unlock special learning accolades.</p>
                </div>
                <span className="text-xs font-bold text-[#1A5336] bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  {wallet?.starsWon ?? 0} Total Stars ⭐
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {BADGES.map((b) => {
                  const isUnlocked =
                    b.unlocked ||
                    (b.minSounds && masteredSounds.length >= b.minSounds) ||
                    (b.minGames && (wallet?.gamesPlayed || 0) >= b.minGames) ||
                    (b.minStars && (wallet?.starsWon || 0) >= b.minStars);

                  return (
                    <div
                      key={b.id}
                      className={`p-4 sm:p-5 rounded-2xl text-center border transition-all duration-300 select-none ${
                        isUnlocked
                          ? 'bg-gradient-to-b from-amber-100/90 via-amber-50/60 to-white border-2 border-amber-300 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.25)] hover:-translate-y-1.5 hover:shadow-md'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      <span className={`text-4xl block mb-2 transition-transform duration-300 ${isUnlocked ? 'scale-110 drop-shadow-sm' : 'grayscale'}`}>
                        {b.icon}
                      </span>
                      <h4 className="font-bold text-xs text-[#0F1E36] leading-tight">{b.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{b.desc}</p>
                      <span
                        className={`inline-block mt-2.5 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60 shadow-2xs'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isUnlocked ? 'Unlocked ✓' : 'In Progress'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 26 Letter Sounds Grid */}
            <div className="bg-white p-4 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F1E36]">26 Alphabet Sounds Mastery Grid</h2>
                  <p className="text-xs text-slate-500">
                    Check off sounds your child can pronounce and identify. Tap the speaker to hear Teacher Ngozi’s child-friendly sound.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto font-mono">
                  {masteredSounds.length} / 26 Mastered
                </span>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 sm:gap-3.5 w-full">
                {PHONICS_SOUNDS.map((item) => {
                  const isChecked = masteredSounds.includes(item.sound);
                  return (
                    <div
                      key={item.sound}
                      className={`p-3 rounded-2xl border-2 transition-all duration-150 flex flex-col justify-between select-none ${
                        isChecked
                          ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-400 shadow-[0_4px_0_#059669]'
                          : 'bg-stone-50 border-stone-200 hover:border-amber-400 shadow-[0_4px_0_#e2e8f0]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl sm:text-2xl drop-shadow-xs">{item.icon}</span>
                        <button
                          type="button"
                          onClick={() => handleSpeakChildPhonics(item.sound, item.word)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A5336] hover:bg-stone-200/60 cursor-pointer active:scale-90 transition-transform"
                          title="Hear sound"
                        >
                          <Volume2 className="w-4 h-4 text-emerald-700" />
                        </button>
                      </div>
                      <div className="text-center my-1">
                        <span className="font-display font-black text-xl sm:text-2xl uppercase text-[#0F1E36] block">
                          {item.sound}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600 truncate block">{item.word}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSoundMastery(item.sound)}
                        className={`mt-2 w-full py-1.5 px-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:translate-y-0.5 shadow-xs min-h-[34px] ${
                          isChecked
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-white border border-stone-300 text-slate-700 hover:bg-stone-100'
                        }`}
                      >
                        {isChecked ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Mastered</span>
                          </>
                        ) : (
                          <span>Check Sound</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Digraphs & Blends */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
              <h3 className="text-base font-bold text-[#0F1E36] mb-1">Key Digraphs & Two-Letter Blends</h3>
              <p className="text-xs text-slate-500 mb-6">
                Advanced phonics sounds essential for reading early storybooks.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {DIGRAPHS.map((d) => (
                  <div
                    key={d.sound}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-display font-bold text-base text-[#0F1E36] block uppercase">
                        /{d.sound}/
                      </span>
                      <span className="text-xs text-slate-600">{d.word}</span>
                      <span className="text-[10px] text-emerald-700 block font-mono">{d.example}</span>
                    </div>
                    <button
                      onClick={() => handleSpeak(`${d.sound}, as in ${d.word}`, d.sound)}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-[#1A5336] hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PARENT TOOLKIT & PDFS */}
        {activeTab === 'resources' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
              <h2 className="text-xl font-bold text-[#0F1E36] mb-1">Parent Home Practice Guides & Materials</h2>
              <p className="text-xs text-slate-500 mb-6">
                Curated literacy guides from Teacher Ngozi to accelerate your child’s reading confidence at home.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                        Printable PDF Guide
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Ages 3–7</span>
                    </div>
                    <h3 className="font-bold text-base text-[#0F1E36]">
                      Teacher Ngozi’s 15-Minute Daily Phonics Routine
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      A step-by-step daily schedule designed for busy parents to build reading habits without frustration.
                    </p>
                  </div>
                  <a
                    href={getWhatsAppUrl('Hello Teacher Ngozi, please send me the PDF guide for the 15-Minute Daily Phonics Routine.', whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F1E36] hover:bg-[#162D4A] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Request Free PDF on WhatsApp</span>
                  </a>
                </div>

                <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                        Flashcard Sheet
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Early Readers</span>
                    </div>
                    <h3 className="font-bold text-base text-[#0F1E36]">
                      Top 50 High-Frequency Sight Words Checklist
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Master the 50 most common sight words (the, and, was, you, they, said) with simple flashcard exercises.
                    </p>
                  </div>
                  <a
                    href={getWhatsAppUrl('Hello Teacher Ngozi, please share the 50 High-Frequency Sight Words sheet with me.', whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A5336] hover:bg-[#14422b] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Request Sight Word Sheet</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CHILD PROFILE & PREFERENCES */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs max-w-3xl mx-auto animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0F1E36]">Child & Family Learning Profile</h2>
              <p className="text-xs text-slate-500">
                Keep your child’s learning details updated so Teacher Ngozi can tailor upcoming lessons.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1A5336] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1A5336] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Child’s First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Amanda, Kene, Liam"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1A5336] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Child’s Age / School Level
                  </label>
                  <input
                    type="text"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    placeholder="e.g. 5 Years old (Reception / KG)"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1A5336] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Primary Learning Goal
                  </label>
                  <select
                    value={learningFocus}
                    onChange={(e) => setLearningFocus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1A5336] focus:bg-white outline-none"
                  >
                    <option value="Phonics & Early Reading">Phonics & Early Reading (Ages 3–6)</option>
                    <option value="Reading Fluency & Comprehension">Reading Fluency & Comprehension (Ages 6–9)</option>
                    <option value="Confidence & Vocabulary Building">Confidence & Vocabulary (Ages 5–10)</option>
                    <option value="Grammar & Creative Writing">Grammar & Creative Writing (Ages 7–12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Lesson Schedule
                  </label>
                  <select
                    value={preferredSchedule}
                    onChange={(e) => setPreferredSchedule(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1A5336] focus:bg-white outline-none"
                  >
                    <option value="Weekday Afternoons (4:00 PM – 6:00 PM)">Weekday Afternoons (4:00 PM – 6:00 PM)</option>
                    <option value="Weekend Mornings (10:00 AM – 1:00 PM)">Weekend Mornings (10:00 AM – 1:00 PM)</option>
                    <option value="Weekend Afternoons (2:00 PM – 5:00 PM)">Weekend Afternoons (2:00 PM – 5:00 PM)</option>
                    <option value="Flexible / Custom Times">Flexible / Custom Times</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-[#1A5336] hover:bg-[#14422b] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Learner Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  </div>
);
};
