import { GoogleGenAI } from '@google/genai';
import { EducationalGame } from '../types';

export interface GenerateGameParams {
  topic: string;
  category: 'Phonics' | 'Early Reading' | 'Vocabulary' | 'Comprehension';
  targetAge: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  mechanic: 'asteroid' | 'vowel' | 'racer' | 'riddle' | 'quiz' | 'adventure';
  customInstructions?: string;
}

export async function generateEducationalGameWithAI(
  params: GenerateGameParams
): Promise<EducationalGame> {
  const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '';

  const fallbackGame: EducationalGame = createCuratedFallbackGame(params);

  if (!apiKey) {
    console.info('No GEMINI_API_KEY detected in client env; using high-grade curated template generator.');
    return fallbackGame;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Senior Early Childhood Educational Game Designer for 'Teachers Ngozi Little Learners'.
Create a high-impact, engaging educational learning game for young children.

Parameters:
- Category: ${params.category}
- Topic: ${params.topic}
- Target Age: ${params.targetAge}
- Difficulty: ${params.difficulty}
- Mechanic Type: ${params.mechanic} (e.g. asteroid target blast, missing vowel spatial puzzle, rapid speed reflex lane racer, vocabulary riddle mystery)
${params.customInstructions ? `- Specific Tutor Request: ${params.customInstructions}` : ''}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "title": "Short, catchy game title with energy (e.g. 3D Dragon Phonics Blaster)",
  "category": "${params.category}",
  "description": "Engaging 1-2 sentence description explaining what the learner will practice and how.",
  "costCredits": 5,
  "rewardStars": 20,
  "icon": "A single suitable emoji or symbol (e.g. 🚀, 🏰, 🏎️, 💎, 🐉, 🦁, 🪐)",
  "badge": "Short badge e.g. Phonics Mastery, Fast Reflexes, Spatial Words",
  "difficulty": "${params.difficulty}",
  "mechanic": "${params.mechanic}",
  "questions": [
    {
      "soundName": "Short phoneme or keyword",
      "instruction": "Clear visual instruction for the child on screen",
      "soundSpoken": "What Teacher Ngozi will speak out loud to prompt the child via text-to-speech voice",
      "options": ["Option1", "Option2", "Option3", "Option4"],
      "correct": "Option1",
      "hint": "Gentle helpful hint if the child hesitates",
      "explanation": "Why this is correct (celebration)"
    }
  ]
}

Provide 3 to 4 high quality, age-appropriate questions/rounds. Make sure options are distinct and one option matches 'correct' exactly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return fallbackGame;
    }

    const parsed = JSON.parse(text) as Partial<EducationalGame>;
    const gameId = `game-ai-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    return {
      id: gameId,
      title: parsed.title || `${params.topic} Adventure`,
      category: params.category,
      description: parsed.description || `Interactive ${params.category} practice on ${params.topic}.`,
      costCredits: parsed.costCredits || 5,
      rewardStars: parsed.rewardStars || 20,
      icon: parsed.icon || '🌟',
      badge: parsed.badge || 'AI Learning Quest',
      difficulty: params.difficulty,
      mechanic: params.mechanic,
      questions: parsed.questions && parsed.questions.length > 0 ? parsed.questions : fallbackGame.questions,
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Gemini AI Game Generation error, falling back to instant structured generator:', error);
    return fallbackGame;
  }
}

function createCuratedFallbackGame(params: GenerateGameParams): EducationalGame {
  const gameId = `game-custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const cleanTopic = params.topic.trim() || 'Phonics & Literacy Mastery';

  if (params.category === 'Phonics') {
    return {
      id: gameId,
      title: `3D Cosmic Phonics: ${cleanTopic}`,
      category: 'Phonics',
      description: `Listen to Teacher Ngozi articulate key phonemes in ${cleanTopic} and blast target energy spheres!`,
      costCredits: 5,
      rewardStars: 20,
      icon: '🪐',
      badge: 'Phonics Quest',
      difficulty: params.difficulty,
      mechanic: params.mechanic || 'asteroid',
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
      questions: [
        {
          soundName: 'Target blend 1',
          instruction: `Identify the correct spelling of the sound in "${cleanTopic}"!`,
          soundSpoken: `Listen closely: identify the primary sound in our topic: ${cleanTopic}!`,
          options: ['BR', 'CL', 'ST', 'FL'],
          correct: 'ST',
          hint: 'Think of star, start, and strong!',
          explanation: 'Superb! S and T blend together smoothly!',
        },
        {
          soundName: 'Target digraph 2',
          instruction: 'Which pair makes the continuous blowing sound in "whistle"?',
          soundSpoken: 'Which letters make the sound at the start of whistle and whale?',
          options: ['WH', 'PH', 'TH', 'SH'],
          correct: 'WH',
          hint: 'W and H together!',
          explanation: 'Brilliant listening!',
        },
        {
          soundName: 'Long vowel team',
          instruction: 'Find the vowel team that makes the long /eɪ/ sound in "train"!',
          soundSpoken: 'Find the vowel team in train and rain!',
          options: ['AI', 'EE', 'OA', 'OU'],
          correct: 'AI',
          hint: 'A followed by I!',
          explanation: 'Direct hit! Excellent reading!',
        },
      ],
    };
  }

  if (params.category === 'Vocabulary') {
    return {
      id: gameId,
      title: `Vocabulary Explorer: ${cleanTopic}`,
      category: 'Vocabulary',
      description: `Unlock ancient golden keys by discovering rich descriptive adjectives and synonyms for ${cleanTopic}.`,
      costCredits: 5,
      rewardStars: 25,
      icon: '💎',
      badge: 'Word Power',
      difficulty: params.difficulty,
      mechanic: params.mechanic || 'riddle',
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
      questions: [
        {
          instruction: `Which word best describes something relating to ${cleanTopic} that is extraordinary and radiant?`,
          soundSpoken: `Listen to the riddle: Which word means extraordinary, radiant, and shining with brilliance?`,
          options: ['Luminous', 'Drab', 'Feeble', 'Obscure'],
          correct: 'Luminous',
          hint: 'Related to light and radiance!',
          explanation: 'Splendid vocabulary mastery!',
        },
        {
          instruction: 'Which word means showing deep courage, determination, and bravery?',
          soundSpoken: 'Which word means showing deep courage and unwavering bravery?',
          options: ['Valiant', 'Timid', 'Sluggish', 'Gloomy'],
          correct: 'Valiant',
          hint: 'Like a valiant knight or noble hero!',
          explanation: 'Spectacular choice! You are expanding your vocabulary!',
        },
      ],
    };
  }

  // Default Early Reading / Comprehension
  return {
    id: gameId,
    title: `3D Story Voyager: ${cleanTopic}`,
    category: params.category,
    description: `Read clues with Teacher Ngozi and navigate the learning galaxy for ${cleanTopic}!`,
    costCredits: 5,
    rewardStars: 20,
    icon: '🚀',
    badge: 'Reading Voyager',
    difficulty: params.difficulty,
    mechanic: params.mechanic || 'racer',
    isAiGenerated: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        instruction: `Match the high-frequency sight word in our reading passage for ${cleanTopic}!`,
        soundSpoken: 'Identify the word: TOGETHER!',
        options: ['TOGETHER', 'THROUGH', 'TOWARDS', 'TOMORROW'],
        correct: 'TOGETHER',
        hint: 'Begins with TO and ends with THER',
        explanation: 'Lightning-fast reading fluency!',
      },
      {
        instruction: 'Find the word that means happening without delay: IMMEDIATELY',
        soundSpoken: 'Find the word: IMMEDIATELY!',
        options: ['IMMEDIATELY', 'OCCASIONALLY', 'GRADUALLY', 'EVENTUALLY'],
        correct: 'IMMEDIATELY',
        hint: 'Starts with IM- and means right now!',
        explanation: 'Fantastic! Your fluency is flourishing!',
      },
    ],
  };
}
