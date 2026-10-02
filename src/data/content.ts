import { Program, ResourceArticle, HeroSlide } from '../types';
import heroYoungLearnerImg from '../assets/images/hero_young_learner_1790773088166.jpg';
import phonicsCardImg from '../assets/images/phonics_reading_card_1790773103393.jpg';
import onlineSessionImg from '../assets/images/online_learning_session_1790773117016.jpg';
import storyCornerImg from '../assets/images/story_reading_corner_1790773128394.jpg';

export const APP_IMAGES = {
  heroYoungLearner: heroYoungLearnerImg,
  phonicsCard: phonicsCardImg,
  onlineSession: onlineSessionImg,
  storyCorner: storyCornerImg,
};

export const LOCAL_IMAGES: Record<string, string> = {
  '/src/assets/images/hero_young_learner_1790773088166.jpg': heroYoungLearnerImg,
  '/src/assets/images/phonics_reading_card_1790773103393.jpg': phonicsCardImg,
  '/src/assets/images/online_learning_session_1790773117016.jpg': onlineSessionImg,
  '/src/assets/images/story_reading_corner_1790773128394.jpg': storyCornerImg,
};

export function resolveImageUrl(url?: string): string {
  if (!url) return heroYoungLearnerImg;
  if (LOCAL_IMAGES[url]) return LOCAL_IMAGES[url];
  if (url.includes('hero_young_learner')) return heroYoungLearnerImg;
  if (url.includes('phonics_reading_card')) return phonicsCardImg;
  if (url.includes('online_learning_session')) return onlineSessionImg;
  if (url.includes('story_reading_corner')) return storyCornerImg;
  return url;
}

export const WHATSAPP_CONFIG = {
  displayNumber: '+234 806 092 7203',
  cleanNumber: '2348060927203',
  defaultGreeting: 'Hello Teacher Ngozi, I would like to enquire about lessons for my child at Teachers Ngozi Little Learners.',
};

export const OFFICIAL_BANK_DETAILS = {
  bankName: 'Access Bank Plc / Zenith Bank',
  accountName: 'Teachers Ngozi Literacy & Phonics Hub',
  accountNumber: '0123456789',
  referencePrefix: 'ORD-NGOZI',
  supportWhatsApp: '+234 806 092 7203',
  supportEmail: 'ngokonkwo2020@gmail.com',
};

export function getWhatsAppUrl(customMessage?: string, overrideNumber?: string): string {
  const number = (overrideNumber || WHATSAPP_CONFIG.cleanNumber).replace(/[^0-9]/g, '');
  const text = encodeURIComponent(customMessage || WHATSAPP_CONFIG.defaultGreeting);
  return `https://wa.me/${number || WHATSAPP_CONFIG.cleanNumber}?text=${text}`;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    headline: 'Helping Little Learners Build Strong Foundations for a Brighter Future',
    subtitle: 'Engaging online English, literacy, phonics and early-reading lessons designed to help children learn with confidence.',
    kicker: 'ONLINE LEARNING FOR AGES 3–12 · PHONICS & EARLY LITERACY · 1-ON-1 & GROUPS',
    imageUrl: heroYoungLearnerImg,
    ctaText: 'Book a Trial Lesson',
    ctaAction: 'booking',
    order: 1,
  },
  {
    id: 'slide-2',
    headline: 'Unlocking Early Reading Through Joyful Phonics Foundations',
    subtitle: 'Step-by-step sound blending, clear pronunciation, and personalized support that turns hesitant learners into enthusiastic readers.',
    kicker: 'EARLY READING MASTERY · SOUND BLENDING & DECODING · AGES 3–7',
    imageUrl: phonicsCardImg,
    ctaText: 'Explore Phonics Programs',
    ctaAction: 'programs',
    order: 2,
  },
  {
    id: 'slide-3',
    headline: 'Interactive Virtual Classrooms Where Children Flourish',
    subtitle: 'Small groups and 1-on-1 sessions designed with modern digital pedagogy, engaging word games, and compassionate educator guidance.',
    kicker: 'CONFIDENT COMMUNICATION · LITERACY COMPREHENSION · AGES 5–12',
    imageUrl: onlineSessionImg,
    ctaText: 'Try Interactive Activities',
    ctaAction: 'activities',
    order: 3,
  },
];


