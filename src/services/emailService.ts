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
  },
  emailType: 'pending' | 'confirmed' = 'pending'
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
    console.log('📋 Email Type:', emailType);
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
        emailType,
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
