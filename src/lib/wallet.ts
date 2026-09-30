import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { UserWallet, CreditTransaction, CreditPackage, TopUpRequest } from '../types';

const LOCAL_STORAGE_WALLET_KEY = 'teachers_ngozi_learner_wallet_id';

export const INITIAL_WELCOME_CREDITS = 60; // Initial welcome gift for newly registered students

// Real Official Credit Packages
export const OFFICIAL_CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg-starter',
    name: 'Starter Practice Pack',
    credits: 100,
    bonusCredits: 20,
    totalCredits: 120,
    priceNGN: 4500,
    priceUSD: 5,
    priceGBP: 4,
    badge: 'Popular for Beginners',
    popular: false,
    description: 'Perfect for 24+ game sessions, sound blending drills, and phonics challenges.',
    gamesEstimated: '~24 Interactive Game Plays',
  },
  {
    id: 'pkg-booster',
    name: 'Phonics Booster Pack',
    credits: 250,
    bonusCredits: 60,
    totalCredits: 310,
    priceNGN: 9500,
    priceUSD: 10,
    priceGBP: 8,
    badge: 'Best Value ⭐',
    popular: true,
    description: 'Great for weekly phonics and sight-word training with Teacher Ngozi.',
    gamesEstimated: '~62 Interactive Game Plays',
  },
  {
    id: 'pkg-scholar',
    name: 'Term Literacy Mastery Pack',
    credits: 600,
    bonusCredits: 180,
    totalCredits: 780,
    priceNGN: 22000,
    priceUSD: 24,
    priceGBP: 19,
    badge: 'Full Term Access',
    popular: false,
    description: 'Covers comprehensive phonics, 3D games, reading comprehension, and AI custom quizzes.',
    gamesEstimated: '~156 Interactive Game Plays',
  },
  {
    id: 'pkg-vip',
    name: 'VIP Little Learner Unlimited Pack',
    credits: 1500,
    bonusCredits: 500,
    totalCredits: 2000,
    priceNGN: 48000,
    priceUSD: 50,
    priceGBP: 40,
    badge: 'VIP Top-tier',
    popular: false,
    description: 'Unlimited access for multiple children or extensive tutoring term practice.',
    gamesEstimated: '~400+ Interactive Game Plays',
  },
];

// Helper to determine tier based on credits or lifetime deposit
export function determineWalletTier(credits: number): 'Free Starter' | 'Silver Explorer' | 'Gold Scholar' | 'VIP Master' {
  if (credits >= 1000) return 'VIP Master';
  if (credits >= 300) return 'Gold Scholar';
  if (credits >= 100) return 'Silver Explorer';
  return 'Free Starter';
}

export async function getOrCreateLearnerWallet(
  specifiedId?: string,
  studentName?: string,
  email?: string
): Promise<UserWallet> {
  let walletId = specifiedId;
  if (!walletId && typeof window !== 'undefined') {
    walletId = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY) || undefined;
  }

  if (!walletId) {
    walletId = `wallet-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, walletId);
    }
  }

  try {
    const walletRef = doc(db, 'wallets', walletId);
    const snap = await getDoc(walletRef);

    if (snap.exists()) {
      const data = snap.data() as UserWallet;
      return {
        ...data,
        tier: data.tier || determineWalletTier(data.credits),
      };
    } else {
      // Create new verified wallet in Firestore
      const newWallet: UserWallet = {
        id: walletId,
        studentName: studentName || 'Young Explorer',
        email: email || '',
        credits: INITIAL_WELCOME_CREDITS,
        starsWon: 0,
        gamesPlayed: 0,
        tier: 'Free Starter',
        totalDeposited: 0,
        currency: 'NGN',
        updatedAt: new Date().toISOString(),
      };

      await setDoc(walletRef, newWallet);

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        walletId,
        amount: INITIAL_WELCOME_CREDITS,
        reason: 'Welcome Gift: Free Learning Play Credits',
        performedBy: 'system',
        type: 'bonus',
        reference: `WELCOME-${walletId.slice(-6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      });

      return newWallet;
    }
  } catch (error) {
    console.warn('Wallet fetch/create note:', error);
    return {
      id: walletId,
      studentName: studentName || 'Young Explorer',
      email: email || '',
      credits: INITIAL_WELCOME_CREDITS,
      starsWon: 0,
      gamesPlayed: 0,
      tier: 'Free Starter',
      totalDeposited: 0,
      currency: 'NGN',
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function getWalletTransactions(walletId: string): Promise<CreditTransaction[]> {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('walletId', '==', walletId),
      orderBy('createdAt', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    const list: CreditTransaction[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as CreditTransaction);
    });
    return list;
  } catch (err) {
    console.warn('Get transactions note:', err);
    return [];
  }
}

