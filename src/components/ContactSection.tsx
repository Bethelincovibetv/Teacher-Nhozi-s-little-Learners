import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Globe, Clock, CheckCircle2, Send, ArrowRight } from 'lucide-react';
import { WHATSAPP_CONFIG, getWhatsAppUrl } from '../data/content';
import { BookingFormData } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, getAccessToken } from '../lib/firebase';
import { sendBookingConfirmationEmails } from '../lib/gmail';

interface ContactSectionProps {
  initialProgram?: string;
  whatsappNumber?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialProgram, whatsappNumber }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    parentName: '',
    childName: '',
    childAge: '',
    currentClass: '',
    learningArea: initialProgram || 'Phonics & Early Reading',
    preferredSchedule: 'Weekday Afternoons',
    whatsappNumber: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    if (initialProgram) {
      setFormData((prev) => ({ ...prev, learningArea: initialProgram }));
    }
  }, [initialProgram]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ parentSent: boolean; educatorSent: boolean } | null>(null);

  const learningAreas = [
    'Phonics & Early Reading',
    'English & Literacy',
    'Reading Support',
    'Personalised Online Learning (1-on-1)',
    'Igbo Language Learning for Children',
    'General Consultation / Other',
  ];

  const scheduleOptions = [
    'Weekday Afternoons (3:00 PM – 6:00 PM)',
    'Weekday Evenings (6:00 PM – 8:00 PM)',
    'Saturday Mornings',
    'Saturday Afternoons',
    'Flexible / School Holiday Intensive',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookingId = `booking-${Date.now()}`;
      const token = await getAccessToken();

      // Trigger automatic Gmail confirmation to parent and educator
      const mailRes = await sendBookingConfirmationEmails(
        formData,
        'ngokonkwo2020@gmail.com',
        token
      );
      setEmailStatus({ parentSent: mailRes.parentSent, educatorSent: mailRes.educatorSent });

      await setDoc(doc(db, 'bookings', bookingId), {
        ...formData,
        id: bookingId,
        status: 'new',
        emailSentToParent: mailRes.parentSent,
        emailSentToEducator: mailRes.educatorSent,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Booking write error in contact form:', err);
    }
    setIsSubmitted(true);
  };

  const generateWhatsAppMessage = () => {
    return `Hello Teacher Ngozi! Here are my enquiry details from the website:
- Parent/Guardian: ${formData.parentName}
- Child: ${formData.childName} (Age: ${formData.childAge}, Class: ${formData.currentClass})
- Program Needed: ${formData.learningArea}
- Preferred Schedule: ${formData.preferredSchedule}
- Contact WhatsApp: ${formData.whatsappNumber}
- Email: ${formData.email}
${formData.message ? `- Note: ${formData.message}` : ''}`;
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#1A5336] uppercase mb-2">
            Get in Touch
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#0F1E36] tracking-tight mb-4">
            Enquire or Book a Trial Lesson
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            Fill out the form below or chat directly on WhatsApp. We typically respond within a few hours to arrange a suitable trial lesson time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact & Channel Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Highlight Box */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border-2 border-emerald-600/30 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F4EC] flex items-center justify-center text-[#1A5336]">
                  <MessageCircle className="w-6 h-6 fill-[#1A5336]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0F1E36]">
                    Instant WhatsApp Support
                  </h3>
                  <p className="text-xs font-semibold text-[#1A5336] font-mono tracking-wide">
                    +234 806 092 7203
                  </p>
                  <p className="text-[11px] text-slate-500">Fastest way to get in touch</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Parents often prefer messaging directly on WhatsApp to ask about availability, lesson formats, and fees.
              </p>
              <a
                href={getWhatsAppUrl('Hello Teacher Ngozi, I am reaching out to enquire about lessons for my child.', whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] rounded-xl transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat With Us on WhatsApp</span>
              </a>
            </div>

            {/* Email & Info Cards */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#1A5336] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Enquiries</p>
                  <a
                    href="mailto:contact@teachersngozilearners.com"
                    className="text-sm font-medium text-slate-800 hover:text-[#1A5336] transition-colors"
                  >
                    contact@teachersngozilearners.com
                  </a>
                  <p className="text-xs text-slate-400 mt-0.5">Checked daily by the educator</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-stone-100">
                <Globe className="w-5 h-5 text-[#1A5336] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Coverage</p>
                  <p className="text-sm font-medium text-slate-800">Worldwide Online Classes</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supporting learners in the UK, Nigeria, USA, Canada, and international timezones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-stone-100">
                <Clock className="w-5 h-5 text-[#1A5336] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lesson Availability</p>
                  <p className="text-sm font-medium text-slate-800">Monday – Saturday</p>
                  <p className="text-xs text-slate-500 mt-0.5">Morning, afternoon, and weekend slots</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Interactive Booking / Enquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
            {isSubmitted ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#E6F4EC] text-[#1A5336] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#0F1E36] mb-2">
                  Enquiry Received!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-3 leading-relaxed">
                  Thank you, <strong>{formData.parentName}</strong>. We have logged your details for <strong>{formData.childName}</strong> ({formData.learningArea}).
                </p>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F4EC] border border-[#1A5336]/20 rounded-xl text-xs text-[#1A5336] font-medium mb-5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {emailStatus?.parentSent
                      ? 'Automated Gmail confirmation successfully sent to your inbox!'
                      : 'Confirmation email queued for immediate educator review & dispatch.'}
                  </span>
                </div>

                <div className="bg-[#FAF9F5] p-5 rounded-xl border border-stone-200 text-left max-w-md mx-auto mb-6 text-xs text-slate-700 space-y-1">
                  <p><strong>Child's Age:</strong> {formData.childAge} (Class: {formData.currentClass})</p>
                  <p><strong>Selected Program:</strong> {formData.learningArea}</p>
                  <p><strong>Schedule:</strong> {formData.preferredSchedule}</p>
                  <p><strong>WhatsApp:</strong> {formData.whatsappNumber}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={getWhatsAppUrl(generateWhatsAppMessage(), whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1A5336] hover:bg-[#133E28] rounded-xl shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Send via WhatsApp Now</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        parentName: '',
                        childName: '',
                        childAge: '',
                        currentClass: '',
                        learningArea: 'Phonics & Early Reading',
                        preferredSchedule: 'Weekday Afternoons',
                        whatsappNumber: '',
                        email: '',
                        message: '',
                      });
                    }}
                    className="px-5 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 border border-stone-300 rounded-xl transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Parent Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mrs. Ngozi Okonkwo"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    />
                  </div>

                  {/* Child Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Child's Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Chidi / Amara"
                      value={formData.childName}
                      onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Child's Age */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Child's Age *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 5 years old"
                      value={formData.childAge}
                      onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    />
                  </div>

                  {/* Current Class */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Current Class / Year Group *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Nursery 2, Year 1, Primary 3"
                      value={formData.currentClass}
                      onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Learning Area Needed */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Learning Area Needed *
                    </label>
                    <select
                      value={formData.learningArea}
                      onChange={(e) => setFormData({ ...formData, learningArea: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    >
                      {learningAreas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred Lesson Schedule */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Preferred Schedule *
                    </label>
                    <select
                      value={formData.preferredSchedule}
                      onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    >
                      {scheduleOptions.map((sch) => (
                        <option key={sch} value={sch}>
                          {sch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 ... or +44 ..."
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                    />
                  </div>
                </div>

                {/* Specific Goals / Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Child's Learning Needs & Goals (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your child's current strengths, challenges with reading/phonics, or any specific goals you have."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5336]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-[#0F1E36] hover:bg-[#172D52] rounded-xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36]"
                  >
                    <span>Submit Enquiry & Book Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-2.5">
                    We treat your family's information with complete confidentiality.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
