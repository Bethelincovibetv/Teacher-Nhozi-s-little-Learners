import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Star,
  Coins,
  ShieldCheck,
  Zap,
  Target,
  Flame,
  Award,
  Layers,
  ChevronRight,
  Rocket,
  Compass,
  Cpu,
  Smile,
  Mic,
  Music,
  Receipt,
  History,
  Gift,
  Check,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { audioVoice } from '../lib/audioVoice';
import {
  getOrCreateLearnerWallet,
  debitWallet,
  awardGameStars,
  creditWallet,
  createTopUpRequest,
  convertStarsToCredits,
  redeemRealVoucherCode,
  getWalletTransactions,
  OFFICIAL_CREDIT_PACKAGES,
  determineWalletTier,
} from '../lib/wallet';
import { UserWallet, EducationalGame, CreditPackage, CreditTransaction, UserProfile, TopUpRequest } from '../types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WHATSAPP_CONFIG, getWhatsAppUrl, OFFICIAL_BANK_DETAILS } from '../data/content';

interface EducationalGamesSuiteProps {
  onOpenBooking: () => void;
  onOpenAuth?: (mode?: 'signin' | 'register') => void;
  onOpenPortal?: () => void;
  currentUserProfile?: UserProfile | null;
  whatsappNumber?: string;
  externalWallet?: UserWallet | null;
}