export const PROGRAMS_DATA: Program[] = [
  {
    id: 'english-literacy',
    title: 'English & Literacy',
    subtitle: 'Mastering Language, Expression & Comprehension',
    description:
      'Help children strengthen essential vocabulary, grammar, comprehension, creative writing, and verbal communication skills through structured, engaging activities.',
    targetAge: 'Ages 5–12',
    sessionLength: '45–60 mins',
    highlights: [
      'Vocabulary expansion & contextual word usage',
      'Grammar fundamentals & correct sentence structuring',
      'Reading comprehension & analytical thinking',
      'Expressive creative writing & story building',
      'Confident spoken English & verbal articulation',
    ],
    image: onlineSessionImg,
  },
  {
    id: 'phonics-early-reading',
    title: 'Phonics & Early Reading',
    subtitle: 'Cracking the Code of Letters and Sounds',
    description:
      'Build rock-solid phonics foundations and help young learners develop systematic decoding, clear pronunciation, blending, and joyful early-reading habits.',
    targetAge: 'Ages 3–7',
    sessionLength: '30–45 mins',
    highlights: [
      'Letter-sound correspondences & phonemic awareness',
      'Blending and segmenting CVC and complex words',
      'Sight word recognition without rote memorisation',
      'Clear pronunciation & expressive speaking',
      'Transition from sounds to independent sentence reading',
    ],
    image: phonicsCardImg,
  },
  {
    id: 'reading-support',
    title: 'Reading Support',
    subtitle: 'Nurturing Fluency, Comprehension & Confidence',
    description:
      'Develop reading fluency, deep comprehension, rich vocabulary, and enthusiastic reading habits through guided shared reading and interactive story discussions.',
    targetAge: 'Ages 5–11',
    sessionLength: '45 mins',
    highlights: [
      'Pacing, tone, and expressive reading fluency',
      'Overcoming hesitation and reading anxiety',
      'Deepening story comprehension & character analysis',
      'Fostering a genuine, self-driven love for books',
      'Parental reading guidance & at-home reading routines',
    ],
    image: storyCornerImg,
  },
  {
    id: 'personalised-online-learning',
    title: 'Personalised Online Learning',
    subtitle: 'Tailored 1-on-1 & Small Group Curriculum',
    description:
      'Targeted lessons meticulously adapted to each learner’s individual age, current school level, specific learning gaps, and personal milestones.',
    targetAge: 'Ages 3–12',
    sessionLength: 'Flexible (30 / 45 / 60 mins)',
    highlights: [
      'Initial baseline learning assessment',
      'Customized pacing matching child’s attention and style',
      'Reinforcement of school curriculum or homeschool support',
      'Regular transparent parent progress check-ins',
      'Interactive digital manipulatives and gamified exercises',
    ],
    image: heroYoungLearnerImg,
  },
  {
    id: 'igbo-language-learning',
    title: 'Igbo Language Learning for Children',
    subtitle: 'Cultural Heritage, Conversational Basics & Pride',
    description:
      'An enriching language module introducing young children to basic Igbo vocabulary, greetings, numbers, songs, and cultural communication in a friendly, supportive setting.',
    targetAge: 'Ages 4–12',
    sessionLength: '30–45 mins',
    highlights: [
      'Everyday greetings and polite expressions (Ekele)',
      'Numbers, colours, family members, and common objects',
      'Child-friendly traditional folk rhymes & storytelling',
      'Conversational confidence and heritage connection',
      'Supportive environment for diaspora and bilingual families',
    ],
    image: phonicsCardImg,
    isSpecial: true,
  },
];

