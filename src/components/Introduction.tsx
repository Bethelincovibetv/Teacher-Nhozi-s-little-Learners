import React from 'react';
import { BookOpen, Sparkles, MessageSquare, Compass, Smile, Lightbulb } from 'lucide-react';

export const Introduction: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Confidence',
      description: 'Building self-belief so young learners express themselves without fear or hesitation.',
    },
    {
      icon: BookOpen,
      title: 'Literacy Development',
      description: 'Expanding vocabulary, sentence comprehension, and rich expressive language skills.',
    },
    {
      icon: Compass,
      title: 'Phonics & Decoding',
      description: 'Mastering letter sounds, blends, and phonetic rules to read unfamiliar words easily.',
    },
    {
      icon: Lightbulb,
      title: 'Fluent Reading',
      description: 'Progressing smoothly from decoding sounds to fluent, expressive, and joyful reading.',
    },
    {
      icon: MessageSquare,
      title: 'Confident Communication',
      description: 'Fostering articulate verbal answers, clear pronunciation, and active listening.',
    },
    {
      icon: Smile,
      title: 'Enjoyment of Learning',
      description: 'Infusing lessons with warmth and encouragement so children genuinely look forward to class.',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
            Our Educational Philosophy
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-5" style={{ textWrap: 'balance' }}>
            Learning Begins with a Strong Foundation
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Children learn best when lessons are engaging, age-appropriate, supportive, and adapted to their individual needs. At Teachers Ngozi Little Learners, we look beyond rote memorisation. We nurture curious, capable readers who understand what they learn and discover genuine joy in literacy.
          </p>
        </div>

        {/* 6 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-[#FAF9F5] p-6 rounded-xl border border-stone-200/80 hover:border-[#1A5336]/40 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#1A5336] mb-4 group-hover:bg-[#1A5336] group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#0F1E36] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
