export interface EmailMessage {
  id?: string;
  to: string;
  subject: string;
  body: string;
}

export async function sendGmailMessage(
  accessToken: string,
  emailData: EmailMessage
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const rawEmail = [
      `To: ${emailData.to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(emailData.subject)))}?=`,
      '',
      emailData.body,
    ].join('\r\n');

    // Base64url encode
    const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Failed to send email (${response.status})`);
    }

    const resData = await response.json();
    return { success: true, id: resData.id };
  } catch (err: any) {
    console.error('Gmail send error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchRecentEnquiries(accessToken: string): Promise<any[]> {
  try {
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=subject:(Little Learners OR Lesson OR Trial OR Phonics)',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listRes.ok) return [];
    const listData = await listRes.json();
    if (!listData.messages || !Array.isArray(listData.messages)) return [];

    const details = await Promise.all(
      listData.messages.slice(0, 5).map(async (msg: any) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
        return { id: msg.id, subject, from, date, snippet: msgData.snippet };
      })
    );

    return details.filter(Boolean);
  } catch (error) {
    console.warn('Could not fetch Gmail messages:', error);
    return [];
  }
}

/**
 * Automatically creates and dispatches trial confirmation emails to both Parent and Educator
 */
export async function sendBookingConfirmationEmails(
  booking: {
    parentName: string;
    childName: string;
    childAge: string;
    currentClass: string;
    learningArea: string;
    preferredSchedule: string;
    whatsappNumber: string;
    email: string;
    message?: string;
  },
  educatorEmail: string = 'ngokonkwo2020@gmail.com',
  accessToken?: string | null
): Promise<{
  parentSent: boolean;
  educatorSent: boolean;
  parentEmailHtml: string;
  educatorEmailHtml: string;
  error?: string;
}> {
  // 1. Parent Confirmation HTML
  const parentEmailHtml = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FAF9F5; padding: 30px; color: #1E293B;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E8E3D7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #0F1E36; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Teachers Ngozi Little Learners</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #FCD34D;">English • Phonics • Early Reading • Online Learning</p>
        </div>
        
        <div style="padding: 28px;">
          <h2 style="color: #0F1E36; font-size: 19px; margin-top: 0;">Welcome, ${booking.parentName}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Thank you for registering <strong>${booking.childName}</strong> for our online learning program! We have safely received your enquiry and look forward to partnering with your family.
          </p>

          <div style="background: #F4F1EA; border-radius: 12px; padding: 18px; margin: 20px 0; border-left: 4px solid #1A5336;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #1A5336; text-transform: uppercase;">Your Booking Summary</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Learner:</strong> ${booking.childName} (Age: ${booking.childAge}, Class: ${booking.currentClass})</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Program:</strong> ${booking.learningArea}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Preferred Schedule:</strong> ${booking.preferredSchedule}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>WhatsApp:</strong> ${booking.whatsappNumber}</p>
          </div>

          <h3 style="color: #0F1E36; font-size: 16px; margin-bottom: 8px;">What Happens Next?</h3>
          <ol style="font-size: 14px; line-height: 1.6; color: #475569; padding-left: 20px;">
            <li>Teacher Ngozi will review ${booking.childName}'s starting level and reach out via WhatsApp/email within a few hours.</li>
            <li>We will confirm your exact trial lesson date, virtual classroom link, and simple tech setup.</li>
            <li>Your child will experience an encouraging, joyful baseline session where their strengths shine!</li>
          </ol>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://wa.me/2348060927203?text=Hello%20Teacher%20Ngozi%2C%20I%20have%20submitted%20my%20trial%20lesson%20booking%20for%20my%20child." style="display: inline-block; background-color: #1A5336; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px;">
              Chat with Teacher Ngozi on WhatsApp (+234 806 092 7203)
            </a>
          </div>
        </div>

        <div style="background: #F8F9FA; padding: 16px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0;">Teachers Ngozi Little Learners · Certified Digital Educator & EduConsultant</p>
          <p style="margin: 4px 0 0 0;">Dedicated to building confident young readers.</p>
        </div>
      </div>
    </div>
  `;

  // 2. Educator Alert HTML
  const educatorEmailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #FAF9F5; padding: 25px; color: #1E293B;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #CBD5E1; padding: 24px;">
        <div style="background: #1A5336; color: #ffffff; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">🔔 New Booking Request: ${booking.childName}</h2>
        </div>
        
        <p style="font-size: 15px;">A new parent has booked an introductory trial lesson on the website:</p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #64748B; width: 140px;"><strong>Parent Name:</strong></td><td>${booking.parentName}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;"><strong>Child Name:</strong></td><td><strong>${booking.childName}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;"><strong>Age & Class:</strong></td><td>${booking.childAge} (${booking.currentClass})</td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;"><strong>Learning Focus:</strong></td><td><span style="color: #1A5336; font-weight: bold;">${booking.learningArea}</span></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;"><strong>Preferred Time:</strong></td><td>${booking.preferredSchedule}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;"><strong>WhatsApp:</strong></td><td><a href="https://wa.me/${booking.whatsappNumber.replace(/[^0-9]/g, '')}">${booking.whatsappNumber}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;"><strong>Email:</strong></td><td><a href="mailto:${booking.email}">${booking.email}</a></td></tr>
          ${booking.message ? `<tr><td style="padding: 6px 0; color: #64748B; vertical-align: top;"><strong>Notes/Goals:</strong></td><td><em>${booking.message}</em></td></tr>` : ''}
        </table>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
          <a href="https://wa.me/${booking.whatsappNumber.replace(/[^0-9]/g, '')}" style="background-color: #1A5336; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold; margin-right: 10px;">
            Open WhatsApp Chat
          </a>
          <a href="mailto:${booking.email}?subject=Welcome%20to%20Teachers%20Ngozi%20Little%20Learners" style="background-color: #0F1E36; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
            Reply via Email
          </a>
        </div>
      </div>
    </div>
  `;

  let parentSent = false;
  let educatorSent = false;
  let error: string | undefined;

  // If OAuth access token is active, dispatch both immediately!
  if (accessToken) {
    try {
      // Send to Parent
      const pRes = await sendGmailMessage(accessToken, {
        to: booking.email,
        subject: `Trial Lesson Confirmation for ${booking.childName} · Teachers Ngozi Little Learners`,
        body: parentEmailHtml,
      });
      parentSent = pRes.success;

      // Send to Educator
      const eRes = await sendGmailMessage(accessToken, {
        to: educatorEmail,
        subject: `🔔 New Trial Booking: ${booking.childName} (${booking.learningArea})`,
        body: educatorEmailHtml,
      });
      educatorSent = eRes.success;
    } catch (err: any) {
      error = err.message;
    }
  }

  return {
    parentSent,
    educatorSent,
    parentEmailHtml,
    educatorEmailHtml,
    error,
  };
}
