export interface Program {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetAge: string;
  highlights: string[];
  sessionLength: string;
  image: string;
  badge?: string;
  isSpecial?: boolean;
}

export interface ResourceArticle {
  id: string;
  title: string;
  category: 'Phonics' | 'Early Reading' | 'Literacy' | 'Parent Guide';
  readTime: string;
  summary: string;
  fullContent: string[];
  keyTakeaways: string[];
}

export interface BookingFormData {
  parentName: string;
  childName: string;
  childAge: string;
  currentClass: string;
  learningArea: string;
  preferredSchedule: string;
  whatsappNumber: string;
  email: string;
  message: string;
}

export interface HeroSlide {
  id: string;
  headline: string;
  subtitle: string;
  kicker: string;
  imageUrl: string;
  ctaText: string;
  ctaAction: 'booking' | 'programs' | 'activities';
  order?: number;
}

export interface BookingRecord extends BookingFormData {
  id: string;
  status: 'new' | 'contacted' | 'scheduled' | 'completed';
  createdAt: string;
  emailSentToParent?: boolean;
  emailSentToEducator?: boolean;
  emailSentAt?: string;
  emailError?: string;
}

export interface TopUpRequest {
  id: string;
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
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  priceNGN: number;
  priceUSD: number;
  priceGBP: number;
  badge?: string;
  popular?: boolean;
  description: string;
  gamesEstimated: string;
}

export interface UserWallet {
  id: string;
  studentName: string;
  email: string;
  credits: number;
  starsWon: number;
  gamesPlayed: number;
  tier?: 'Free Starter' | 'Silver Explorer' | 'Gold Scholar' | 'VIP Master';
  totalDeposited?: number;
  currency?: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  childName?: string;
  childAge?: string;
  phone?: string;
  learningFocus?: string;
  preferredSchedule?: string;
  masteredSounds?: string[];
  role: 'admin' | 'parent';
  walletId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreditTransaction {
  id: string;
  walletId: string;
  amount: number; // positive = credit, negative = debit
  reason: string;
  performedBy: string;
  type?: 'topup' | 'game_play' | 'star_reward' | 'bonus' | 'lesson_credit' | 'code_redemption';
  reference?: string;
  createdAt: string;
}

export interface GameQuestion {
  soundName?: string;
  instruction: string;
  soundSpoken: string;
  options: string[];
  correct: string;
  hint?: string;
  explanation?: string;
}

export interface EducationalGame {
  id: string;
  title: string;
  category: 'Phonics' | 'Early Reading' | 'Vocabulary' | 'Comprehension';
  description: string;
  costCredits: number;
  rewardStars: number;
  icon: string;
  badge: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  mechanic?: 'asteroid' | 'vowel' | 'racer' | 'riddle' | 'quiz' | 'adventure' | 'child_sound';
  questions?: GameQuestion[];
  isAiGenerated?: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  supportEmail: string;
  announcement?: string;
  tutorPhotoUrl?: string;
  tutorTitle?: string;
  tutorBio?: string;
  updatedAt?: string;
}
