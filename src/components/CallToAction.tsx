import React from 'react';
import { ArrowRight, MessageCircle, Heart, Star, Sparkles } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';

interface CallToActionProps {
  onOpenBooking: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onOpenBooking }) => {
  return (
    <section className="py-20 md:py-28 bg-[#0F1E36] text-white relative overflow-hidden">
      {/* Subtle organic light effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase mb-4">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>START WITH A SUPPORTIVE TRIAL LESSON</span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-6 max-w-3xl mx-auto leading-tight" style={{ textWrap: 'balance' }}>
          Ready to Help Your Little Learner Grow?
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Give your child a supportive learning experience designed to build skills, confidence and a love for learning.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#0F1E36] bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
          >
            <span>Book a Trial Lesson</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={getWhatsAppUrl('Hello Teacher Ngozi, I am ready to enquire about booking a trial lesson for my child.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] border border-emerald-500/30 rounded-xl transition-colors shadow-md whitespace-nowrap"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span>✓ No Long-Term Lock-in</span>
          <span>✓ Gentle Baseline Assessment</span>
          <span>✓ Transparent Parent Feedback</span>
          <span>✓ Flexible Online Schedule</span>
        </div>
      </div>
    </section>
  );
};
