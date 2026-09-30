import React, { useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, ShieldCheck, Heart, Star } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const heroImagePath = '/src/assets/images/hero_young_learner_1790773088166.jpg';

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-stone-200/70 bg-gradient-to-b from-[#FAF9F5] via-[#FAF9F5] to-[#F5F2EB]">
      {/* Subtle organic background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Unboxed clean metadata kicker (anti-slop, no pill badges) */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-[#1A5336] mb-4">
              <span>ONLINE LEARNING FOR AGES 3–12</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>PHONICS & EARLY LITERACY</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>1-ON-1 & SMALL GROUPS</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-[#0F1E36] leading-[1.15] tracking-tight mb-5" style={{ textWrap: 'balance' }}>
              Helping Little Learners Build Strong Foundations for a Brighter Future
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-8 max-w-2xl font-normal">
              Engaging online English, literacy, phonics and early-reading lessons designed to help children learn with confidence, curiosity, and joy.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] whitespace-nowrap"
              >
                <span>Book a Trial Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#programs"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] whitespace-nowrap"
              >
                Explore Our Programs
              </a>

              <a
                href={getWhatsAppUrl('Hello Teacher Ngozi, I am interested in booking an introductory trial lesson for my child.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-[#1A5336] hover:text-[#133E28] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] whitespace-nowrap"
                title="Chat with Teacher Ngozi on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-[#1A5336]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Trust Markers - clean unboxed typography & subtle icons */}
            <div className="pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1A5336] shrink-0" />
                <span className="font-medium text-slate-800">Child-Centred</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium text-slate-800">Interactive Pedagogy</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium text-slate-800">Patience & Care</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#1A5336]/15 via-amber-200/20 to-[#0F1E36]/10 rounded-2xl filter blur-sm -z-10" />

              <div className="relative bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xl">
                {!imageError ? (
                  <div className="aspect-[4/3] sm:aspect-[16/10] bg-stone-100 relative overflow-hidden">
                    <img
                      src={heroImagePath}
                      alt="Young learner happily engaging in an online literacy and phonics lesson with books and tablet"
                      referrerPolicy="no-referrer"
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400">
                        <span className="text-xs font-medium">Loading classroom visual...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Zero-broken-image CSS fallback */
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#0F1E36] to-[#1A5336] text-white p-8 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Star className="w-5 h-5 fill-amber-300" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Online Learning Environment</span>
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold">Interactive, Joyful English & Phonics</p>
                      <p className="text-sm text-stone-200 mt-1">Personalised support for young learners from anywhere in the world.</p>
                    </div>
                  </div>
                )}

                {/* Subtle caption bar below the image */}
                <div className="p-4 bg-white border-t border-stone-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-slate-800">Online Interactive Classroom</span>
                  </div>
                  <span className="text-stone-500">Live Virtual Guidance</span>
                </div>
              </div>

              {/* Floating Mini Highlights */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white border border-stone-200 rounded-xl p-3 shadow-lg items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4EC] flex items-center justify-center text-[#1A5336]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1E36]">Confidence First</p>
                  <p className="text-[11px] text-slate-500">Nurturing early readers every step</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
