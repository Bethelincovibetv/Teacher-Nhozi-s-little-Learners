import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Volume2,
  ArrowRight,
  Star,
  BookOpen,
  Award,
} from 'lucide-react';

export const InteractiveLearningActivities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'phonics' | 'vocab' | 'adventure'>('phonics');

  // --- ACTIVITY 1: PHONICS WORD BUILDER STATE ---
  const phonicsPuzzles = [
    {
      targetWord: 'CAT',
      letters: ['C', 'A', 'T'],
      scrambled: ['A', 'T', 'C', 'S', 'P'],
      hint: 'A furry, friendly pet that purrs 🐱',
      soundFormula: '/k/ · /æ/ · /t/',
    },
    {
      targetWord: 'SUN',
      letters: ['S', 'U', 'N'],
      scrambled: ['U', 'N', 'S', 'M', 'B'],
      hint: 'Shines bright and warm in the sky ☀️',
      soundFormula: '/s/ · /ʌ/ · /n/',
    },
    {
      targetWord: 'SHIP',
      letters: ['SH', 'I', 'P'],
      scrambled: ['I', 'P', 'SH', 'CH', 'B'],
      hint: 'Sails smoothly across the ocean 🚢',
      soundFormula: '/ʃ/ · /ɪ/ · /p/',
    },
  ];

  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const currentPuzzle = phonicsPuzzles[currentPuzzleIdx];
  const [placedSlots, setPlacedSlots] = useState<string[]>([]);
  const [phonicsSuccess, setPhonicsSuccess] = useState(false);

  const handleTileClick = (letter: string) => {
    if (placedSlots.length < currentPuzzle.letters.length) {
      const nextSlots = [...placedSlots, letter];
      setPlacedSlots(nextSlots);

      if (nextSlots.length === currentPuzzle.letters.length) {
        if (nextSlots.join('') === currentPuzzle.letters.join('')) {
          setPhonicsSuccess(true);
        }
      }
    }
  };

  const resetPhonics = () => {
    setPlacedSlots([]);
    setPhonicsSuccess(false);
  };

  const nextPhonicsPuzzle = () => {
    setCurrentPuzzleIdx((prev) => (prev + 1) % phonicsPuzzles.length);
    setPlacedSlots([]);
    setPhonicsSuccess(false);
  };

  // --- ACTIVITY 2: VOCABULARY MATCHING QUIZ STATE ---
  const vocabCards = [
    { id: 1, word: 'Curious', meaning: 'Eager to learn and ask questions' },
    { id: 2, word: 'Enormous', meaning: 'Very large, grand and huge' },
    { id: 3, word: 'Flourish', meaning: 'To grow strong, happy and healthy' },
    { id: 4, word: 'Radiant', meaning: 'Shining brightly with warmth' },
  ];

  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [vocabMessage, setVocabMessage] = useState<string>('Select a word, then click its matching meaning!');

  const handleSelectWord = (id: number) => {
    if (matchedIds.includes(id)) return;
    setSelectedWord(id);
  };

  const handleSelectMeaning = (id: number) => {
    if (selectedWord === null) {
      setVocabMessage('Please click a vocabulary word on the left first!');
      return;
    }
    if (selectedWord === id) {
      setMatchedIds([...matchedIds, id]);
      setSelectedWord(null);
      setVocabMessage('✨ Splendid match! You got it right!');
    } else {
      setVocabMessage('Not quite that one — give it another thoughtful try!');
      setSelectedWord(null);
    }
  };

  const resetVocab = () => {
    setMatchedIds([]);
    setSelectedWord(null);
    setVocabMessage('Select a word, then click its matching meaning!');
  };

  // --- ACTIVITY 3: CHOOSE YOUR OWN ADVENTURE STATE ---
  const [adventureStep, setAdventureStep] = useState<number>(1);
  const [adventureScore, setAdventureScore] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const resetAdventure = () => {
    setAdventureStep(1);
    setAdventureScore(0);
    setSelectedChoice(null);
  };

  return (
    <section id="activities" className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2 block">
            Engaging Student Corner
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-3">
            Interactive Learning Activities for Little Learners
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            Experience the playful, child-centred digital methods Teacher Ngozi uses during live lessons. Try a phonics puzzle, vocabulary match, or interactive reading adventure with your child!
          </p>
        </div>

        {/* Activity Selector Tabs (Segmented control buttons) */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-stone-200/60 rounded-2xl max-w-xl mb-8">
          <button
            onClick={() => setActiveTab('phonics')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
              activeTab === 'phonics'
                ? 'bg-white text-[#0F1E36] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔤 Phonics Sound Builder
          </button>
          <button
            onClick={() => setActiveTab('vocab')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
              activeTab === 'vocab'
                ? 'bg-white text-[#0F1E36] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧩 Vocabulary Match Quiz
          </button>
          <button
            onClick={() => setActiveTab('adventure')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
              activeTab === 'adventure'
                ? 'bg-white text-[#0F1E36] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 Reading Adventure
          </button>
        </div>

        {/* ACTIVITY 1: PHONICS SOUND BUILDER */}
        {activeTab === 'phonics' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
              <div>
                <span className="text-xs font-bold text-[#1A5336] uppercase tracking-wide">
                  Phonemic Blending · Puzzle {currentPuzzleIdx + 1} of {phonicsPuzzles.length}
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36] mt-0.5">
                  Blend the Sounds to Build the Word
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Clue: <strong>{currentPuzzle.hint}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetPhonics}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-stone-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Target Slots */}
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="flex items-center gap-3 sm:gap-4 mb-6">
                {currentPuzzle.letters.map((expected, idx) => {
                  const placed = placedSlots[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-display font-black text-2xl sm:text-3xl border-2 transition-all ${
                        placed
                          ? phonicsSuccess
                            ? 'bg-emerald-50 border-emerald-500 text-[#1A5336] shadow-sm'
                            : 'bg-stone-50 border-stone-400 text-[#0F1E36]'
                          : 'border-dashed border-stone-300 bg-stone-50/50 text-stone-300'
                      }`}
                    >
                      <span>{placed || '_'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Sound blending prompt */}
              <div className="text-xs sm:text-sm font-semibold text-[#1A5336] flex items-center gap-2 bg-[#E6F4EC] px-4 py-2 rounded-xl mb-8">
                <Volume2 className="w-4 h-4" />
                <span>Phonetic Sounds: {currentPuzzle.soundFormula}</span>
              </div>

              {/* Success Banner */}
              {phonicsSuccess ? (
                <div className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md w-full mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-emerald-900">
                    Outstanding Blending!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1 mb-4">
                    You blended the sounds to spell <strong>{currentPuzzle.targetWord}</strong>!
                  </p>
                  <button
                    onClick={nextPhonicsPuzzle}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] rounded-xl transition-colors shadow-xs"
                  >
                    <span>Next Word Puzzle</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Clickable Letter Sound Tiles */
                <div>
                  <p className="text-xs text-slate-500 text-center mb-3">
                    Click a sound tile to place it into the slot:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {currentPuzzle.scrambled.map((tile, i) => (
                      <button
                        key={i}
                        onClick={() => handleTileClick(tile)}
                        disabled={placedSlots.length >= currentPuzzle.letters.length}
                        className="w-13 h-14 sm:w-14 sm:h-16 rounded-xl bg-white border-2 border-stone-200 hover:border-[#1A5336] hover:shadow-md text-[#0F1E36] font-display font-extrabold text-xl sm:text-2xl transition-all disabled:opacity-40 focus:outline-none"
                      >
                        {tile}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY 2: VOCABULARY MATCHING QUIZ */}
        {activeTab === 'vocab' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#1A5336] uppercase tracking-wide">
                  Vocabulary Explorer · Level 1
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36] mt-0.5">
                  Match the Word with its Meaning
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Matched: <strong>{matchedIds.length} of {vocabCards.length}</strong> words
                </p>
              </div>

              <button
                onClick={resetVocab}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-stone-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Quiz</span>
              </button>
            </div>

            <p className="text-xs font-semibold text-center text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 mb-6">
              {vocabMessage}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Words Column */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Vocabulary Words
                </p>
                {vocabCards.map((card) => {
                  const isMatched = matchedIds.includes(card.id);
                  const isSelected = selectedWord === card.id;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleSelectWord(card.id)}
                      disabled={isMatched}
                      className={`w-full text-left p-4 rounded-xl font-display font-bold text-base transition-all border ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-[#1A5336] line-through opacity-70'
                          : isSelected
                          ? 'bg-[#0F1E36] border-[#0F1E36] text-white shadow-md'
                          : 'bg-[#FAF9F5] border-stone-200 text-[#0F1E36] hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{card.word}</span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Meanings Column (Shuffled order) */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Definitions & Explanations
                </p>
                {[...vocabCards]
                  .sort((a, b) => b.id - a.id)
                  .map((card) => {
                    const isMatched = matchedIds.includes(card.id);
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleSelectMeaning(card.id)}
                        disabled={isMatched}
                        className={`w-full text-left p-4 rounded-xl text-xs sm:text-sm leading-relaxed transition-all border ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                            : 'bg-white border-stone-200 hover:border-amber-400 text-slate-700 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{card.meaning}</span>
                          {isMatched && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {matchedIds.length === vocabCards.length && (
              <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h4 className="font-display font-bold text-lg text-emerald-900">
                  Vocabulary Champion!
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  You matched all 4 rich descriptive words correctly!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY 3: CHOOSE YOUR OWN ADVENTURE */}
        {activeTab === 'adventure' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#1A5336] uppercase tracking-wide">
                  Reading Comprehension Adventure · Chapter {adventureStep}
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36] mt-0.5">
                  Amara and the Whispering Library
                </h3>
              </div>

              <button
                onClick={resetAdventure}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-stone-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Story</span>
              </button>
            </div>

            {/* Story Chapters */}
            {adventureStep === 1 && (
              <div className="space-y-6">
                <div className="p-6 bg-[#FAF9F5] rounded-2xl border border-stone-200 text-slate-800 leading-relaxed text-sm sm:text-base">
                  <p className="mb-4">
                    Amara stepped quietly into the ancient village library. The afternoon sun cast golden beams across stacks of curious books. Suddenly, a soft voice whispered from a high shelf:
                  </p>
                  <blockquote className="p-4 bg-white rounded-xl border-l-4 border-[#1A5336] italic text-slate-700 text-sm mb-4">
                    "Only the reader who speaks with clarity can open the secret garden gate."
                  </blockquote>
                  <p>
                    On the wooden table, two mysterious cards appeared. Which action should Amara take?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setAdventureStep(2);
                      setAdventureScore((prev) => prev + 1);
                    }}
                    className="p-5 rounded-2xl border-2 border-stone-200 hover:border-[#1A5336] bg-white text-left transition-all group"
                  >
                    <span className="text-xs font-bold text-[#1A5336] block mb-1">
                      CHOICE A
                    </span>
                    <h5 className="font-display font-bold text-base text-[#0F1E36] mb-2 group-hover:text-[#1A5336]">
                      Read the book title aloud using clear, confident sounds
                    </h5>
                    <p className="text-xs text-slate-500">
                      Amara pronounces each syllable carefully and smiles.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setAdventureStep(2);
                    }}
                    className="p-5 rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-white text-left transition-all group"
                  >
                    <span className="text-xs font-bold text-amber-700 block mb-1">
                      CHOICE B
                    </span>
                    <h5 className="font-display font-bold text-base text-[#0F1E36] mb-2 group-hover:text-amber-800">
                      Rush ahead and tug gently on the locked brass gate
                    </h5>
                    <p className="text-xs text-slate-500">
                      Amara skips reading the clue and tries the brass handle.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {adventureStep === 2 && (
              <div className="space-y-6">
                <div className="p-6 bg-[#FAF9F5] rounded-2xl border border-stone-200 text-slate-800 leading-relaxed text-sm sm:text-base">
                  <p className="mb-4">
                    The gate swung gently open! Inside the enchanted courtyard stood an owl named Barnaby with large, round spectacles.
                  </p>
                  <p className="mb-4">
                    Barnaby bowed politely and said: <em>"Welcome, young learner! Before you may enter the hall of stories, solve this reading riddle:"</em>
                  </p>
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs sm:text-sm font-semibold text-slate-800">
                    "I have a spine, but no bones. I have leaves, but no branches. What am I?"
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['A Tree 🌲', 'A Book 📖', 'A Salad 🥗'].map((answer) => (
                    <button
                      key={answer}
                      onClick={() => {
                        if (answer.includes('Book')) {
                          setAdventureScore((prev) => prev + 1);
                        }
                        setAdventureStep(3);
                      }}
                      className="p-4 rounded-xl border border-stone-200 hover:border-[#1A5336] bg-white text-center font-display font-bold text-sm text-[#0F1E36] transition-all"
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {adventureStep === 3 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1A5336] flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-2xl text-[#0F1E36] mb-2">
                  Adventure Complete!
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  Barnaby cheered with delight: <em>"A book indeed! You are a brilliant reader with sharp comprehension!"</em>
                </p>

                <div className="p-4 bg-[#FAF9F5] rounded-xl border border-stone-200 max-w-sm mx-auto mb-6 text-xs text-slate-700">
                  <span>Reading Score: </span>
                  <strong className="text-[#1A5336] text-sm">{adventureScore} / 2 Stars</strong>
                </div>

                <button
                  onClick={resetAdventure}
                  className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl transition-colors"
                >
                  Play Adventure Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
