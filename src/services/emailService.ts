/**
 * Email Service using Supabase Edge Functions + Resend API
 * Handles all email communications for the booking system
 * Uses Supabase Edge Function to avoid CORS issues
 */

const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`
  : 'https://dnexspoyhhqflatuyxje.supabase.co/functions/v1/send-booking-email';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Generate magic link email HTML
 */
const getMagicLinkEmailHTML = (
  bookingReference: string,
  magicLink: string,
  vehicleName?: string,
  pickupDate?: string,
  returnDate?: string
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #E22B2B; padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🚗 Booking Confirmed!
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                AR Car Rentals - Your Journey Starts Here
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px; color: #262626; font-size: 16px; line-height: 1.5;">
                Thank you for choosing AR Car Rentals! Your booking has been successfully confirmed.
              </p>

              <!-- Booking Reference Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF2F2; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #7f1d1d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Booking Reference
                    </p>
                    <p style="margin: 0; color: #E22B2B; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                      ${bookingReference}
                    </p>
                  </td>
                </tr>
              </table>

              ${vehicleName || pickupDate || returnDate ? `
              <!-- Booking Details -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fafafa; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #262626; font-size: 16px; font-weight: 600;">
                  Booking Details
                </h3>
                ${vehicleName ? `
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0; color: #737373; font-size: 13px;">Vehicle</p>
                  <p style="margin: 4px 0 0; color: #262626; font-size: 15px; font-weight: 500;">
                    ${vehicleName}
                  </p>
                </div>
                ` : ''}
                ${pickupDate ? `
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0; color: #737373; font-size: 13px;">Pickup Date</p>
                  <p style="margin: 4px 0 0; color: #262626; font-size: 15px; font-weight: 500;">
                    ${pickupDate}
                  </p>
                </div>
                ` : ''}
                ${returnDate ? `
                <div>
                  <p style="margin: 0; color: #737373; font-size: 13px;">Return Date</p>
                  <p style="margin: 4px 0 0; color: #262626; font-size: 15px; font-weight: 500;">
                    ${returnDate}
                  </p>
                </div>
                ` : ''}
              </div>
              ` : ''}

              <!-- Magic Link Section -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #262626; font-size: 16px; font-weight: 600;">
                  Track Your Booking
                </h3>
                <p style="margin: 0 0 20px; color: #525252; font-size: 14px; line-height: 1.5;">
                  Click the button below to view your booking details, upload documents, and track your reservation status:
                </p>
                
                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" style="margin: 0;">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: #E22B2B;">
                      <a href="${magicLink}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                        View Booking Details
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Link Copy -->
                <div style="margin-top: 20px; padding: 15px; background-color: #fafafa; border-radius: 6px; border-left: 3px solid #E22B2B;">
                  <p style="margin: 0 0 8px; color: #525252; font-size: 12px; font-weight: 600;">
                    Or copy this link:
                  </p>
                  <p style="margin: 0; color: #737373; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">
                    ${magicLink}
                  </p>
                </div>
              </div>

              <!-- Security Notice -->
              <div style="margin: 30px 0 0; padding: 15px; background-color: #FEF3C7; border-radius: 8px; border-left: 3px solid #F59E0B;">
                <p style="margin: 0; color: #92400E; font-size: 13px; line-height: 1.5;">
                  <strong>🔒 Security Notice:</strong> This link is unique to your booking and will expire 24 hours after your return date. Keep this email safe and do not share the link with others.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #525252; font-size: 14px; font-weight: 600;">
                Need help?
              </p>
              <p style="margin: 0 0 15px; color: #737373; font-size: 13px;">
                Contact us at <a href="mailto:info@arcarrentals.com" style="color: #E22B2B; text-decoration: none;">info@arcarrentals.com</a>
                <br>or call <a href="tel:+639177234567" style="color: #E22B2B; text-decoration: none;">+63 917 723 4567</a>
              </p>
              <p style="margin: 20px 0 0; color: #a3a3a3; font-size: 12px;">
                © 2026 AR Car Rentals. All rights reserved.
                <br>Cebu City, Philippines
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Generate plain text version of magic link email
 */
const getMagicLinkEmailText = (
  bookingReference: string,
  magicLink: string,
  vehicleName?: string,
  pickupDate?: string,
  returnDate?: string
) => {
  return `
🚗 Booking Confirmed - AR Car Rentals

Thank you for choosing AR Car Rentals! Your booking has been successfully confirmed.

BOOKING REFERENCE: ${bookingReference}

${vehicleName || pickupDate || returnDate ? `
BOOKING DETAILS:
${vehicleName ? `Vehicle: ${vehicleName}` : ''}
${pickupDate ? `Pickup Date: ${pickupDate}` : ''}
${returnDate ? `Return Date: ${returnDate}` : ''}
` : ''}

TRACK YOUR BOOKING:
Click the link below to view your booking details, upload documents, and track your reservation status:

${magicLink}

🔒 SECURITY NOTICE:
This link is unique to your booking and will expire 24 hours after your return date. Keep this email safe and do not share the link with others.

Need help?
Contact us at info@arcarrentals.com
Call: +63 917 723 4567

© 2026 AR Car Rentals. All rights reserved.
Cebu City, Philippines
  `.trim();
};

/**
 * Send magic link email to customer
 */
export const sendMagicLinkEmail = async (
  email: string,
  bookingReference: string,
  magicLink: string,
  bookingDetails?: {
    vehicleName?: string;
    pickupDate?: string;
    returnDate?: string;
  }
): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    // Check if Supabase is configured
    if (!SUPABASE_ANON_KEY) {
      console.warn('⚠️ Supabase not configured. Email not sent.');
      console.log('📧 Email would be sent to:', email);
      console.log('📝 Booking Reference:', bookingReference);
      console.log('🔗 Magic Link:', magicLink);
      return { 
        success: false, 
        error: 'Email service not configured' 
      };
    }

    console.log('📧 Sending email via Supabase Edge Function to:', email);
    console.log('🔗 Function URL:', SUPABASE_FUNCTION_URL);

    // Call Supabase Edge Function
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        bookingReference,
        magicLink,
        bookingDetails,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send email:', error);
      return { success: false, error: error.error || 'Failed to send email' };
    }

    const data = await response.json();
    console.log('✅ Email sent successfully via Edge Function. Message ID:', data.messageId);
    return { success: true, messageId: data.messageId };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Send booking receipt email
 */
export const sendReceiptEmail = async (
  email: string,
  bookingReference: string,
  receiptUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!RESEND_API_KEY || RESEND_API_KEY === 're_your_resend_api_key_here') {
      console.warn('⚠️ Resend API key not configured. Receipt email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    console.log('📧 Sending receipt email to:', email);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [email],
        subject: `Payment Receipt - ${bookingReference} | AR Car Rentals`,
        html: `
          <h2>Payment Receipt</h2>
          <p>Thank you for your payment!</p>
          <p><strong>Booking Reference:</strong> ${bookingReference}</p>
          <p><a href="${receiptUrl}">Download Receipt</a></p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send receipt email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    console.log('✅ Receipt email sent successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error sending receipt email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export default { sendMagicLinkEmail, sendReceiptEmail };
