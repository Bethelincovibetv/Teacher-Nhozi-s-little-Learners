import React from 'react';
import { PLACEHOLDER_TESTIMONIALS } from '../data/content';
import { Quote, AlertCircle, Sparkles } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-6">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
            Parent Perspectives & Progress
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-3">
            What Families Experience in Our Lessons
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            See the real-world impact of gentle guidance, consistent phonics reinforcement, and patient teaching.
          </p>
        </div>

        {/* Explicit Disclosure Badge respecting brand rules (No fabricated reviews) */}
        <div className="mb-10 inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-900 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Transparency Notice:</strong> Sample parent feedback formats shown below represent pilot cohort reflections. Verified testimonials will update continuously as ongoing terms conclude.
          </span>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLACEHOLDER_TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-amber-400 mb-4 opacity-75" />
                <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <p className="font-display font-bold text-sm text-[#0F1E36]">
                  {item.parent}
                </p>
                <p className="text-xs text-[#1A5336] font-medium mt-0.5">
                  {item.childNote}
                </p>
                <div className="mt-2 text-[11px] text-slate-400">
                  {item.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