export const WHY_CHOOSE_US_DATA = [
  {
    number: '01',
    title: 'Child-Centred Learning',
    description:
      'Every child learns differently. Lessons adapt directly to your child’s temperament, natural interests, and learning speed rather than forcing a rigid one-size-fits-all syllabus.',
  },
  {
    number: '02',
    title: 'Engaging & Interactive Lessons',
    description:
      'Virtual learning is never passive screen time. Through purposeful digital manipulatives, interactive reading, and cheerful participation, children stay enthusiastic throughout.',
  },
  {
    number: '03',
    title: 'Personalised Support',
    description:
      'We identify specific phonetic stumbling blocks or comprehension hurdles early, giving your child the dedicated attention needed to master each skill before moving forward.',
  },
  {
    number: '04',
    title: 'Strong Literacy Foundations',
    description:
      'We emphasize systematic phonics, structured vocabulary building, and sentence mastery—essential building blocks that support academic excellence across all subjects.',
  },
  {
    number: '05',
    title: 'Confidence-Building Approach',
    description:
      'A calm, encouraging space where children feel safe making mistakes, asking questions, and discovering their authentic voice without pressure or fear of judgment.',
  },
  {
    number: '06',
    title: 'Flexible Online Learning',
    description:
      'High-quality education delivered directly to your home. Save travel time and coordinate sessions that harmonize smoothly with your family’s routine and time zone.',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Enquire',
    summary: "Tell us about your child's age, class, and learning needs.",
    detail:
      'Fill out our simple form or send a message directly on WhatsApp. Share any specific areas where your child needs extra encouragement or accelerated practice.',
  },
  {
    step: '02',
    title: 'Choose a Learning Option',
    summary: 'Select the programme that best suits your child’s needs.',
    detail:
      'We help you match your learner with the right focus area—whether phonics foundations, reading fluency, general literacy, or a tailored 1-on-1 schedule.',
  },
  {
    step: '03',
    title: 'Meet the Educator',
    summary: 'Begin with an introductory/trial lesson where appropriate.',
    detail:
      'Your child meets Teacher Ngozi in a warm, welcoming online environment where we assess their comfort level, learning style, and foundational readiness.',
  },
  {
    step: '04',
    title: 'Watch Your Little Learner Grow',
    summary: 'Continue with structured lessons and ongoing learning support.',
    detail:
      'Experience noticeable improvements in reading confidence, vocabulary, and enthusiasm, backed by regular feedback updates for parents.',
  },
];

export const EDUCATOR_DATA = {
  name: 'Teacher Ngozi',
  role: 'Certified Digital Educator & EduConsultant',
  shortBio:
    'Dedicated to nurturing confident, capable young minds through child-centred teaching and modern digital pedagogy. Specialising in early English, phonics, and literacy development, Teacher Ngozi creates an inspiring virtual space where children feel valued, supported, and motivated to excel.',
  pillars: [
    {
      title: 'Child-Centred Pedagogy',
      desc: 'Respecting each child’s unique learning rhythm and nurturing their intrinsic curiosity.',
    },
    {
      title: 'Digital Teaching Expertise',
      desc: 'Skilfully utilizing modern educational tools to make virtual learning warm, personal, and highly interactive.',
    },
    {
      title: 'Foundational Literacy Focus',
      desc: 'Rooted in systematic phonics, expressive reading fluency, and comprehensive vocabulary mastery.',
    },
    {
      title: 'Supportive Parent Partnership',
      desc: 'Maintaining open, collaborative communication so parents always understand and share in their child’s progress.',
    },
  ],
};

