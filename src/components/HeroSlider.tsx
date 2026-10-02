import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, Sparkles, Heart } from 'lucide-react';
import { HeroSlide } from '../types';
import { getWhatsAppUrl, resolveImageUrl } from '../data/content';

interface HeroSliderProps {
  slides: HeroSlide[];
  onOpenBooking: () => void;
  whatsappNumber?: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  onOpenBooking,
  whatsappNumber,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handleCtaClick = (action: string) => {
    if (action === 'booking') {
      onOpenBooking();
    } else if (action === 'programs') {
      const elem = document.getElementById('programs');
      elem?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'activities') {
      const elem = document.getElementById('activities');
      elem?.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenBooking();
    }
  };

  return (
    <section
      className="relative overflow-hidden pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-14 md:pb-20 border-b border-stone-200/70 bg-gradient-to-b from-[#FAF9F5] via-[#FAF9F5] to-[#F5F2EB]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Organic background glows */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-64 sm:w-80 h-64 sm:h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center min-h-[440px]">
          {/* Left Column: Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Unboxed Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-[#1A5336] mb-3">
              <span>{activeSlide.kicker || 'ONLINE LEARNING FOR AGES 3–12'}</span>
            </div>

            <h1
              key={`title-${activeSlide.id}`}
              className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-[3.15rem] text-[#0F1E36] leading-[1.18] tracking-tight mb-4 transition-all duration-300 break-words"
              style={{ textWrap: 'balance' }}
            >
              {activeSlide.headline}
            </h1>

            <p
              key={`sub-${activeSlide.id}`}
              className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed mb-6 sm:mb-8 max-w-2xl font-normal transition-all duration-300"
            >
              {activeSlide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-8">
              <button
                onClick={() => handleCtaClick(activeSlide.ctaAction)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] cursor-pointer"
              >
                <span>{activeSlide.ctaText || 'Book a Trial Lesson'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#activities"
                className="inline-flex items-center justify-center px-5 py-3.5 text-sm sm:text-base font-semibold text-slate-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336]"
              >
                Learning Activities
              </a>

              <a
                href={getWhatsAppUrl(
                  `Hello Teacher Ngozi, I am interested in: "${activeSlide.headline}". Can you tell me more?`,
                  whatsappNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-medium text-[#1A5336] hover:text-[#133E28] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336]"
                title="Chat with Teacher Ngozi on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-[#1A5336]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="pt-5 border-t border-stone-200/80 grid grid-cols-3 gap-2 sm:gap-4 text-[11px] sm:text-xs md:text-sm text-slate-600">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1A5336] shrink-0" />
                <span className="font-medium text-slate-800">Child-Centred</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium text-slate-800">Interactive Pedagogy</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium text-slate-800">Patience & Care</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative mx-auto max-w-md lg:max-w-none w-full">
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#1A5336]/15 via-amber-200/20 to-[#0F1E36]/10 rounded-2xl filter blur-sm -z-10" />

              <div className="relative bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xl w-full">
                <div className="aspect-[4/3] sm:aspect-[16/10] bg-stone-100 relative overflow-hidden w-full">
                  <img
                    key={activeSlide.imageUrl}
                    src={resolveImageUrl(activeSlide.imageUrl)}
                    alt={activeSlide.headline}
                    onError={(e) => {
                      e.currentTarget.src = resolveImageUrl();
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  {/* Slide navigation controls over image */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentSlideIndex === idx
                              ? 'bg-amber-300 w-5'
                              : 'bg-white/60 hover:bg-white'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs rounded-full p-0.5 border border-white/10">
                      <button
                        onClick={handlePrev}
                        className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
