import React from 'react';
import { WHY_CHOOSE_US_DATA } from '../data/content';
import { CheckCircle2 } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="why-choose-us" className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
            Why Parents Trust Us
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-4">
            An Education Approach Centred on Your Child’s Potential
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            We focus on proven developmental foundations, attentive 1-on-1 pacing, and practical communication skills that prepare your child for long-term academic confidence.
          </p>
        </div>

        {/* 6 Benefits Grid with Editorial Numbering (Anti-slop compliant) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_US_DATA.map((item) => (
            <div
              key={item.number}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 hover:border-[#1A5336]/40 transition-all duration-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-xl text-[#1A5336]">
                    {item.number}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-[#1A5336]" />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#0F1E36] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-medium text-slate-500">
                <span>Personalised & Interactive</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