export const RESOURCES_DATA: ResourceArticle[] = [
  {
    id: 'phonics-cvc-blending',
    title: 'Phonics Tips for Parents: Helping Your Child Blend Sounds at Home',
    category: 'Phonics',
    readTime: '3 min read',
    summary:
      'Practical, gentle strategies to help emerging readers blend consonant-vowel-consonant (CVC) sounds into words without frustration.',
    fullContent: [
      'Blending is the process of saying individual sounds smoothly together to read a word (e.g., /c/ - /a/ - /t/ = "cat"). For many young learners, moving from recognizing isolated letter sounds to blending them is the biggest hurdle in early reading.',
      'Tip 1: Practice Continuous Blending. Instead of pausing between sounds ("c... a... t"), teach your child to stretch the sounds continuously without stopping: "cccaaat". This reduces memory load.',
      'Tip 2: Use Finger Tapping. Encourage your child to tap their thumb to index finger for sound 1, middle finger for sound 2, and ring finger for sound 3, then sweep their finger across their palm as they say the whole word.',
      'Tip 3: Keep Sessions Brief and Joyful. Three to five minutes of playful blending with magnetic letters or flashcards each day is far more effective than a long 30-minute drill.',
    ],
    keyTakeaways: [
      'Stretch vowel sounds to bridge letters together',
      'Use multi-sensory hand tapping to anchor sounds',
      'Keep practice sessions under 5 minutes for high retention',
    ],
  },
  {
    id: 'early-reading-habits',
    title: '5 Daily Habits That Spark a Lifelong Love for Books',
    category: 'Early Reading',
    readTime: '4 min read',
    summary:
      'Simple routines families can implement at home to transform reading from a chore into a cherished daily highlight.',
    fullContent: [
      'Children who read for pleasure score higher not only in English and comprehension, but across science, mathematics, and critical thinking. Cultivating this love starts with environment, not pressure.',
      'Habit 1: The 15-Minute Bedtime Anchor. Make bedtime story reading a non-negotiable comfort routine. Let your child choose the book, even if it is the same favorite story for the tenth time.',
      'Habit 2: Paused Picture Walks. Before reading the text on a page, spend 20 seconds looking at the illustration together. Ask: "What do you think is happening here?" This primes their comprehension.',
      'Habit 3: Model Joyful Reading. Children emulate what they see. When they observe parents reading physical books or magazines with interest, reading becomes an attractive grown-up activity.',
      'Habit 4: Celebrate Effort, Not Speed. Praise your child when they re-read a tricky sentence or sound out an unfamiliar word patiently.',
    ],
    keyTakeaways: [
      'Repetition of favorite books builds fluency and confidence',
      'Picture walks build context and predictive comprehension',
      'Quiet modeling by parents is the most persuasive encouragement',
    ],
  },
  {
    id: 'dinner-table-word-games',
    title: 'Fun Dinner-Table Literacy Games for 4–8 Year Olds',
    category: 'Literacy',
    readTime: '3 min read',
    summary:
      'Screen-free verbal games you can play during dinner, car rides, or walks to expand your child’s active vocabulary and listening skills.',
    fullContent: [
      'Rich vocabulary is one of the strongest predictors of long-term academic success. You do not need worksheets to teach words; everyday conversation is your most powerful tool.',
      'Game 1: "The Rhyme Train". One person starts with a word (e.g., "star"). The next person adds a rhyming word ("car"), and the train continues until someone gets stuck ("far", "jar", "tar").',
      'Game 2: "Word of the Day Challenge". Introduce one interesting word at breakfast (e.g., "enormous" or "curious"). Whenever someone uses it correctly during dinner, everyone rings a spoon on their glass or claps.',
      'Game 3: "Mystery Description". Describe an object using three rich adjectives without naming it (e.g., "I am thinking of something crunchy, juicy, and crimson"). Let your child guess!',
    ],
    keyTakeaways: [
      'Rhyme recognition strengthens phonological awareness',
      'Targeted adjectives teach descriptive precision',
      'Verbal play builds communication skills without screen fatigue',
    ],
  },
  {
    id: 'calm-online-learning-setup',
    title: 'Screen-Time to Learn-Time: Setting Up a Calm Virtual Classroom at Home',
    category: 'Parent Guide',
    readTime: '4 min read',
    summary:
      'How to create an ergonomically sound, distraction-free study corner so your child stays focused and happy during online lessons.',
    fullContent: [
      'Learning online works best when children feel physically anchored and mentally prepared. A dedicated setup signals to the child’s brain: "It is time to explore and learn."',
      '1. Proper Posture & Eye Level: Ensure your child’s screen is positioned at eye level so they are not hunched over. Feet should rest flat on the floor or on a footstool for stability.',
      '2. Child-Safe Volume-Limited Headphones: Good headphones block household background noise (like TV or kitchen activity) and allow your child to hear subtle phonics pronunciations clearly.',
      '3. Water & Fidget-Free Desk: Have a small glass of water ready, paper, and pencil, while clearing away toys, phones, or unrelated tabs on the device.',
      '4. The 5-Minute Warm-Up: Log in 5 minutes early to test audio, drink water, and take three calm breaths before Teacher Ngozi starts the session.',
    ],
    keyTakeaways: [
      'Screen at eye level reduces neck fatigue and improves eye contact',
      'Dedicated headphones ensure crystal-clear phonetic listening',
      'Logging in 5 minutes early eliminates frantic rush and anxiety',
    ],
  },
];

