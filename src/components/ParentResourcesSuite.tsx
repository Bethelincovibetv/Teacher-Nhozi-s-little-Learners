import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckSquare,
  Sparkles,
  Volume2,
  X,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const ParentResourcesSuite: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'tips' | 'phonics' | 'checklist' | null>(null);

  // State for interactive checklist
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    'c1-1': true,
    'c1-2': true,
    'c2-1': true,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const phonicsSounds = [
    { sound: 's', example: 'sun', icon: '☀️' },
    { sound: 'a', example: 'apple', icon: '🍎' },
    { sound: 't', example: 'tree', icon: '🌳' },
    { sound: 'p', example: 'pan', icon: '🍳' },
    { sound: 'i', example: 'igloo', icon: '❄️' },
    { sound: 'n', example: 'nest', icon: '🪺' },
    { sound: 'm', example: 'moon', icon: '🌙' },
    { sound: 'd', example: 'duck', icon: '🦆' },
    { sound: 'g', example: 'gift', icon: '🎁' },
    { sound: 'o', example: 'orange', icon: '🍊' },
    { sound: 'c', example: 'cat', icon: '🐱' },
    { sound: 'k', example: 'kite', icon: '🪁' },
    { sound: 'e', example: 'elephant', icon: '🐘' },
    { sound: 'u', example: 'umbrella', icon: '☂️' },
    { sound: 'r', example: 'rainbow', icon: '🌈' },
    { sound: 'h', example: 'hat', icon: '🎩' },
    { sound: 'b', example: 'ball', icon: '⚽' },
    { sound: 'f', example: 'fish', icon: '🐟' },
    { sound: 'l', example: 'leaf', icon: '🍃' },
    { sound: 'j', example: 'jam', icon: '🍓' },
    { sound: 'v', example: 'van', icon: '🚐' },
    { sound: 'w', example: 'water', icon: '💧' },
    { sound: 'ch', example: 'chair', icon: '🪑' },
    { sound: 'sh', example: 'ship', icon: '🚢' },
    { sound: 'th', example: 'thumb', icon: '👍' },
    { sound: 'ng', example: 'ring', icon: '💍' },
    { sound: 'ai', example: 'rain', icon: '🌧️' },
    { sound: 'ee', example: 'bee', icon: '🐝' },
    { sound: 'oa', example: 'boat', icon: '⛵' },
    { sound: 'oo', example: 'book', icon: '📖' },
  ];

  const checklistStages = [
    {
      ageGroup: 'Ages 3–4 (Emerging Little Learners)',
      items: [
        { id: 'c1-1', text: 'Enjoys listening to stories and turning pages independently' },
        { id: 'c1-2', text: 'Recognizes that printed text carries meaning' },
        { id: 'c1-3', text: 'Can point to familiar objects in a picture book upon request' },
        { id: 'c1-4', text: 'Begins to recognize the first letter of their own name' },
        { id: 'c1-5', text: 'Notices rhymes and enjoys repeating silly word sounds' },
      ],
    },
    {
      ageGroup: 'Ages 5–6 (Early Readers & Phonics Explorers)',
      items: [
        { id: 'c2-1', text: 'Identifies common consonant and short vowel sounds' },
        { id: 'c2-2', text: 'Can blend 3-letter CVC words (e.g., c-a-t = cat, s-u-n = sun)' },
        { id: 'c2-3', text: 'Recognizes key high-frequency words (the, is, he, she, to)' },
        { id: 'c2-4', text: 'Retells the main beginning, middle, and end of a simple story' },
        { id: 'c2-5', text: 'Uses finger pointing to track words from left to right' },
      ],
    },
    {
      ageGroup: 'Ages 7–8 (Fluent Readers & Confident Communicators)',
      items: [
        { id: 'c3-1', text: 'Reads short chapter books with developing expression and pace' },
        { id: 'c3-2', text: 'Self-corrects when a sentence does not make grammatical sense' },
        { id: 'c3-3', text: 'Answers inferential questions (e.g., "Why was the character sad?")' },
        { id: 'c3-4', text: 'Decodes unfamiliar multi-syllable words using phonetic chunks' },
        { id: 'c3-5', text: 'Writes simple descriptive paragraphs with punctuation' },
      ],
    },
  ];

  return (
    <div className="mt-12 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-[#1A5336] uppercase tracking-wider">
            FREE DOWNLOADABLE & PRINTABLE TOOLKIT
          </span>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F1E36] mt-1">
            Essential Parent Learning Guides
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Professionally designed, research-grounded resources curated by Teacher Ngozi to nurture your child's literacy journey at home.
          </p>
        </div>
      </div>

      {/* 3 Core Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Early Reading Guide */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-6 flex flex-col justify-between hover:border-[#1A5336]/40 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#E6F4EC] text-[#1A5336] flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Parent Guidebook
            </span>
            <h4 className="font-display font-bold text-lg text-[#0F1E36] mt-1 mb-2 group-hover:text-[#1A5336] transition-colors">
              Tips for Supporting Early Reading at Home
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              A comprehensive 5-step roadmap covering daily bedtime routines, picture-walk methods, overcoming decoding anxiety, and asking engaging comprehension questions.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between">
            <button
              onClick={() => setActiveModal('tips')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F1E36] hover:text-[#1A5336] transition-colors"
            >
              <span>View & Download Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Download className="w-4 h-4 text-stone-400 group-hover:text-[#1A5336] transition-colors" />
          </div>
        </div>

        {/* Card 2: Printable Phonics Sounds Chart */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-6 flex flex-col justify-between hover:border-[#1A5336]/40 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
              <Volume2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Printable Wall Chart
            </span>
            <h4 className="font-display font-bold text-lg text-[#0F1E36] mt-1 mb-2 group-hover:text-[#1A5336] transition-colors">
              Printable Phonics Sounds Chart
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Clean visual sound-spelling chart featuring 30 foundational letter sounds, consonant blends, and vowel digraphs with child-friendly illustrated reference words.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between">
            <button
              onClick={() => setActiveModal('phonics')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F1E36] hover:text-[#1A5336] transition-colors"
            >
              <span>Explore & Print Chart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Printer className="w-4 h-4 text-stone-400 group-hover:text-[#1A5336] transition-colors" />
          </div>
        </div>

        {/* Card 3: Early Literacy Checklist */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-6 flex flex-col justify-between hover:border-[#1A5336]/40 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Interactive Checklist
            </span>
            <h4 className="font-display font-bold text-lg text-[#0F1E36] mt-1 mb-2 group-hover:text-[#1A5336] transition-colors">
              What to Expect in Early Literacy
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Age-by-age milestone checklist (ages 3–4, 5–6, 7–8) that helps parents spot reading readiness, track phonemic progress, and identify when tailored support is needed.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between">
            <button
              onClick={() => setActiveModal('checklist')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F1E36] hover:text-[#1A5336] transition-colors"
            >
              <span>Open Parent Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <CheckCircle2 className="w-4 h-4 text-stone-400 group-hover:text-[#1A5336] transition-colors" />
          </div>
        </div>
      </div>

      {/* Modal 1: Downloadable Tips Guide */}
      {activeModal === 'tips' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 mb-6 print:hidden">
              <div>
                <span className="text-xs font-bold text-[#1A5336] uppercase tracking-wide">
                  Official Parent Guide
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36]">
                  Tips for Supporting Early Reading at Home
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  By Teacher Ngozi — Certified Digital Educator & EduConsultant
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-500 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6 text-sm text-slate-800 leading-relaxed font-sans">
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-stone-200 text-xs text-slate-600">
                <strong>Core Philosophy:</strong> Reading should feel like a cozy adventure, not a test. Consistency, joyful dialogue, and patient modeling form the heartbeat of early literacy.
              </div>

              <div>
                <h4 className="font-display font-bold text-base text-[#0F1E36] mb-2">
                  1. The 15-Minute Daily Anchor
                </h4>
                <p className="text-xs sm:text-sm text-slate-700">
                  Read aloud to your child every day at a consistent time (bedtime or right after school). Let your child choose the book. Re-reading favorite books builds neural pathways for vocabulary and sentence cadence.
                </p>
              </div>

              <div>
                <h4 className="font-display font-bold text-base text-[#0F1E36] mb-2">
                  2. Do a "Picture Walk" Before Reading
                </h4>
                <p className="text-xs sm:text-sm text-slate-700">
                  Flip through the pages first without reading the words. Ask: <em>"What do you notice about this character? Where do you think they are going?"</em> This activates background knowledge and aids predictive comprehension.
                </p>
              </div>

              <div>
                <h4 className="font-display font-bold text-base text-[#0F1E36] mb-2">
                  3. Encourage Continuous Sound Blending
                </h4>
                <p className="text-xs sm:text-sm text-slate-700">
                  When sounding out words like <strong>m-a-n</strong>, guide your child to stretch the sounds continuously (<em>"mmmaaannn"</em>) instead of choppy pauses (<em>"m... a... n"</em>). This makes it easier for their memory to connect the word.
                </p>
              </div>

              <div>
                <h4 className="font-display font-bold text-base text-[#0F1E36] mb-2">
                  4. Ask Open-Ended "Wonder" Questions
                </h4>
                <p className="text-xs sm:text-sm text-slate-700">
                  Rather than testing facts with "What color was the car?", ask: <em>"How do you think the puppy felt when he got lost?"</em> or <em>"What would you have done if you were in their shoes?"</em>
                </p>
              </div>

              <div>
                <h4 className="font-display font-bold text-base text-[#0F1E36] mb-2">
                  5. Celebrate Effort and Self-Correction
                </h4>
                <p className="text-xs sm:text-sm text-slate-700">
                  If your child stumbles and fixes their mistake, praise the detective work: <em>"I love how you noticed that word didn't sound right and tried again!"</em>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-stone-200 flex flex-col sm:flex-row justify-between gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print or Save as PDF</span>
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 border border-stone-200 rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Printable Phonics Sounds Chart */}
      {activeModal === 'phonics' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 mb-6 print:hidden">
              <div>
                <span className="text-xs font-bold text-[#1A5336] uppercase tracking-wide">
                  Phonics Reference Wall Chart
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36]">
                  Foundational Sounds & Letters Chart
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Single Letter Sounds, Consonant Digraphs & Vowel Pairs
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-500 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phonics Chart Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 mb-8">
              {phonicsSounds.map((item) => (
                <div
                  key={item.sound}
                  className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors"
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="font-display font-extrabold text-xl text-[#0F1E36]">
                    {item.sound}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 capitalize">
                    {item.example}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-slate-700 leading-relaxed mb-6">
              <strong>Educator Tip for Parents:</strong> Emphasize pure letter sounds (e.g. "ssss" not "suh", "mmmm" not "muh"). Crisp, unvoiced sounds make word blending far simpler for emerging readers!
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-stone-200 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] rounded-xl transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Phonics Wall Chart</span>
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 border border-stone-200 rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Interactive Literacy Checklist */}
      {activeModal === 'checklist' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 mb-6 print:hidden">
              <div>
                <span className="text-xs font-bold text-[#1A5336] uppercase tracking-wide">
                  Parent Diagnostic Checklist
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36]">
                  What to Expect in Early Literacy Development
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track key milestones across phonological awareness, decoding, and comprehension.
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-500 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {checklistStages.map((stage) => (
                <div key={stage.ageGroup} className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#0F1E36] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1A5336]" />
                    <span>{stage.ageGroup}</span>
                  </h4>

                  <div className="space-y-2.5">
                    {stage.items.map((item) => {
                      const isChecked = !!checkedItems[item.id];
                      return (
                        <label
                          key={item.id}
                          className="flex items-start gap-3 cursor-pointer group select-none text-xs sm:text-sm text-slate-700"
                          onClick={() => toggleCheck(item.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-[#1A5336] focus:ring-[#1A5336]"
                          />
                          <span className={isChecked ? 'text-slate-900 font-medium' : 'text-slate-600'}>
                            {item.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-stone-200 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Completed Checklist</span>
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 border border-stone-200 rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
