/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { Introduction } from './components/Introduction';
import { ProgramsSection } from './components/ProgramsSection';
import { LearnerAgeGuide } from './components/LearnerAgeGuide';
import { EducationalGamesSuite } from './components/EducationalGamesSuite';
import { AboutEducator } from './components/AboutEducator';
import { WhyChooseUs } from './components/WhyChooseUs';
import { HowItWorks } from './components/HowItWorks';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ResourcesSection } from './components/ResourcesSection';
import { CallToAction } from './components/CallToAction';
import { ContactSection } from './components/ContactSection';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { BookingContactModal } from './components/BookingContactModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserPortal } from './components/UserPortal';
import { ChildrenBackgroundSoundWidget } from './components/ChildrenBackgroundSoundWidget';
import { Footer } from './components/Footer';

import { collection, doc, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, initAuth, getUserProfile, ADMIN_EMAIL, isUserAdminEmail } from './lib/firebase';
import { getOrCreateLearnerWallet } from './lib/wallet';
import { HeroSlide, SiteSettings, UserProfile, UserWallet } from './types';
import { DEFAULT_HERO_SLIDES, WHATSAPP_CONFIG } from './data/content';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('register');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [userPortalOpen, setUserPortalOpen] = useState(false);
  const [preSelectedProgram, setPreSelectedProgram] = useState<string>('Phonics & Early Reading');

  // Dynamic slides state
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);

  // Dynamic site settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    whatsappNumber: WHATSAPP_CONFIG.cleanNumber,
    supportEmail: 'contact@teachersngozilearners.com',
    announcement: 'Now Enrolling: Personalized Phonics & Reading Lessons for Little Learners',
    tutorTitle: 'Certified Digital Educator & EduConsultant',
    tutorBio: 'With deep expertise in early childhood language development, Teacher Ngozi specialises in helping young children find their voice, discover the joy of reading, and master early literacy through warm, encouraging online lessons.',
  });

  // Track Firebase Auth state & Profile
  useEffect(() => {
    const unsub = initAuth(
      async (user) => {
        setCurrentUser(user);
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setCurrentUserProfile(profile);
            const userWallet = await getOrCreateLearnerWallet(
              profile.walletId,
              profile.childName || profile.displayName,
              profile.email
            );
            setWallet(userWallet);
          }
        }
      },
      () => {
        setCurrentUser(null);
        setCurrentUserProfile(null);
      }
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Listen to Wallet real-time changes
  useEffect(() => {
    const walletId = currentUserProfile?.walletId;
    if (!walletId) {
      setWallet(null);
      return;
    }

    try {
      const unsub = onSnapshot(
        doc(db, 'wallets', walletId),
        (snapshot) => {
          if (snapshot.exists()) {
            setWallet(snapshot.data() as UserWallet);
          }
        },
        (err) => {
          console.warn('Wallet listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Wallet listener note:', e);
    }
  }, [currentUserProfile]);

  // Real-time listener for Hero Slides in Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'hero_slides'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: HeroSlide[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as HeroSlide);
            });
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setSlides(list);
          } else {
            setSlides(DEFAULT_HERO_SLIDES);
          }
        },
        (err) => {
          console.warn('Real-time slides note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Hero slides listener init:', e);
    }
  }, []);

  // Real-time listener for Site Settings in Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        doc(db, 'site_settings', 'global'),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as SiteSettings;
            setSiteSettings((prev) => ({
              ...prev,
              ...data,
              whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
            }));
          }
        },
        (err) => {
          console.warn('Site settings listener note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Site settings listener init:', e);
    }
  }, []);

  // Listen to hash changes for full-page portal route (#portal)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#portal') {
        if (currentUserProfile) {
          setUserPortalOpen(true);
        } else {
          setUserPortalOpen(false);
          setAuthInitialMode('register');
          setAuthModalOpen(true);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentUserProfile]);

  const handleOpenBooking = (programName?: string) => {
    if (programName) {
      setPreSelectedProgram(programName);
    }
    setBookingModalOpen(true);
  };

  const handleOpenAuth = (mode: 'signin' | 'register' = 'register') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectProgramFromSection = (programName: string) => {
    setPreSelectedProgram(programName);
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      setBookingModalOpen(true);
    }
  };

  const isAdmin = !!(currentUser && isUserAdminEmail(currentUser.email));

  // FULL-PAGE USER PORTAL VIEW
  if (userPortalOpen) {
    return (
      <div className="min-h-screen w-full bg-[#FAF9F5]">
        <UserPortal
          onBackToHome={() => {
            setUserPortalOpen(false);
            if (window.location.hash === '#portal') {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          currentUserProfile={currentUserProfile}
          wallet={wallet}
          onOpenBooking={handleOpenBooking}
          onOpenAuth={handleOpenAuth}
          whatsappNumber={siteSettings.whatsappNumber}
          onProfileUpdated={(updated) => {
            setCurrentUserProfile(updated);
          }}
        />

        {/* Children Background Sound Widget */}
        <ChildrenBackgroundSoundWidget />

        {/* Quick Booking Modal available inside portal */}
        <BookingContactModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          preSelectedProgram={preSelectedProgram}
          whatsappNumber={siteSettings.whatsappNumber}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#FAF9F5] text-slate-800 antialiased selection:bg-[#E6F4EC] selection:text-[#1A5336]">
      {/* Top Navigation */}
      <Navbar
        onOpenBooking={handleOpenBooking}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenPortal={() => {
          if (currentUserProfile) {
            setUserPortalOpen(true);
            window.location.hash = '#portal';
          } else {
            handleOpenAuth('register');
          }
        }}
        currentUserProfile={currentUserProfile}
        wallet={wallet}
        whatsappNumber={siteSettings.whatsappNumber}
        announcement={siteSettings.announcement}
        isAdmin={isAdmin}
      />

      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        {/* Real-Time Slide Hero System */}
        <HeroSlider
          slides={slides}
          onOpenBooking={handleOpenBooking}
          whatsappNumber={siteSettings.whatsappNumber}
        />

        {/* Introduction: Learning Begins with a Strong Foundation */}
        <Introduction />

        {/* Programs Section */}
        <ProgramsSection onSelectProgramForBooking={handleSelectProgramFromSection} />

        {/* Interactive Parent Readiness & Age Stage Selector */}
        <LearnerAgeGuide onSelectProgramForBooking={handleSelectProgramFromSection} />

        {/* 3D Educational Games Suite with AI Game Studio & Voice-Over Engine */}
        <EducationalGamesSuite
          onOpenBooking={handleOpenBooking}
          onOpenAuth={handleOpenAuth}
          onOpenPortal={() => {
            if (currentUserProfile) {
              setUserPortalOpen(true);
              window.location.hash = '#portal';
            } else {
              handleOpenAuth('register');
            }
          }}
          currentUserProfile={currentUserProfile}
          whatsappNumber={siteSettings.whatsappNumber}
          externalWallet={wallet}
        />

        {/* Meet the Educator: Teacher Ngozi */}
        <AboutEducator
          onOpenBooking={handleOpenBooking}
          tutorPhotoUrl={siteSettings.tutorPhotoUrl}
          tutorTitle={siteSettings.tutorTitle}
          tutorBio={siteSettings.tutorBio}
          whatsappNumber={siteSettings.whatsappNumber}
        />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* How It Works: 4-Step Process */}
        <HowItWorks onOpenBooking={handleOpenBooking} />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Parent Resources (Articles + Downloadable PDF Guide, Phonics Sounds Chart, Checklist) */}
        <ResourcesSection whatsappNumber={siteSettings.whatsappNumber} />

        {/* Pre-Footer Call to Action */}
        <CallToAction onOpenBooking={handleOpenBooking} />

        {/* Contact & Enquiry Form with Firestore Booking Recording & Gmail dispatch */}
        <ContactSection
          initialProgram={preSelectedProgram}
          whatsappNumber={siteSettings.whatsappNumber}
        />
      </main>

      {/* Footer */}
      <Footer whatsappNumber={siteSettings.whatsappNumber} />

      {/* Floating WhatsApp Contact Button */}
      <WhatsAppFloatingButton whatsappNumber={siteSettings.whatsappNumber} />

      {/* Children Background Sound Widget */}
      <ChildrenBackgroundSoundWidget />

      {/* Family Registration & Educator Sign-In Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={async (profile) => {
          setCurrentUserProfile(profile);
          const w = await getOrCreateLearnerWallet(
            profile.walletId,
            profile.childName || profile.displayName,
            profile.email
          );
          setWallet(w);

          // Route user directly to their respective workspace
          if (profile.role === 'admin' || isUserAdminEmail(profile.email)) {
            setAdminModalOpen(true);
            setUserPortalOpen(false);
          } else {
            setUserPortalOpen(true);
            window.location.hash = '#portal';
            setAdminModalOpen(false);
          }
        }}
      />

      {/* Quick Booking Modal */}
      <BookingContactModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preSelectedProgram={preSelectedProgram}
        whatsappNumber={siteSettings.whatsappNumber}
      />

      {/* Educator & Admin Dashboard (Mission Control, AI Game Studio, Wallets, Slides, Gmail API & Site Settings) */}
      <AdminDashboard
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        currentUser={currentUser}
        onAuthChange={setCurrentUser}
        currentSettings={siteSettings}
        onUpdateSettings={setSiteSettings}
      />
    </div>
  );
}
