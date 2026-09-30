import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/content';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface HowItWorksProps {
  onOpenBooking: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenBooking }) => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
            Simple 4-Step Process
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-4">
            How Our Online Lessons Work
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            Starting is straightforward and supportive. We take the time to understand your child’s unique starting point before crafting their learning pathway.
          </p>
        </div>

        {/* 4 Steps Timeline / Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {HOW_IT_WORKS_STEPS.map((item, idx) => (
            <div
              key={item.step}
              className="bg-[#FAF9F5] p-6 rounded-2xl border border-stone-200/90 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-[#0F1E36] text-amber-300 font-display font-bold text-sm flex items-center justify-center">
                    {item.step}
                  </span>
                  <span className="text-xs font-semibold text-[#1A5336] uppercase tracking-wider">
                    Step {idx + 1}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-[#0F1E36] mb-2">
                  {item.title}
                </h3>

                <p className="text-sm font-medium text-slate-800 mb-2">
                  {item.summary}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center gap-1.5 text-xs text-[#1A5336] font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Simple & Parent-Friendly</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner inside How It Works */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-display font-bold text-lg text-[#0F1E36]">
              Ready to take the first step for your learner?
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              Introductory assessments take just 20–30 minutes to evaluate your child’s baseline comfort.
            </p>
          </div>
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl transition-all shadow-xs shrink-0"
          >
            <span>Start Step 1: Enquire Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
