import React, { useState } from 'react';
import { Award, Heart, Laptop, BookOpen, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { EDUCATOR_DATA } from '../data/content';

interface AboutEducatorProps {
  onOpenBooking: () => void;
  tutorPhotoUrl?: string;
  tutorTitle?: string;
  tutorBio?: string;
  whatsappNumber?: string;
}

export const AboutEducator: React.FC<AboutEducatorProps> = ({
  onOpenBooking,
  tutorPhotoUrl,
  tutorTitle,
  tutorBio,
}) => {
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  const qualifications = [
    'Certified Digital Educator & Early Literacy Specialist',
    'Specialist in Synthetic Phonics, Sound Blending & Early Readers (Ages 3–12)',
    'Experienced Online EduConsultant with international family track record',
    'Personalised 1-on-1 & small group virtual classroom management',
    'Bilingual Language Development (English & Conversational Igbo Basics)',
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-white border-b border-stone-200/70 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Teacher Photograph / Dignified Portrait Frame */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#1A5336]/20 via-[#FAF9F5] to-[#0F1E36]/15 rounded-3xl blur-md -z-10" />

              <div className="bg-[#FAF9F5] border-2 border-stone-200 rounded-2xl overflow-hidden shadow-lg p-3">
                {tutorPhotoUrl ? (
                  <div className="aspect-[4/5] rounded-xl overflow-hidden relative shadow-inner">
                    <img
                      src={tutorPhotoUrl}
                      alt="Teacher Ngozi - Certified Digital Educator & EduConsultant"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white">
                      <p className="font-display font-bold text-base">Teacher Ngozi</p>
                      <p className="text-[11px] text-amber-300 font-medium">
                        {tutorTitle || 'Certified Digital Educator & EduConsultant'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Dignified Professional Educator Crest */
                  <div className="aspect-[4/5] bg-gradient-to-b from-[#FAF9F5] via-[#FAF9F5] to-[#ECE7DB] rounded-xl flex flex-col items-center justify-center p-8 text-center border border-stone-200 relative">
                    <div className="w-24 h-24 rounded-3xl bg-[#0F1E36] flex items-center justify-center text-amber-300 shadow-md mb-4 border-2 border-amber-300/30">
                      <span className="font-display text-3xl font-extrabold tracking-wider">TN</span>
                    </div>

                    <div className="py-2">
                      <p className="font-display font-bold text-xl text-[#0F1E36]">
                        Teacher Ngozi
                      </p>
                      <p className="text-xs font-semibold text-[#1A5336] mt-1">
                        {tutorTitle || 'Certified Digital Educator & EduConsultant'}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium">Early Literacy Specialist</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Caption below photo */}
                <div className="mt-3 px-3.5 py-2.5 bg-white rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F1E36]">Teacher Ngozi</span>
                  <span className="text-slate-500 text-[11px]">EduConsultant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profile & Teaching Bio */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
              <span>MEET THE EDUCATOR</span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-2">
              Teacher Ngozi
            </h2>

            <p className="text-sm sm:text-base font-semibold text-[#1A5336] mb-6">
              {tutorTitle || 'Certified Digital Educator & EduConsultant'}
            </p>

            {/* Teaching Short Bio Callout */}
            <div className="p-4 sm:p-5 bg-[#FAF9F5] border-l-4 border-[#1A5336] rounded-r-xl mb-6 text-sm sm:text-base italic text-slate-700 leading-relaxed">
              "{EDUCATOR_DATA.shortBio}"
            </div>

            <div className="prose prose-slate text-sm sm:text-base text-slate-700 space-y-4 mb-8 leading-relaxed">
              <p>
                {tutorBio ||
                  'With deep expertise in early childhood language development, Teacher Ngozi specialises in helping young children find their voice, discover the joy of reading, and master early literacy through warm, encouraging online lessons.'}
              </p>
              <p>
                Every lesson is carefully structured to meet your child at their exact stage of learning, ensuring they feel celebrated, confident, and eager to grow.
              </p>
            </div>

            {/* Teaching Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {EDUCATOR_DATA.pillars.map((pillar, index) => {
                const icons = [Award, Heart, Laptop, BookOpen];
                const IconComponent = icons[index % icons.length];
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F5] flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#1A5336] shrink-0 border border-stone-200 shadow-2xs">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {pillar.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Book a Trial with Teacher Ngozi</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDetailedModal(true)}
                className="px-5 py-3.5 text-sm sm:text-base font-semibold text-slate-700 hover:text-slate-900 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                View Qualifications & Bio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Modal */}
      {showDetailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <span className="text-xs font-semibold text-[#1A5336] uppercase tracking-wider">
                  Professional Profile
                </span>
                <h3 className="font-display font-bold text-2xl text-[#0F1E36]">
                  Teacher Ngozi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Certified Digital Educator & EduConsultant
                </p>
              </div>
              <button
                onClick={() => setShowDetailedModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-[#0F1E36] mb-2">Qualifications & Core Strengths</h4>
                <ul className="space-y-2">
                  {qualifications.map((qual, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1A5336] shrink-0 mt-0.5" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#0F1E36] mb-2">How Lessons Work Online</h4>
                <p className="leading-relaxed">
                  Lessons are conducted over interactive virtual classrooms equipped with visual phonics cards, live phoneme sound articulation, interactive reading slides, digital whiteboards, and engaging game activities.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#0F1E36] mb-2">Multilingual Support (Igbo & English)</h4>
                <p className="leading-relaxed">
                  Specialised language immersion sessions are also available for diaspora families seeking to introduce their young children to foundational Igbo vocabulary, greetings, folk tales, and cultural songs.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowDetailedModal(false);
                    onOpenBooking();
                  }}
                  className="w-full py-3 text-center text-sm font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Schedule Trial Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