export const AGE_GROUP_GUIDE = [
  {
    ageRange: '3–5 Years',
    stageName: 'Early Explorers & Emergent Readers',
    focus: 'Phonemic awareness, letter recognition, vocabulary songs, and listening confidence.',
    idealFormat: '30-minute high-energy, interactive sessions with visual aids and praise.',
    recommendedProgram: 'Phonics & Early Reading',
  },
  {
    ageRange: '6–8 Years',
    stageName: 'Developing Readers & Writers',
    focus: 'Word blending, sight words, reading fluency, simple sentence construction, and comprehension.',
    idealFormat: '45-minute structured lessons with guided reading and spelling practice.',
    recommendedProgram: 'Reading Support & Phonics',
  },
  {
    ageRange: '9–12 Years',
    stageName: 'Confident Communicators & Critical Readers',
    focus: 'Advanced vocabulary, grammatical accuracy, essay structure, comprehension, and spoken presentation.',
    idealFormat: '45–60 minute deep-dive sessions with analytical reading and expressive writing.',
    recommendedProgram: 'English & Literacy / Personalised Learning',
  },
];

export const PLACEHOLDER_TESTIMONIALS = [
  {
    parent: 'Mrs. A. (Parent of 6-year-old)',
    childNote: 'Learning Phonics & Early Reading',
    quote:
      'Before starting with Teacher Ngozi, my son was hesitant to sound out three-letter words. Within a few structured sessions, his hesitation vanished and he began reading street signs and bedtime stories with pure excitement. The patience and warmth shown in every lesson is remarkable.',
    badge: 'Verified Early Cohort Feedback',
  },
  {
    parent: 'Dr. O. (Parent of 8-year-old)',
    childNote: 'English, Grammar & Comprehension',
    quote:
      'Teacher Ngozi’s online classroom is thoroughly organised and child-focused. My daughter genuinely looks forward to her sessions every week. Her school teacher noted a clear jump in her classroom participation and creative writing confidence.',
    badge: 'Verified Early Cohort Feedback',
  },
  {
    parent: 'Mr. & Mrs. E. (Parents of 5-year-old & 9-year-old)',
    childNote: 'Personalised Literacy & Igbo Enrichment',
    quote:
      'The lessons strike the perfect balance between professional academic standards and a warm, nurturing environment. Both of our children have gained tremendous confidence. We also love the introductory Igbo modules that connect them with their roots.',
    badge: 'Verified Early Cohort Feedback',
  },
];
