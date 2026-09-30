import React, { useState } from 'react';
import { ArrowRight, Check, Clock, UserCheck, Sparkles, BookOpen } from 'lucide-react';
import { Program } from '../types';
import { PROGRAMS_DATA, getWhatsAppUrl } from '../data/content';

interface ProgramsSectionProps {
  onSelectProgramForBooking: (programName: string) => void;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({ onSelectProgramForBooking }) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  return (
    <section id="programs" className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
            Tailored Educational Programs
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-4">
            Structured Programs Designed for Every Learning Stage
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            Our curriculum blends proven pedagogical methods with engaging interactive lessons. Whether your child is sounding out their first syllables or mastering comprehensive writing, we have a focused path for them.
          </p>
        </div>

        {/* 4 Core Programs Bento / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {PROGRAMS_DATA.filter((p) => !p.isSpecial).map((prog, index) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Program Image with fallbacks */}
                <div className="relative aspect-[16/9] bg-stone-100 overflow-hidden">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  {/* Unboxed clean metadata text on image */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white font-medium">
                    <span className="bg-slate-900/70 backdrop-blur-xs px-2.5 py-1 rounded">
                      {prog.targetAge}
                    </span>
                    <span className="bg-slate-900/70 backdrop-blur-xs px-2.5 py-1 rounded">
                      {prog.sessionLength}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1A5336] mb-1">
                    <span>PROGRAM 0{index + 1}</span>
                  </div>

                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36] mb-1">
                    {prog.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-amber-800 mb-3">
                    {prog.subtitle}
                  </p>

                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {prog.description}
                  </p>

                  {/* Highlights list */}
                  <div className="border-t border-stone-100 pt-4 mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                      Key Competencies Developed:
                    </p>
                    <ul className="space-y-2">
                      {prog.highlights.slice(0, 4).map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <Check className="w-4 h-4 text-[#1A5336] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 pb-6 pt-2 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectProgramForBooking(prog.title)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36]"
                >
                  <span>Enquire for {prog.title.split('&')[0].trim()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Igbo Language Enrichment Card (Dedicated cultural option) */}
        {PROGRAMS_DATA.filter((p) => p.isSpecial).map((prog) => (
          <div
            key={prog.id}
            className="bg-white rounded-2xl border-2 border-emerald-800/15 p-6 sm:p-8 relative overflow-hidden shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A5336] uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Cultural Enrichment Module</span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-slate-500 font-normal">{prog.targetAge}</span>
                </div>

                <h3 className="font-display font-bold text-2xl text-[#0F1E36] mb-2">
                  {prog.title}
                </h3>
                <p className="text-sm font-medium text-amber-800 mb-4">
                  {prog.subtitle}
                </p>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
                  {prog.description} Perfect for diaspora families, bilingual households, or children who want to connect playfully with cultural greetings, numbers, and spoken roots.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                  {prog.highlights.slice(0, 4).map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#1A5336]" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                <button
                  onClick={() => onSelectProgramForBooking(prog.title)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] rounded-xl transition-colors shadow-xs"
                >
                  <span>Enquire About Igbo Lessons</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={getWhatsAppUrl('Hello Teacher Ngozi, I am interested in Igbo Language Learning for my child.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-stone-300 bg-white hover:bg-stone-50 rounded-xl transition-colors"
                >
                  <span>Ask a Question on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
