import React from 'react';
import { BookOpen, MessageCircle, Mail, Heart } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_CONFIG } from '../data/content';

interface FooterProps {
  whatsappNumber?: string;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ whatsappNumber, onOpenAdmin }) => {
  return (
    <footer className="bg-[#0A1322] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1A5336] flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Teachers Ngozi <span className="text-emerald-400 font-semibold">Little Learners</span>
              </span>
            </div>

            <p className="text-xs text-amber-300/90 font-medium tracking-wide">
              English • Literacy • Phonics • Early Reading • Online Learning
            </p>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Professional online education dedicated to helping young learners build rock-solid foundations in literacy, phonics, and joyful, confident communication.
            </p>

            <div className="pt-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Teacher Ngozi</span> · Certified Digital Educator & EduConsultant
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Navigation
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-emerald-400 transition-colors">About the Educator</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-emerald-400 transition-colors">Learning Programs</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#why-choose-us" className="hover:text-emerald-400 transition-colors">Why Choose Us</a>
              </li>
              <li>
                <a href="#resources" className="hover:text-emerald-400 transition-colors">Parent Resources</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-400 transition-colors">Enquire & Contact</a>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="lg:col-span-4 space-y-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Connect With Us
            </p>

            <div className="space-y-2.5 text-sm">
              <a
                href={getWhatsAppUrl(undefined, whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400" />
                <span>Chat on WhatsApp (+234 806 092 7203)</span>
              </a>

              <a
                href="mailto:contact@teachersngozilearners.com"
                className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>contact@teachersngozilearners.com</span>
              </a>
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-2">Social Channels (Coming Soon)</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
                <span>·</span>
                <span className="hover:text-white cursor-pointer transition-colors">YouTube</span>
                <span>·</span>
                <span className="hover:text-white cursor-pointer transition-colors">Facebook</span>
                <span>·</span>
                <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Teachers Ngozi Little Learners. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-emerald-400 transition-colors underline"
              >
                Educator Portal & Admin
              </button>
            )}
            <span>Professional educator. Caring approach. Strong foundations.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
