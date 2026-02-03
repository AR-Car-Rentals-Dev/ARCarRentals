/**
 * Email Service using Supabase Edge Functions + Resend API
 * Handles all email communications for the booking system
 * Uses Supabase Edge Function to avoid CORS issues
 */

const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`
  : 'https://dnexspoyhhqflatuyxje.supabase.co/functions/v1/send-booking-email';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface EmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

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
): Promise<EmailResponse> => {
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

/**
 * Send booking confirmed email to customer
 */
export const sendBookingConfirmedEmail = async (
  email: string,
  bookingReference: string,
  bookingDetails: {
    vehicleName: string;
    pickupDate: string;
    returnDate: string;
    pickupLocation?: string;
    totalPrice: number;
  }
): Promise<EmailResponse> => {
  try {
    console.log('📧 Sending booking confirmed email to:', email);
    console.log('📝 Booking Reference:', bookingReference);

    // For now, use the existing magic link function with 'confirmed' type
    // In production, you'd have a dedicated edge function endpoint
    const magicLink = `${window.location.origin}/track/${bookingReference}`;
    
    return await sendMagicLinkEmail(
      email,
      bookingReference,
      magicLink,
      {
        vehicleName: bookingDetails.vehicleName,
        pickupDate: bookingDetails.pickupDate,
        returnDate: bookingDetails.returnDate,
      },
      'confirmed'
    );
  } catch (error) {
    console.error('❌ Error sending booking confirmed email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Send booking declined email to customer with reason and refund instructions
 */
export const sendBookingDeclinedEmail = async (
  email: string,
  bookingReference: string,
  customerName: string,
  declineReason: string,
  customMessage?: string,
  bookingDetails?: {
    vehicleName?: string;
    totalPrice?: number;
  }
): Promise<EmailResponse> => {
  try {
    if (!SUPABASE_ANON_KEY) {
      console.warn('⚠️ Supabase not configured. Decline email not sent.');
      console.log('📧 Email would be sent to:', email);
      console.log('📝 Booking Reference:', bookingReference);
      console.log('❌ Decline Reason:', declineReason);
      return { 
        success: false, 
        error: 'Email service not configured' 
      };
    }

    console.log('📧 Sending booking declined email to:', email);
    console.log('📝 Booking Reference:', bookingReference);
    console.log('❌ Decline Reason:', declineReason);

    // For declined emails, create a tracking link (magic link for tracking purposes)
    const magicLink = `${window.location.origin}/track/${bookingReference}`;

    // Send via edge function with declined type
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
        customerName,
        declineReason,
        customMessage,
        bookingDetails,
        emailType: 'declined',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send decline email:', error);
      return { success: false, error: error.error || 'Failed to send decline email' };
    }

    const data = await response.json();
    console.log('✅ Decline email sent successfully. Message ID:', data.messageId);
    return { success: true, messageId: data.messageId };

  } catch (error) {
    console.error('❌ Error sending decline email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