// Create a Verified Top-Up Order (Submitted by Parent, Verified by Admin)
export async function createTopUpRequest(data: {
  walletId: string;
  packageId: string;
  packageName: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  amountNGN: number;
  amountUSD: number;
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  paymentMethod: 'bank_transfer' | 'whatsapp_desk' | 'card_gateway';
  notes?: string;
}): Promise<{ success: boolean; request?: TopUpRequest; error?: string }> {
  try {
    const reference = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const docRef = await addDoc(collection(db, 'topup_requests'), {
      ...data,
      reference,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    const request: TopUpRequest = {
      id: docRef.id,
      ...data,
      reference,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return { success: true, request };
  } catch (err: any) {
    console.error('Create top-up request error:', err);
    return { success: false, error: err.message || 'Failed to submit top-up request' };
  }
}

// Admin Approval of Top-Up Order -> Credits Wallet & Logs Transaction
export async function approveTopUpRequest(
  order: TopUpRequest,
  adminName: string = 'Teacher Ngozi (Admin)'
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // 1. Credit the wallet
    const creditRes = await creditWallet(
      order.walletId,
      order.totalCredits,
      `Official Top-Up Deposit Approved: ${order.packageName} (Ref: ${order.reference}) - Paid by ${order.parentName}`,
      adminName,
      'topup',
      order.reference
    );

    if (!creditRes.success) {
      return { success: false, newBalance: 0, error: 'Failed to update wallet balance' };
    }

    // 2. Update wallet total deposited
    const walletRef = doc(db, 'wallets', order.walletId);
    const snap = await getDoc(walletRef);
    if (snap.exists()) {
      const wData = snap.data() as UserWallet;
      const newTotal = (wData.totalDeposited || 0) + (order.amountNGN || 0);
      await setDoc(walletRef, { totalDeposited: newTotal }, { merge: true });
    }

    // 3. Mark top-up order as approved
    const orderRef = doc(db, 'topup_requests', order.id);
    await setDoc(
      orderRef,
      {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: adminName,
      },
      { merge: true }
    );

    return { success: true, newBalance: creditRes.newBalance };
  } catch (err: any) {
    console.error('Approve top-up error:', err);
    return { success: false, newBalance: 0, error: err.message };
  }
}

// Admin Rejection of Top-Up Order
export async function rejectTopUpRequest(
  orderId: string,
  adminName: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, 'topup_requests', orderId);
    await setDoc(
      orderRef,
      {
        status: 'rejected',
        notes: notes || 'Declined or unverified payment',
        approvedAt: new Date().toISOString(),
        approvedBy: adminName,
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Fetch Top-Up Orders for Parent or Admin
export async function getTopUpRequests(walletId?: string): Promise<TopUpRequest[]> {
  try {
    let q;
    if (walletId) {
      q = query(
        collection(db, 'topup_requests'),
        where('walletId', '==', walletId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    } else {
      q = query(collection(db, 'topup_requests'), orderBy('createdAt', 'desc'), limit(50));
    }
    const snap = await getDocs(q);
    const list: TopUpRequest[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as TopUpRequest);
    });
    return list;
  } catch (err) {
    console.warn('Fetch top-up requests note:', err);
    return [];
  }
}

export async function purchaseCreditPackage(
  walletId: string,
  pkg: CreditPackage,
  payerName: string,
  paymentRef?: string
): Promise<{ success: boolean; newBalance: number; reference: string; error?: string }> {
  const reference = paymentRef || `TOPUP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  try {
    const walletRef = doc(db, 'wallets', walletId);
    const snap = await getDoc(walletRef);
    let currentCredits = 0;
    let currentTotalDeposited = 0;

    if (snap.exists()) {
      const wData = snap.data() as UserWallet;
      currentCredits = wData.credits || 0;
      currentTotalDeposited = wData.totalDeposited || 0;
    }

    const newBalance = currentCredits + pkg.totalCredits;
    const newTotalDeposited = currentTotalDeposited + pkg.priceNGN;
    const newTier = determineWalletTier(newBalance);

    await setDoc(
      walletRef,
      {
        id: walletId,
        credits: newBalance,
        totalDeposited: newTotalDeposited,
        tier: newTier,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Record verified transaction in Firestore
    await addDoc(collection(db, 'transactions'), {
      walletId,
      amount: pkg.totalCredits,
      reason: `Package Purchase: ${pkg.name} (+${pkg.bonusCredits} bonus) - Paid by ${payerName}`,
      performedBy: payerName || 'parent',
      type: 'topup',
      reference,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      newBalance,
      reference,
    };
  } catch (error: any) {
    console.error('Package purchase error:', error);
    return {
      success: false,
      newBalance: 0,
      reference,
      error: error.message || 'Payment recording failed',
    };
  }
}

export async function convertStarsToCredits(
  walletId: string,
  starsToConvert: number
): Promise<{ success: boolean; newBalance: number; creditsAwarded: number; error?: string }> {
  if (starsToConvert < 25) {
    return { success: false, newBalance: 0, creditsAwarded: 0, error: 'Minimum conversion is 25 stars' };
  }

  // Conversion rate: 25 stars = 5 credits (5 stars = 1 credit)
  const creditsAwarded = Math.floor(starsToConvert / 5);

  try {
    const walletRef = doc(db, 'wallets', walletId);
    const snap = await getDoc(walletRef);

    if (!snap.exists()) {
      return { success: false, newBalance: 0, creditsAwarded: 0, error: 'Wallet not found' };
    }

    const current = snap.data() as UserWallet;
    if ((current.starsWon || 0) < starsToConvert) {
      return {
        success: false,
        newBalance: current.credits,
        creditsAwarded: 0,
        error: `Not enough stars. You have ${current.starsWon || 0} ⭐.`,
      };
    }

    const newStars = (current.starsWon || 0) - starsToConvert;
    const newCredits = (current.credits || 0) + creditsAwarded;

    await setDoc(
      walletRef,
      {
        starsWon: newStars,
        credits: newCredits,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await addDoc(collection(db, 'transactions'), {
      walletId,
      amount: creditsAwarded,
      reason: `Star Exchange: Converted ${starsToConvert} ⭐ into +${creditsAwarded} Game Credits`,
      performedBy: 'learner',
      type: 'star_reward',
      reference: `STARS-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      newBalance: newCredits,
      creditsAwarded,
    };
  } catch (err: any) {
    return { success: false, newBalance: 0, creditsAwarded: 0, error: err.message };
  }
}

export async function redeemRealVoucherCode(
  walletId: string,
  rawCode: string
): Promise<{ success: boolean; creditsAdded: number; message: string }> {
  const code = rawCode.trim().toUpperCase();

  const VALID_CODES: Record<string, { credits: number; name: string }> = {
    'NGOZI50': { credits: 50, name: 'Teacher Ngozi Study Bonus' },
    'LITTLELEARNER': { credits: 75, name: 'New Little Learner Voucher' },
    'PHONICS2026': { credits: 60, name: 'Phonics Explorer Special' },
    'READINGJOY': { credits: 100, name: 'Reading Joy Scholarship Bonus' },
    'EXCELLENCE': { credits: 120, name: 'Academic Excellence Award' },
  };

  const voucher = VALID_CODES[code];
  if (!voucher) {
    return {
      success: false,
      creditsAdded: 0,
      message: 'Invalid code. Check your voucher spelling or contact Teacher Ngozi on WhatsApp.',
    };
  }

  try {
    const walletRef = doc(db, 'wallets', walletId);
    const snap = await getDoc(walletRef);

    if (!snap.exists()) {
      return { success: false, creditsAdded: 0, message: 'Wallet not found' };
    }

    const current = snap.data() as UserWallet;
    const newBalance = (current.credits || 0) + voucher.credits;

    await setDoc(
      walletRef,
      {
        credits: newBalance,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await addDoc(collection(db, 'transactions'), {
      walletId,
      amount: voucher.credits,
      reason: `Voucher Code: ${code} (${voucher.name})`,
      performedBy: 'parent',
      type: 'code_redemption',
      reference: `CODE-${code}-${walletId.slice(-4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      creditsAdded: voucher.credits,
      message: `🎉 Success! +${voucher.credits} credits added via ${voucher.name}!`,
    };
  } catch (err: any) {
    return {
      success: false,
      creditsAdded: 0,
      message: `Could not redeem: ${err.message}`,
    };
  }
}

export async function debitWallet(
  walletId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const walletRef = doc(db, 'wallets', walletId);
    const snap = await getDoc(walletRef);

    if (!snap.exists()) {
      return { success: false, newBalance: 0, error: 'Wallet not found' };
    }

    const current = snap.data() as UserWallet;
    if (current.credits < amount) {
      return {
        success: false,
        newBalance: current.credits,
        error: `Insufficient credits. You need ${amount} credits, but currently have ${current.credits}.`,
      };
    }

    const updatedCredits = current.credits - amount;
    const updatedGamesPlayed = (current.gamesPlayed || 0) + 1;

    await setDoc(
      walletRef,
      {
        credits: updatedCredits,
        gamesPlayed: updatedGamesPlayed,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Record debit transaction
    await addDoc(collection(db, 'transactions'), {
      walletId,
      amount: -amount,
      reason,
      performedBy: 'learner',
      type: 'game_play',
      createdAt: new Date().toISOString(),
    });

    return { success: true, newBalance: updatedCredits };
  } catch (error: any) {
    console.warn('Debit wallet error:', error);
    return { success: false, newBalance: 0, error: error.message || 'Debit failed' };
  }
}

export async function creditWallet(
  walletId: string,
  amount: number,
  reason: string,
  performedBy: string = 'admin',
  type: 'topup' | 'lesson_credit' | 'bonus' | 'star_reward' = 'bonus',
  reference?: string
): Promise<{ success: boolean; newBalance: number }> {
  try {
    const walletRef = doc(db, 'wallets', walletId);
    const snap = await getDoc(walletRef);

    let currentCredits = 0;
    if (snap.exists()) {
      currentCredits = (snap.data() as UserWallet).credits || 0;
    }

    const newBalance = Math.max(0, currentCredits + amount);
    const newTier = determineWalletTier(newBalance);

    await setDoc(
      walletRef,
      {
        id: walletId,
        credits: newBalance,
        tier: newTier,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Record transaction
    await addDoc(collection(db, 'transactions'), {
      walletId,
      amount,
      reason,
      performedBy,
      type,
      reference: reference || `CRED-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Credit wallet error:', error);
    return { success: false, newBalance: 0 };
  }
}

export async function awardGameStars(
  walletId: string,
  starsToAdd: number
): Promise<void> {
  try {
    const walletRef = doc(db, 'wallets', walletId);
    const snap = await getDoc(walletRef);
    if (snap.exists()) {
      const current = snap.data() as UserWallet;
      await setDoc(
        walletRef,
        {
          starsWon: (current.starsWon || 0) + starsToAdd,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Stars award error:', err);
  }
}