export const EducationalGamesSuite: React.FC<EducationalGamesSuiteProps> = ({
  onOpenBooking,
  onOpenAuth,
  onOpenPortal,
  currentUserProfile,
  whatsappNumber,
  externalWallet,
}) => {
  // Wallet State
  const [wallet, setWallet] = useState<UserWallet | null>(externalWallet || null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeGame, setActiveGame] = useState<EducationalGame | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [walletModalTab, setWalletModalTab] = useState<'packages' | 'stars' | 'voucher' | 'history'>('packages');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [purchasedReceipt, setPurchasedReceipt] = useState<{ pkg: CreditPackage; ref: string } | null>(null);
  const [starsToConvert, setStarsToConvert] = useState<number>(25);
  const [starConvertMsg, setStarConvertMsg] = useState<string | null>(null);

  // Dynamic games from Firestore
  const [firestoreGames, setFirestoreGames] = useState<EducationalGame[]>([]);

  // Default core games including Child Sound Phonics game
  const defaultGames: EducationalGame[] = [
    {
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
    },
    {
      id: 'game-phonics-asteroids',
      title: '3D Phonics Asteroid Blaster',
      category: 'Phonics',
      description: 'Listen to the target phoneme sound, aim your laser reticle, and blast the correct asteroid before it passes!',
      costCredits: 5,
      rewardStars: 20,
      icon: '🚀',
      badge: 'Interactive 3D Space',
      difficulty: 'Beginner',
      mechanic: 'asteroid',
    },
    {
      id: 'game-vowel-kingdom',
      title: '3D Magical Vowel Kingdom',
      category: 'Early Reading',
      description: 'Step into 3D isometric floating stone platforms to blend consonant-vowel-consonant sounds into magic keys.',
      costCredits: 5,
      rewardStars: 20,
      icon: '🏰',
      badge: 'Spatial Isometric',
      difficulty: 'Beginner',
      mechanic: 'vowel',
    },
    {
      id: 'game-sightword-racer',
      title: 'Speed Sight-Word Reflex Racer',
      category: 'Comprehension',
      description: 'High-energy highway speed test! Listen to Teacher Ngozi pronounce sight-words and switch lanes with lightning speed.',
      costCredits: 5,
      rewardStars: 25,
      icon: '🏎️',
      badge: 'Fluency Reflexes',
      difficulty: 'Intermediate',
      mechanic: 'racer',
    },
    {
      id: 'game-vocab-mystery',
      title: '3D Vocabulary & Riddle Vault',
      category: 'Vocabulary',
      description: 'Unlock ancient treasure chests by deciphering rich adjectives, context clues, and spoken comprehension riddles.',
      costCredits: 10,
      rewardStars: 30,
      icon: '💎',
      badge: 'Advanced Literacy',
      difficulty: 'Advanced',
      mechanic: 'riddle',
    },
  ];

  // Initialize wallet on mount & keep in sync
  useEffect(() => {
    if (externalWallet) {
      setWallet(externalWallet);
    } else {
      loadWallet();
    }
  }, [externalWallet]);

  const loadWallet = async () => {
    const w = await getOrCreateLearnerWallet();
    setWallet(w);
  };

  // Real-time listener for tutor-published games in Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'games'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: EducationalGame[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as EducationalGame);
            });
            setFirestoreGames(list);
          } else {
            setFirestoreGames([]);
          }
        },
        (err) => {
          console.warn('Games listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Games listener note:', err);
    }
  }, []);

  // Load transactions when opening modal or tab switch
  useEffect(() => {
    if (topupModalOpen && wallet?.id) {
      getWalletTransactions(wallet.id).then((txns) => {
        setRecentTransactions(txns);
      });
    }
  }, [topupModalOpen, walletModalTab, wallet?.id]);

  const allGames = [...defaultGames, ...firestoreGames];

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioVoice.setMuted(next);
    if (!next) {
      audioVoice.playSuccessChime();
      audioVoice.speak('Sound and teacher voice are now active!');
    }
  };

  // Submit Real Top-Up Request Flow (Verified by Admin / WhatsApp)
  const handleSelectPackage = async (pkg: CreditPackage) => {
    if (!wallet) return;
    const payerName = currentUserProfile?.displayName || wallet.studentName || 'Parent';
    const res = await createTopUpRequest({
      walletId: wallet.id,
      packageId: pkg.id,
      packageName: pkg.name,
      credits: pkg.credits,
      bonusCredits: pkg.bonusCredits,
      totalCredits: pkg.totalCredits,
      amountNGN: pkg.priceNGN,
      amountUSD: pkg.priceUSD,
      studentName: wallet.studentName || 'Little Learner',
      parentName: payerName,
      parentEmail: currentUserProfile?.email || wallet.email || '',
      paymentMethod: 'whatsapp_desk',
      notes: 'Generated from Games Suite modal',
    });

    if (res.success && res.request) {
      audioVoice.playFanfare();
      audioVoice.speak(`Top-up order created for ${pkg.name}. Reference ${res.request.reference}. Send proof on WhatsApp to verify!`);
      setPurchasedReceipt({ pkg, ref: res.request.reference });
      const txns = await getWalletTransactions(wallet.id);
      setRecentTransactions(txns);
    } else {
      audioVoice.playErrorBuzz();
      alert(`Top-up error: ${res.error || 'Failed to submit order'}`);
    }
  };

  // Star Conversion to Real Credits
  const handleConvertStars = async () => {
    if (!wallet) return;
    setStarConvertMsg(null);
    const res = await convertStarsToCredits(wallet.id, starsToConvert);
    if (res.success) {
      audioVoice.playCoinReward();
      audioVoice.speak(`Terrific! You exchanged ${starsToConvert} stars for ${res.creditsAwarded} real game credits!`);
      setStarConvertMsg(`🌟 Exchanged ${starsToConvert} ⭐ into +${res.creditsAwarded} Play Credits!`);
      setWallet((prev) =>
        prev
          ? {
              ...prev,
              credits: res.newBalance,
              starsWon: (prev.starsWon || 0) - starsToConvert,
            }
          : null
      );
      const txns = await getWalletTransactions(wallet.id);
      setRecentTransactions(txns);
    } else {
      audioVoice.playErrorBuzz();
      setStarConvertMsg(res.error || 'Conversion failed.');
    }
  };

  // Redeem Verified Voucher / Promo code
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !promoCode.trim()) return;

    setIsRedeeming(true);
    setPromoMessage(null);
    const res = await redeemRealVoucherCode(wallet.id, promoCode);
    setIsRedeeming(false);

    if (res.success) {
      audioVoice.playCoinReward();
      audioVoice.speak(`Splendid! ${res.creditsAdded} real credits have been added to your wallet!`);
      setPromoMessage(res.message);
      setPromoCode('');
      await loadWallet();
      const txns = await getWalletTransactions(wallet.id);
      setRecentTransactions(txns);
    } else {
      audioVoice.playErrorBuzz();
      setPromoMessage(res.message);
    }
  };

  // Launch Game with Registration & Credit Check
  const handleStartGame = async (game: EducationalGame) => {
    // If not registered, prompt user to register and get +60 free credits
    if (!currentUserProfile) {
      audioVoice.playBubblePop();
      audioVoice.speak('Welcome! Please register your account to launch games and claim your 60 free welcome play credits!');
      if (onOpenAuth) {
        onOpenAuth('register');
      }
      return;
    }

    let currentWallet = wallet;
    if (!currentWallet) {
      currentWallet = await getOrCreateLearnerWallet(
        currentUserProfile.walletId,
        currentUserProfile.childName || currentUserProfile.displayName,
        currentUserProfile.email
      );
      setWallet(currentWallet);
    }

    if (currentWallet.credits < game.costCredits) {
      audioVoice.playErrorBuzz();
      audioVoice.speak('Oh! You need more credits to launch this mission. Top up your wallet or ask Teacher Ngozi!');
      setGameError(`You have ${currentWallet.credits} credits. You need ${game.costCredits} credits to play this mission.`);
      setTopupModalOpen(true);
      return;
    }

    // Debit real wallet
    const debitRes = await debitWallet(currentWallet.id, game.costCredits, `Played game: ${game.title}`);
    if (!debitRes.success) {
      setGameError(debitRes.error || 'Failed to start game');
      return;
    }

    setGameError(null);
    setWallet({ ...currentWallet, credits: debitRes.newBalance });
    setActiveGame(game);

    if (game.mechanic === 'child_sound') {
      audioVoice.playBubblePop();
      audioVoice.speakChildVoice("Hi friend! Let's play the Phonics Sound Match game together!");
    } else {
      audioVoice.playLaserShoot();
      audioVoice.speak(`Welcome to ${game.title}! Let's learn and have fun!`);
    }
  };

  return (
    <section id="activities" className="py-12 sm:py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/70 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header with Credit Wallet HUD */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>SUPERCHARGED LEARNING ARCADE</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-2 sm:mb-3">
              Interactive Educational Games with Child Voice & Sounds
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Research-backed games created to build phonics mastery, sight-word fluency, and vocabulary depth. Every game features live synthesized voice pronunciation, child-friendly audio, and playful sound effects.
            </p>
          </div>

          {/* Learner Credit Wallet HUD Card */}
          <div className="bg-white rounded-2xl border-2 border-emerald-700/20 p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between sm:justify-start gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0F1E36] text-amber-300 flex items-center justify-center shadow-xs">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Learner Credit Wallet
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-xl sm:text-3xl text-[#0F1E36]">
                    {wallet?.credits ?? 0}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#1A5336]">Credits</span>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-stone-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Stars Won
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-display font-bold text-base sm:text-xl">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{wallet?.starsWon ?? 0}</span>
                </div>
              </div>

              {/* Sound & Top-up controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2">
                <button
                  onClick={handleToggleMute}
                  className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                    isMuted
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title={isMuted ? 'Sound & Voice Muted' : 'Sound & Voice Active'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setTopupModalOpen(true)}
                  className="px-3 py-2 bg-[#1A5336] hover:bg-[#133E28] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  + Credits
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Learner Access / Registration Status Banner */}
        <div className="mb-6 p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs bg-white border-stone-200">
          {currentUserProfile ? (
            <div className="flex items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1A5336] text-amber-300 flex items-center justify-center font-bold text-xs">
                  {currentUserProfile.childName ? currentUserProfile.childName.charAt(0).toUpperCase() : '★'}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1E36]">
                    Logged in as <span>{currentUserProfile.childName || currentUserProfile.displayName}</span>
                  </p>
                  <p className="text-[11px] text-[#1A5336] font-medium">
                    All interactive games unlocked with live wallet balance: <strong>{wallet?.credits ?? 0} Credits</strong>
                  </p>
                </div>
              </div>

              {onOpenPortal && (
                <button
                  onClick={onOpenPortal}
                  className="px-3.5 py-1.5 bg-[#0F1E36] hover:bg-[#172D52] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Full Learner Portal & Sound Bank 🚀</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1E36]">
                    Exclusive Access for Registered Little Learners
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Register in 30 seconds to claim <strong>+60 Welcome Credits</strong> and start playing!
                  </p>
                </div>
              </div>

              {onOpenAuth && (
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-[#1A5336] hover:bg-[#133E28] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Register for Free (+60 Credits)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ACTIVE GAME MODAL OR IN-LINE CANVAS */}
        {activeGame ? (
          <div className="mb-12 animate-fade-in">
            <ActiveGamePlayer
              game={activeGame}
              wallet={wallet}
              onClose={() => {
                setActiveGame(null);
                loadWallet();
              }}
              onWinStars={async (stars) => {
                if (wallet) {
                  await awardGameStars(wallet.id, stars);
                  setWallet({ ...wallet, starsWon: (wallet.starsWon || 0) + stars });
                }
              }}
            />
          </div>
        ) : (
          /* Games Catalog Grid with Spatial Presentation */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
            {allGames.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between hover:shadow-lg hover:border-[#1A5336]/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl sm:text-3xl p-2.5 bg-[#FAF9F5] border border-stone-100 rounded-2xl shadow-xs group-hover:scale-110 transition-transform">
                      {g.icon}
                    </span>
                    <span className="text-[10px] font-bold text-[#1A5336] bg-[#E6F4EC] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      {g.isAiGenerated && <Cpu className="w-3 h-3 text-amber-600" />}
                      <span>{g.badge}</span>
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-[#0F1E36] mb-1.5 group-hover:text-[#1A5336] transition-colors leading-tight">
                    {g.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {g.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1 font-semibold text-amber-800 font-mono text-[11px]">
                      <Coins className="w-3 h-3 text-amber-500" />
                      <span>{g.costCredits} Cr</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>+{g.rewardStars} Stars</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartGame(g)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl shadow-xs transition-all group-hover:shadow focus:outline-none cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Game</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Value Guarantee Notice */}
        <div className="mt-8 sm:mt-12 p-5 sm:p-6 bg-white border border-stone-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#1A5336] shrink-0" />
            <div>
              <h4 className="font-display font-bold text-xs sm:text-sm md:text-base text-[#0F1E36]">
                Guaranteed Educational High Value Over Credits Spent
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                Every game provides structured phonics training, vocabulary mastery, and instant educator encouragement.
              </p>
            </div>
          </div>

          <button
            onClick={() => setTopupModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Manage Real Credit Wallet / Top Up</span>
          </button>
        </div>
      </div>

      {/* REAL CREDIT WALLET MODAL */}
      {topupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0F1E36] text-amber-400 flex items-center justify-center shadow-xs">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-[#0F1E36] flex items-center gap-2">
                    <span>Learner Credit Wallet</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      LIVE & VERIFIED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student: <strong>{wallet?.studentName || 'Young Explorer'}</strong> · ID: <span className="font-mono text-[11px]">{wallet?.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTopupModalOpen(false);
                  setPurchasedReceipt(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close wallet"
              >
                ✕
              </button>
            </div>

            {/* Live Balance Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#0F1E36] to-[#1A5336] text-white flex flex-wrap items-center justify-between gap-4 shadow-sm shrink-0">
              <div>
                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
                  Available Play Balance
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display font-black text-3xl sm:text-4xl text-amber-300">
                    {wallet?.credits ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-emerald-100">Play Credits</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/25 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-300 block">Rewards</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{wallet?.starsWon ?? 0} Stars</span>
                  </span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div>
                  <span className="text-[10px] text-slate-300 block">Learner Tier</span>
                  <span className="font-bold text-white">
                    {wallet?.tier || determineWalletTier(wallet?.credits || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl my-4 text-xs font-semibold shrink-0">
              {[
                { id: 'packages', label: 'Top-Up Packages', icon: ShoppingBag },
                { id: 'stars', label: 'Exchange Stars', icon: Star },
                { id: 'voucher', label: 'Voucher Code', icon: Gift },
                { id: 'history', label: 'Transaction History', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = walletModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setWalletModalTab(tab.id as any)}
                    className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#0F1E36] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Tab Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* TAB 1: OFFICIAL PACKAGES */}
              {walletModalTab === 'packages' && (
                <div className="space-y-4">
                  {purchasedReceipt && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs space-y-2 text-emerald-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Deposit Confirmed & Credited!</span>
                        </span>
                        <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                          REF: {purchasedReceipt.ref}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        <strong>+{purchasedReceipt.pkg.totalCredits} Credits</strong> have been added to your live wallet.
                      </p>
                      <a
                        href={getWhatsAppUrl(
                          `Hello Teacher Ngozi! I just topped up the ${purchasedReceipt.pkg.name} for ${wallet?.studentName || 'my child'} (Ref: ${purchasedReceipt.ref}). Here is my confirmation!`,
                          whatsappNumber
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-emerald-800 underline text-xs pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send Proof of Payment / Receipt on WhatsApp</span>
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {OFFICIAL_CREDIT_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          pkg.popular
                            ? 'bg-[#F2F9F5] border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                            : 'bg-white border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-display font-bold text-sm text-[#0F1E36]">
                              {pkg.name}
                            </span>
                            {pkg.badge && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  pkg.popular ? 'bg-[#1A5336] text-white' : 'bg-stone-100 text-slate-700'
                                }`}
                              >
                                {pkg.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1.5 mb-2">
                            <span className="font-display font-black text-2xl text-[#1A5336]">
                              +{pkg.totalCredits}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">Credits</span>
                            {pkg.bonusCredits > 0 && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                +{pkg.bonusCredits} Bonus
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                            {pkg.description}
                          </p>
                          <p className="text-[10px] text-[#1A5336] font-semibold mb-3">
                            🎯 {pkg.gamesEstimated}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                          <div>
                            <span className="font-display font-bold text-sm text-[#0F1E36]">
                              ₦{pkg.priceNGN.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-1">
                              (${pkg.priceUSD} / £{pkg.priceGBP})
                            </span>
                          </div>

                          <button
                            onClick={() => handleSelectPackage(pkg)}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              pkg.popular
                                ? 'bg-[#1A5336] hover:bg-[#133E28] text-white'
                                : 'bg-[#0F1E36] hover:bg-[#172D52] text-white'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Deposit Now</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#1A5336] shrink-0 mt-0.5" />
                    <span>
                      Transactions are recorded securely in your child's database ledger. Need bank transfer details or custom term invoicing? Contact Teacher Ngozi on WhatsApp.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: EXCHANGE STARS */}
              {walletModalTab === 'stars' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-600" />
                        <span>Star Rewards Converter</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-700">
                        {wallet?.starsWon ?? 0} ⭐ available
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mb-4">
                      Students earn ⭐ by completing phonics puzzles and word challenges. Exchange <strong>25 Stars</strong> for <strong>+5 Real Game Play Credits</strong>!
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {[25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setStarsToConvert(amt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            starsToConvert === amt
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-white border border-amber-200 text-slate-700 hover:bg-amber-100'
                          }`}
                        >
                          {amt} ⭐ → +{amt / 5} Credits
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleConvertStars}
                      disabled={(wallet?.starsWon || 0) < starsToConvert}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Convert {starsToConvert} Stars into +{starsToConvert / 5} Credits</span>
                    </button>

                    {starConvertMsg && (
                      <p className="text-xs font-medium text-amber-900 mt-2 text-center">
                        {starConvertMsg}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: VOUCHER CODE */}
              {walletModalTab === 'voucher' && (
                <div className="space-y-4">
                  <form onSubmit={handleRedeemCode} className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Enter Official Teacher Ngozi Voucher Code:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. NGOZI50 or LITTLELEARNER"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-slate-900 uppercase font-mono tracking-wider focus:outline-none focus:border-[#1A5336]"
                      />
                      <button
                        type="submit"
                        disabled={isRedeeming || !promoCode.trim()}
                        className="px-5 py-2.5 bg-[#1A5336] hover:bg-[#133E28] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-60"
                      >
                        {isRedeeming ? 'Validating...' : 'Redeem'}
                      </button>
                    </div>

                    {promoMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                        {promoMessage}
                      </div>
                    )}
                  </form>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-1 text-slate-600">
                    <p className="font-bold text-slate-800">Active Verified Codes for Parents:</p>
                    <p>• <strong>NGOZI50</strong>: +50 Bonus Credits for early reading</p>
                    <p>• <strong>LITTLELEARNER</strong>: +75 Bonus Credits for newly registered students</p>
                    <p>• <strong>READINGJOY</strong>: +100 Bonus Credits scholarship award</p>
                  </div>
                </div>
              )}

              {/* TAB 4: TRANSACTION LEDGER */}
              {walletModalTab === 'history' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Real-time Ledger ({recentTransactions.length} recent activities):
                  </span>

                  {recentTransactions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-stone-50 rounded-2xl border border-stone-200">
                      No transactions recorded yet. Launch a game or top-up to generate your ledger.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs hover:border-stone-300"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-bold text-slate-800 truncate">{tx.reason}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(tx.createdAt).toLocaleString()} · {tx.performedBy} {tx.reference ? `· Ref: ${tx.reference}` : ''}
                            </p>
                          </div>
                          <span
                            className={`font-mono font-bold text-xs shrink-0 ${
                              tx.amount > 0 ? 'text-emerald-700' : 'text-slate-700'
                            }`}
                          >
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-stone-200 mt-4 flex items-center justify-between gap-3 shrink-0">
              <a
                href={getWhatsAppUrl(
                  `Hello Teacher Ngozi, I have a question regarding my child's learning wallet (Wallet ID: ${wallet?.id || 'new'}).`,
                  whatsappNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#1A5336] hover:underline flex items-center gap-1"
              >
                <span>Need assistance? WhatsApp Educator</span>
              </a>

              <button
                onClick={() => {
                  setTopupModalOpen(false);
                  setPurchasedReceipt(null);
                }}
                className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ==========================================
// ACTIVE GAME RUNNER ENGINE & CHILD SOUND EXPERIENCES
// ==========================================

interface ActiveGamePlayerProps {
  game: EducationalGame;
  wallet: UserWallet | null;
  onClose: () => void;
  onWinStars: (stars: number) => Promise<void>;
}

// Child Sound questions data with child voice & cute cards
const CHILD_SOUND_QUESTIONS = [
  {
    sound: 'k',
    phonemeName: '/k/ Sound',
    targetWord: 'CAT',
    spokenChildPrompt: 'Can you find the /k/ sound? Like in /k/ /k/ Cat! Meow!',
    cardIcon: '🐱',
    options: [
      { letter: 'C', word: 'Cat', sound: '/k/', icon: '🐱', correct: true },
      { letter: 'D', word: 'Dog', sound: '/d/', icon: '🐶', correct: false },
      { letter: 'B', word: 'Ball', sound: '/b/', icon: '⚽', correct: false },
      { letter: 'M', word: 'Moon', sound: '/m/', icon: '🌙', correct: false },
    ],
    cheer: 'Yay! /k/ is for Cat! Super job!',
  },
  {
    sound: 'a',
    phonemeName: 'Short /æ/ Sound',
    targetWord: 'APPLE',
    spokenChildPrompt: 'Can you hear the /a/ sound? /a/ /a/ Apple! Yum!',
    cardIcon: '🍎',
    options: [
      { letter: 'A', word: 'Apple', sound: '/æ/', icon: '🍎', correct: true },
      { letter: 'E', word: 'Egg', sound: '/e/', icon: '🥚', correct: false },
      { letter: 'I', word: 'Igloo', sound: '/ɪ/', icon: '🧊', correct: false },
      { letter: 'O', word: 'Octopus', sound: '/ɒ/', icon: '🐙', correct: false },
    ],
    cheer: 'Awesome! A is for Apple! You are brilliant!',
  },
  {
    sound: 's',
    phonemeName: '/s/ Sound',
    targetWord: 'SUN',
    spokenChildPrompt: 'Listen carefully: /s/ /s/ Sun! Can you tap the /s/ sound?',
    cardIcon: '☀️',
    options: [
      { letter: 'S', word: 'Sun', sound: '/s/', icon: '☀️', correct: true },
      { letter: 'T', word: 'Tiger', sound: '/t/', icon: '🐯', correct: false },
      { letter: 'P', word: 'Pencil', sound: '/p/', icon: '✏️', correct: false },
      { letter: 'Z', word: 'Zebra', sound: '/z/', icon: '🦓', correct: false },
    ],
    cheer: 'Hooray! /s/ is for Sun! Shining bright!',
  },
  {
    sound: 'd',
    phonemeName: '/d/ Sound',
    targetWord: 'DOG',
    spokenChildPrompt: 'Woof woof! /d/ /d/ Dog! Which letter makes the /d/ sound?',
    cardIcon: '🐶',
    options: [
      { letter: 'D', word: 'Dog', sound: '/d/', icon: '🐶', correct: true },
      { letter: 'B', word: 'Ball', sound: '/b/', icon: '⚽', correct: false },
      { letter: 'G', word: 'Goat', sound: '/g/', icon: '🐐', correct: false },
      { letter: 'H', word: 'Hat', sound: '/h/', icon: '🎩', correct: false },
    ],
    cheer: 'High five! D is for Dog! Woof!',
  },
  {
    sound: 'r',
    phonemeName: '/r/ Sound',
    targetWord: 'ROCKET',
    spokenChildPrompt: '3, 2, 1, Zoom! /r/ /r/ Rocket! Find the /r/ sound to blast off!',
    cardIcon: '🚀',
    options: [
      { letter: 'R', word: 'Rocket', sound: '/r/', icon: '🚀', correct: true },
      { letter: 'L', word: 'Lion', sound: '/l/', icon: '🦁', correct: false },
      { letter: 'W', word: 'Water', sound: '/w/', icon: '💧', correct: false },
      { letter: 'J', word: 'Jug', sound: '/j/', icon: '🧃', correct: false },
    ],
    cheer: 'Zoom! /r/ is for Rocket! You finished the quest!',
  },
];

export const ActiveGamePlayer: React.FC<ActiveGamePlayerProps> = ({
  game,
  wallet,
  onClose,
  onWinStars,
}) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isChildSpeaking, setIsChildSpeaking] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState<string>('Hello superstar! Let’s explore this reading quest together!');
  const [highlightedClue, setHighlightedClue] = useState<string | null>(null);
  const [isClapping, setIsClapping] = useState(false);

  const isChildSoundGame = game.mechanic === 'child_sound' || game.id === 'game-child-phonics-echo';

  // Questions from AI or Asteroid defaults
  const asteroidQuestions: import('../types').GameQuestion[] = [
    {
      soundName: '/ʃ/ sound',
      instruction: 'Blast the asteroid with the /ʃ/ sound (like in "ship" 🚢)!',
      soundSpoken: 'Blast the asteroid with the sh sound, like in ship!',
      options: ['SH', 'CH', 'TH', 'PH'],
      correct: 'SH',
      hint: 'Look for S and H together! /s/ + /h/ makes the quiet /sh/ sound.',
      explanation: 'Direct hit! Splendid reading with Teacher Ngozi!',
    },
    {
      soundName: '/tʃ/ sound',
      instruction: 'Blast the asteroid with the /tʃ/ sound (like in "chair" 🪑)!',
      soundSpoken: 'Blast the asteroid with the ch sound, like in chair!',
      options: ['TH', 'CH', 'SH', 'WH'],
      correct: 'CH',
      hint: 'Look for C and H together! Like in chocolate and chair!',
      explanation: 'Superb! CH makes the jolly chair sound!',
    },
    {
      soundName: '/eɪ/ sound',
      instruction: 'Blast the asteroid with the vowel digraph /eɪ/ (like in "rain" 🌧️)!',
      soundSpoken: 'Blast the asteroid with the A-I sound, like in rain!',
      options: ['EE', 'OA', 'AI', 'OO'],
      correct: 'AI',
      hint: 'A followed by I makes the long A sound in rain and train!',
      explanation: 'Direct hit! Long A sound masterfully identified!',
    },
    {
      soundName: '/θ/ sound',
      instruction: 'Blast the asteroid with the unvoiced /θ/ sound (like in "thumb" 👍)!',
      soundSpoken: 'Blast the asteroid with the T-H sound, like in thumb!',
      options: ['CH', 'TH', 'SH', 'NG'],
      correct: 'TH',
      hint: 'T followed by H! Stick your tongue out gently: /th/!',
      explanation: 'Brilliant phonics listening with Teacher Ngozi!',
    },
  ];

  const questionsList = game.questions && game.questions.length > 0 ? game.questions : asteroidQuestions;

  // Speak prompt on round change
  useEffect(() => {
    if (gameOver) return;
    setHighlightedClue(null);

    if (isChildSoundGame) {
      const q = CHILD_SOUND_QUESTIONS[currentRound];
      if (q) {
        setTeacherMessage(`Teacher Ngozi: Listen to the child voice: "${q.spokenChildPrompt}"`);
        setIsChildSpeaking(true);
        audioVoice.speakChildVoice(q.spokenChildPrompt, () => setIsChildSpeaking(false));
      }
    } else if (game.questions && game.questions.length > 0) {
      const q = game.questions[currentRound];
      if (q?.soundSpoken) {
        setTeacherMessage(`Teacher Ngozi: "${q.soundSpoken}"`);
        setIsTeacherSpeaking(true);
        audioVoice.speakTeacherNgozi(q.soundSpoken, () => setIsTeacherSpeaking(false));
      }
    } else {
      const q = asteroidQuestions[currentRound];
      if (q) {
        setTeacherMessage(`Teacher Ngozi: "${q.soundSpoken}"`);
        setIsTeacherSpeaking(true);
        audioVoice.speakTeacherNgozi(q.soundSpoken, () => setIsTeacherSpeaking(false));
      }
    }
  }, [game, currentRound, gameOver, isChildSoundGame]);

  // Teacher Ngozi Interactive Clue Request
  const handleAskTeacherNgozi = () => {
    audioVoice.playBubblePop();
    if (isChildSoundGame) {
      const q = CHILD_SOUND_QUESTIONS[currentRound];
      const hint = `Teacher Ngozi says: Think of ${q.targetWord}! It starts with the letter ${q.sound.toUpperCase()}!`;
      setTeacherMessage(hint);
      setHighlightedClue(q.sound.toUpperCase());
      setIsTeacherSpeaking(true);
      audioVoice.speakTeacherNgozi(hint, () => setIsTeacherSpeaking(false));
    } else {
      const q = questionsList[currentRound];
      const hint = `Teacher Ngozi says: ${q.hint || `Look for the ${q.correct} sound!`}`;
      setTeacherMessage(hint);
      setHighlightedClue(q.correct);
      setIsTeacherSpeaking(true);
      audioVoice.speakTeacherNgozi(hint, () => setIsTeacherSpeaking(false));
    }
  };

  // Sound it out slowly with Teacher Ngozi
  const handleSlowPhonicsBreakdown = () => {
    audioVoice.playBubblePop();
    if (isChildSoundGame) {
      const q = CHILD_SOUND_QUESTIONS[currentRound];
      const breakdown = `Let's stretch the sounds with Teacher Ngozi: /${q.sound}/ ... /${q.sound}/ ... ${q.targetWord}!`;
      setTeacherMessage(breakdown);
      setIsTeacherSpeaking(true);
      audioVoice.speakTeacherNgozi(breakdown, () => setIsTeacherSpeaking(false));
    } else {
      const q = questionsList[currentRound];
      const breakdown = `Listen to Teacher Ngozi stretch the sound: ${q.soundName}! ${q.instruction}`;
      setTeacherMessage(breakdown);
      setIsTeacherSpeaking(true);
      audioVoice.speakTeacherNgozi(breakdown, () => setIsTeacherSpeaking(false));
    }
  };

  // Clap with Teacher
  const handleClapWithTeacher = () => {
    setIsClapping(true);
    audioVoice.playSuccessChime();
    audioVoice.playCoinReward();
    setTeacherMessage('Teacher Ngozi is clapping for you! 👏 You are brilliant!');
    setIsTeacherSpeaking(true);
    audioVoice.speakTeacherCheer('You are brilliant! Keep shining, superstar!', () => {
      setIsTeacherSpeaking(false);
      setIsClapping(false);
    });
  };

  const handleChildSoundChoice = (isCorrect: boolean, cheer: string, optionSound: string, optionWord: string) => {
    if (isCorrect) {
      audioVoice.playBubblePop();
      audioVoice.playCoinReward();
      setIsClapping(true);
      setIsChildSpeaking(true);
      setTeacherMessage(`Teacher Ngozi: ${cheer} Spectacular reading!`);
      audioVoice.speakChildCheer(cheer, () => {
        setIsChildSpeaking(false);
        setIsClapping(false);
      });
      setScore((prev) => prev + 1);

      if (currentRound + 1 < CHILD_SOUND_QUESTIONS.length) {
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
        }, 1200);
      } else {
        setTimeout(() => {
          audioVoice.playFanfare();
          const winMsg = `Hooray! What a marvelous star reader you are! You earned ${game.rewardStars} shiny stars with Teacher Ngozi!`;
          setTeacherMessage(winMsg);
          audioVoice.speakTeacherCheer(winMsg);
          onWinStars(game.rewardStars);
          setGameOver(true);
        }, 1200);
      }
    } else {
      audioVoice.playErrorBuzz();
      const retryMsg = `That was ${optionSound} for ${optionWord}! Teacher Ngozi believes in you, try again sweetheart!`;
      setTeacherMessage(retryMsg);
      audioVoice.speakChildVoice(retryMsg);
    }
  };

  const handleGenericChoice = (choice: string) => {
    const q = questionsList[currentRound];
    if (choice === q.correct) {
      audioVoice.playLaserShoot();
      audioVoice.playCoinReward();
      setIsClapping(true);
      const cheer = q.explanation || 'Splendid! That is the exact sound! Teacher Ngozi is so proud of you!';
      setTeacherMessage(`Teacher Ngozi: "${cheer}"`);
      audioVoice.speakTeacherCheer(cheer, () => setIsClapping(false));
      setScore((prev) => prev + 1);

      if (currentRound + 1 < questionsList.length) {
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
        }, 800);
      } else {
        setTimeout(() => {
          audioVoice.playFanfare();
          const winMsg = `Victory, my superstar reader! You conquered this mission with Teacher Ngozi and earned ${game.rewardStars} shiny stars!`;
          setTeacherMessage(winMsg);
          audioVoice.speakTeacherNgozi(winMsg);
          onWinStars(game.rewardStars);
          setGameOver(true);
        }, 800);
      }
    } else {
      audioVoice.playErrorBuzz();
      const encouragement = q.hint || 'Good try! Listen carefully to Teacher Ngozi and tap again!';
      setTeacherMessage(`Teacher Ngozi: "${encouragement}"`);
      audioVoice.speakTeacherNgozi(encouragement);
    }
  };

  return (
    <div className="bg-[#0B1528] text-white rounded-3xl p-3.5 sm:p-6 md:p-8 border border-slate-700 shadow-2xl relative overflow-hidden w-full max-w-full">
      {/* 3D Scene Grid Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E3A63_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Top HUD */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 sm:pb-5 border-b border-slate-800 mb-4 sm:mb-6 gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 font-bold flex items-center justify-center text-lg sm:text-xl shadow-md shrink-0">
            {game.icon || '🎮'}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm sm:text-base md:text-lg text-white truncate">
              {game.title}
            </h3>
            <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold flex items-center gap-1.5 truncate">
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isChildSpeaking || isTeacherSpeaking ? 'animate-ping' : ''}`} />
              <span>{isChildSoundGame ? '👧 Child Voice & Sounds Active' : 'Teacher Ngozi Phonics Guide Active'}</span>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          Exit Game
        </button>
      </div>

      {/* TEACHER NGOZI INTERACTIVE COMPANION BANNER (Center Stage) */}
      <div className="relative z-10 mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0F271B]/90 via-[#133A27]/80 to-[#0F2236]/90 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        {/* Animated Teacher Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#1A5336] via-emerald-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center transition-transform ${isTeacherSpeaking ? 'scale-105' : ''}`}>
              <div className="w-full h-full rounded-[14px] bg-[#0F1E36] flex items-center justify-center text-2xl sm:text-3xl select-none">
                👩🏾‍🏫
              </div>
            </div>
            {(isTeacherSpeaking || isChildSpeaking) && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0B1528] animate-pulse" />
            )}
          </div>

          <div className="text-left sm:hidden">
            <span className="text-[11px] font-bold text-amber-300 block">Teacher Ngozi</span>
            <span className="text-[10px] text-emerald-300">Live Reading Guide</span>
          </div>
        </div>

        {/* Live Teacher Speech Bubble */}
        <div className="flex-1 min-w-0 text-left">
          <div className="hidden sm:flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-amber-300">Teacher Ngozi</span>
            <span className="text-[10px] text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Interactive Audio Guide
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed bg-black/25 p-2 sm:p-2.5 rounded-xl border border-white/10 break-words">
            "{teacherMessage}"
          </p>
        </div>

        {/* Quick Teacher Interactive Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
          <button
            onClick={handleAskTeacherNgozi}
            className="px-2.5 sm:px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1 active:translate-y-0.5"
            title="Ask Teacher Ngozi for a hint"
          >
            <span>💡 Teacher Clue</span>
          </button>

          <button
            onClick={handleSlowPhonicsBreakdown}
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1 active:translate-y-0.5"
            title="Listen to phonics breakdown"
          >
            <Music className="w-3 h-3 text-amber-300" />
            <span>Sound Out</span>
          </button>

          <button
            onClick={handleClapWithTeacher}
            className="px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 active:translate-y-0.5"
            title="Clap with Teacher Ngozi"
          >
            <span>👏 Cheer</span>
          </button>
        </div>
      </div>

      {/* GAME OVER CARD */}
      {gameOver ? (
        <div className="relative z-10 py-6 sm:py-10 text-center max-w-md mx-auto animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-4 border border-amber-400/40 animate-bounce">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h4 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">
            {isChildSoundGame ? '🌟 Phonics Superstar!' : 'Mission Accomplished!'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Spectacular work with Teacher Ngozi! You mastered these phonics sounds with joyful accuracy.
          </p>

          <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 mb-6 flex items-center justify-around">
            <div>
              <span className="text-xs text-slate-400 block">Stars Won</span>
              <span className="font-display font-bold text-xl sm:text-2xl text-amber-400">+{game.rewardStars} ⭐</span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <span className="text-xs text-slate-400 block">Wallet Balance</span>
              <span className="font-display font-bold text-xl sm:text-2xl text-emerald-400">
                {(wallet?.credits ?? 0)} Credits
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl transition-all shadow-[0_6px_0_#0f5132] active:translate-y-1.5 active:shadow-none cursor-pointer"
          >
            Play Another Game
          </button>
        </div>
      ) : isChildSoundGame ? (
        /* SPECIAL CHILD SOUND & PHONICS ECHO MATCH INTERFACE */
        <div className="relative z-10 max-w-3xl mx-auto text-center py-1 sm:py-3">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 tracking-wider uppercase bg-amber-950/60 border border-amber-500/30 px-3 py-0.5 rounded-full">
                Round {currentRound + 1} of {CHILD_SOUND_QUESTIONS.length}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                Target: {CHILD_SOUND_QUESTIONS[currentRound].phonemeName}
              </span>
            </div>

            <h4 className="font-display font-bold text-lg sm:text-2xl md:text-3xl text-white mb-2 leading-tight">
              {CHILD_SOUND_QUESTIONS[currentRound].spokenChildPrompt}
            </h4>

            {/* Child Audio Prompt Buttons */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 flex-wrap">
              <button
                onClick={() => {
                  const q = CHILD_SOUND_QUESTIONS[currentRound];
                  setIsChildSpeaking(true);
                  audioVoice.speakChildVoice(q.spokenChildPrompt, () => setIsChildSpeaking(false));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-[0_4px_0_#92400e] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Sound Again</span>
              </button>

              <button
                onClick={() => {
                  const q = CHILD_SOUND_QUESTIONS[currentRound];
                  setIsChildSpeaking(true);
                  audioVoice.speakChildPhonics(q.sound, q.targetWord, () => setIsChildSpeaking(false));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer active:translate-y-0.5"
              >
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>Slow Phonics</span>
              </button>
            </div>
          </div>

          {/* Child Phonics Cards Grid with 3D tactile depth */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 my-4 sm:my-6">
            {CHILD_SOUND_QUESTIONS[currentRound].options.map((opt) => {
              const isClueMatch = highlightedClue && (opt.letter === highlightedClue || opt.sound.toUpperCase().includes(highlightedClue));
              return (
                <button
                  key={opt.letter}
                  onClick={() =>
                    handleChildSoundChoice(
                      opt.correct,
                      CHILD_SOUND_QUESTIONS[currentRound].cheer,
                      opt.sound,
                      opt.word
                    )
                  }
                  className={`group relative rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 transition-all duration-150 flex flex-col items-center justify-between p-3.5 sm:p-5 cursor-pointer select-none ${
                    isClueMatch
                      ? 'border-amber-400 shadow-[0_8px_0_#d97706] ring-4 ring-amber-400/40 -translate-y-1'
                      : 'border-slate-700 hover:border-amber-400 shadow-[0_6px_0_#0f172a] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_1px_0_#0f172a]'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl block mb-1 sm:mb-2 group-hover:scale-110 transition-transform drop-shadow-sm">
                    {opt.icon}
                  </span>

                  <div className="text-center my-1">
                    <span className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide block group-hover:text-amber-300">
                      {opt.letter}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold block">{opt.word}</span>
                    <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">{opt.sound} sound</span>
                  </div>

                  <div className="mt-2 w-full py-1.5 bg-slate-700/60 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-300 rounded-xl text-[10px] font-bold uppercase transition-colors">
                    Tap Sound
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400">
            Score: {score} / {CHILD_SOUND_QUESTIONS.length} sounds mastered 🌟
          </p>
        </div>
      ) : (
        /* STANDARD QUESTIONS INTERFACE WITH 3D TACTILE CARDS */
        <div className="relative z-10 max-w-2xl mx-auto text-center py-1 sm:py-3">
          <div className="mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 tracking-wider uppercase block mb-1">
              Round {currentRound + 1} of {questionsList.length}
            </span>
            <p className="font-display font-bold text-base sm:text-xl md:text-2xl text-white mb-2 leading-tight">
              {questionsList[currentRound]?.instruction}
            </p>
            <button
              onClick={() => {
                if (questionsList[currentRound]?.soundSpoken) {
                  audioVoice.speak(questionsList[currentRound].soundSpoken);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer active:translate-y-0.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Hear Voice Prompt Again</span>
            </button>
          </div>

          {/* 3D Floating Target Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 my-4 sm:my-6">
            {questionsList[currentRound]?.options.map((opt) => {
              const isClueMatch = highlightedClue && opt === highlightedClue;
              return (
                <button
                  key={opt}
                  onClick={() => handleGenericChoice(opt)}
                  className={`group relative aspect-auto sm:aspect-square rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 transition-all duration-150 flex flex-col items-center justify-center p-3.5 sm:p-5 select-none cursor-pointer ${
                    isClueMatch
                      ? 'border-amber-400 shadow-[0_8px_0_#d97706] ring-4 ring-amber-400/40 -translate-y-1'
                      : 'border-slate-700 hover:border-amber-400 shadow-[0_6px_0_#0f172a] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_1px_0_#0f172a]'
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 group-hover:bg-amber-400 group-hover:text-slate-900 text-amber-300 font-bold text-xs flex items-center justify-center mb-1.5 sm:mb-2 transition-colors">
                    🎯
                  </div>
                  <span className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white tracking-wider group-hover:text-amber-300 transition-colors break-words text-center">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400">
            Progress: {score} / {questionsList.length} rounds cleared
          </p>
        </div>
      )}
    </div>
  );
};
