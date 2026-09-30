import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { BookingFormData } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, getAccessToken } from '../lib/firebase';
import { sendBookingConfirmationEmails } from '../lib/gmail';

interface BookingContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProgram?: string;
  whatsappNumber?: string;
}

export const BookingContactModal: React.FC<BookingContactModalProps> = ({
  isOpen,
  onClose,
  preSelectedProgram,
  whatsappNumber,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    parentName: '',
    childName: '',
    childAge: '',
    currentClass: '',
    learningArea: preSelectedProgram || 'Phonics & Early Reading',
    preferredSchedule: 'Weekday Afternoons',
    whatsappNumber: '',
    email: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailDispatched, setEmailDispatched] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookingId = `booking-${Date.now()}`;
      const token = await getAccessToken();

      const mailRes = await sendBookingConfirmationEmails(
        formData,
        'ngokonkwo2020@gmail.com',
        token
      );
      setEmailDispatched(mailRes.parentSent);

      await setDoc(doc(db, 'bookings', bookingId), {
        ...formData,
        id: bookingId,
        status: 'new',
        emailSentToParent: mailRes.parentSent,
        emailSentToEducator: mailRes.educatorSent,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Booking write error:', err);
    }
    setIsSubmitted(true);
  };

  const generateWhatsAppMessage = () => {
    return `Hello Teacher Ngozi! I would like to book a trial lesson from the website modal:
- Parent: ${formData.parentName}
- Child: ${formData.childName} (Age: ${formData.childAge}, Class: ${formData.currentClass})
- Program: ${formData.learningArea}
- Schedule: ${formData.preferredSchedule}
- WhatsApp: ${formData.whatsappNumber}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 mb-6">
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0F1E36]">
              Book a Trial Lesson
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Start with an introductory assessment with Teacher Ngozi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-stone-100"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E6F4EC] text-[#1A5336] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-display font-bold text-xl text-[#0F1E36] mb-1">
              Enquiry Received!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Thank you, <strong>{formData.parentName}</strong>. We look forward to meeting <strong>{formData.childName}</strong>!
            </p>

            <a
              href={getWhatsAppUrl(generateWhatsAppMessage(), whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] rounded-xl mb-3 shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Connect on WhatsApp Instantly</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-600 hover:text-slate-900 border border-stone-200 rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Child's Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Child's first name"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Child's Age *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 5 years old"
                  value={formData.childAge}
                  onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Class *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Reception, Primary 2"
                  value={formData.currentClass}
                  onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Learning Area Needed *
              </label>
              <select
                value={formData.learningArea}
                onChange={(e) => setFormData({ ...formData, learningArea: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
              >
                <option value="Phonics & Early Reading">Phonics & Early Reading</option>
                <option value="English & Literacy">English & Literacy</option>
                <option value="Reading Support">Reading Support</option>
                <option value="Personalised Online Learning">Personalised Online Learning</option>
                <option value="Igbo Language Learning for Children">Igbo Language Learning</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234 ... or +44 ..."
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl shadow-xs transition-colors"
              >
                <span>Submit & Confirm Trial Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
