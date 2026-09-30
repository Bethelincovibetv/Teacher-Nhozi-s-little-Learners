import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Menu,
  X,
  BookOpen,
  UserCog,
  User,
  LogOut,
  Coins,
  Sparkles,
  LogIn,
  LayoutDashboard,
  Calendar,
  Award
} from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { UserProfile, UserWallet } from '../types';
import { logout } from '../lib/firebase';

interface NavbarProps {
  onOpenBooking: (programName?: string) => void;
  onOpenAdmin: () => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onOpenPortal: () => void;
  currentUserProfile: UserProfile | null;
  wallet: UserWallet | null;
  whatsappNumber?: string;
  announcement?: string;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenAdmin,
  onOpenAuth,
  onOpenPortal,
  currentUserProfile,
  wallet,
  whatsappNumber,
  announcement,
  isAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Programs', href: '#programs' },
    { label: 'Games & Arcade', href: '#activities' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why Choose Us', href: '#why-choose-us' },
    { label: 'Resources', href: '#resources' },
    { label: 'Contact', href: '#contact' },
  ];

  const childOrUserName = currentUserProfile?.childName || currentUserProfile?.displayName || 'Learner';

  return (
    <>
      {/* Optional Top Announcement Banner */}
      {announcement && (
        <div className="bg-[#0F1E36] text-amber-300 px-3 sm:px-4 py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-semibold tracking-wide border-b border-slate-800 w-full overflow-hidden truncate">
          <span className="truncate inline-block max-w-full">✨ {announcement}</span>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 w-full max-w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs'
            : 'bg-[#FAF9F5] border-b border-stone-200/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Single Brand Wordmark (Responsive & Truncate Safe) */}
          <a
            href="#"
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] rounded-xl min-w-0 shrink"
            aria-label="Teacher Ngozi Little Learners Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F1E36] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1A5336] transition-colors shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <div className="min-w-0 truncate">
              <span className="font-display font-bold text-sm sm:text-base lg:text-lg text-[#0F1E36] tracking-tight block truncate">
                Teacher Ngozi <span className="text-[#1A5336] font-semibold hidden sm:inline">Little Learners</span>
              </span>
            </div>
          </a>

          {/* Zone 2: Clean Text Nav Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold text-slate-700 shrink-0">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#1A5336] transition-colors py-1 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] rounded"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Actions & User Portal Widget */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 shrink-0">
            {/* User Account / Portal Trigger */}
            {currentUserProfile ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-stone-200 hover:border-[#1A5336]/50 shadow-2xs transition-all text-left cursor-pointer"
                  title="Open Portal & Profile Menu"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#1A5336] to-[#0F1E36] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {childOrUserName[0] || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-bold text-xs text-[#0F1E36] truncate max-w-[90px] lg:max-w-[110px] leading-tight">
                      {childOrUserName}
                    </p>
                    {isAdmin ? (
                      <span className="text-[10px] text-amber-600 font-semibold uppercase block leading-none">Educator</span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-0.5 leading-none">
                        <Coins className="w-2.5 h-2.5 text-amber-500" />
                        {wallet?.credits ?? 0} cr
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="font-bold text-xs text-[#0F1E36]">{currentUserProfile.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUserProfile.email}</p>
                      {currentUserProfile.childName && (
                        <p className="text-[11px] text-[#1A5336] mt-0.5 font-medium">
                          Learner: <strong>{currentUserProfile.childName}</strong> ({currentUserProfile.childAge || 'Enrolled'})
                        </p>
                      )}
                    </div>

                    {/* Launch User Portal */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenPortal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#1A5336] bg-emerald-50/60 hover:bg-emerald-100/80 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-[#1A5336]" />
                        <span>Learner & Family Portal</span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0F1E36] hover:bg-stone-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <UserCog className="w-4 h-4 text-[#1A5336]" />
                        <span>Mission Control (Admin)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenPortal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Phonics Mastery & Badges</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {currentUserProfile.masteredSounds?.length ?? 5}/26
                      </span>
                    </button>

                    <a
                      href="#activities"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>Learning Games</span>
                      </span>
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                        {wallet?.credits ?? 0} Credits
                      </span>
                    </a>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl transition-all shadow-xs cursor-pointer"
                title="Family Portal Sign In or Register"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>Family Portal</span>
              </button>
            )}

            {/* Quick Portal Direct Button (for fast 1-tap parent access on desktop/tablet) */}
            {currentUserProfile && (
              <button
                onClick={onOpenPortal}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-[#1A5336] bg-[#E6F4EC] hover:bg-[#d8ece1] rounded-xl transition-colors cursor-pointer"
                title="Open Learner & Family Portal"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Portal</span>
              </button>
            )}

            {/* WhatsApp Quick CTA */}
            <a
              href={getWhatsAppUrl(
                'Hello Teacher Ngozi, I would like to enquire about your online lessons for children.',
                whatsappNumber
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-2 text-xs font-medium text-[#1A5336] bg-[#E6F4EC] hover:bg-[#d8ece1] rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] shrink-0"
              title="Chat on WhatsApp (+234 806 092 7203)"
            >
              <MessageCircle className="w-4 h-4 fill-[#1A5336]" />
              <span className="hidden xl:inline ml-1">WhatsApp</span>
            </a>

            {/* Book Trial Button */}
            <button
              onClick={() => onOpenBooking()}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl shadow-2xs hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] whitespace-nowrap cursor-pointer shrink-0"
            >
              Book Trial
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:bg-stone-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5336] shrink-0 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs flex flex-col justify-start animate-fade-in">
          <div className="bg-[#FAF9F5] border-b border-stone-200 px-5 pt-4 pb-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <a href="#" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-xl bg-[#0F1E36] flex items-center justify-center text-white">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                </div>
                <span className="font-display font-bold text-sm text-[#0F1E36]">
                  Teacher Ngozi <span className="text-[#1A5336]">Little Learners</span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-stone-100 hover:text-[#1A5336] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-stone-200 space-y-2.5">
              {/* User Portal Mobile Action */}
              {currentUserProfile ? (
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#0F1E36]">
                        {currentUserProfile.childName || currentUserProfile.displayName}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-bold">
                        {wallet?.credits ?? 0} Credits • {currentUserProfile.masteredSounds?.length ?? 5} Sounds
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenAdmin();
                        }}
                        className="px-2.5 py-1 bg-[#1A5336] text-white rounded-lg font-bold text-[11px]"
                      >
                        Admin
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenPortal();
                    }}
                    className="w-full py-2.5 bg-[#1A5336] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-300" />
                    <span>Open Learner & Family Portal</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-[#0F1E36] font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-[#1A5336]" />
                  <span>Parent Portal Sign In / Register</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3 bg-[#0F1E36] hover:bg-[#172D52] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Book a Trial Lesson
              </button>

              <a
                href={getWhatsAppUrl(undefined, whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#E6F4EC] hover:bg-[#d8ece1] text-[#1A5336] font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-[#1A5336]" />
                <span>Chat on WhatsApp (+234 806 092 7203)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
