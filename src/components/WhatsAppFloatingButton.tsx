import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';

interface WhatsAppFloatingButtonProps {
  whatsappNumber?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ whatsappNumber }) => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-end gap-3 pointer-events-none">
      {/* Gentle helper bubble */}
      {!tooltipDismissed && (
        <div className="hidden sm:flex pointer-events-auto bg-white border border-stone-200/90 shadow-lg rounded-xl p-3 max-w-[210px] items-start gap-2 animate-fade-in">
          <div>
            <p className="text-xs font-bold text-[#0F1E36]">Have questions?</p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Chat directly with Teacher Ngozi on WhatsApp.
            </p>
          </div>
          <button
            onClick={() => setTooltipDismissed(true)}
            className="text-stone-400 hover:text-stone-600 p-0.5"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={getWhatsAppUrl('Hello Teacher Ngozi, I am visiting your website and would love to ask about classes.', whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-full bg-[#1A5336] hover:bg-[#133E28] text-white shadow-xl hover:shadow-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] group"
        aria-label="Chat With Us on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white shrink-0 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
          Chat With Us on WhatsApp
        </span>
      </a>
    </div>
  );
};
