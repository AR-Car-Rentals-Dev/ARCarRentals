// Supabase Edge Function for sending booking confirmation emails via Resend
// Deploy with: supabase functions deploy send-booking-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// EMAIL ASSETS CONFIGURATION
// Using Supabase Storage for reliable email asset delivery
const SUPABASE_PROJECT_REF = 'dnexspoyhhqflatuyxje'
const ASSET_BASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/email-assets`

// Email assets hosted on Supabase Storage
// Upload hero banner and logo to the 'email-assets' bucket in Supabase Dashboard
const EMAIL_ASSETS = {
  hero: `${ASSET_BASE_URL}/emailHero.png`,
  logo: `${ASSET_BASE_URL}/ARCarRentals.png`,
  car: `${ASSET_BASE_URL}/carSectionImage.png`,
  background: `${ASSET_BASE_URL}/CCLEXOverlay.png`
}

interface EmailRequest {
  email: string
  bookingReference: string
  magicLink: string
  emailType?: 'pending' | 'confirmed' | 'declined' | 'refund_completed' | 'refund_pending'  // Type of email to send
  customerName?: string
  declineReason?: string
  customMessage?: string
  bookingDetails?: {
    vehicleName?: string
    pickupDate?: string
    returnDate?: string
    totalPrice?: number
    customerName?: string
    declineReason?: string
    customMessage?: string
  }
  refundDetails?: {
    vehicleName?: string
    totalPrice?: number
    refundReferenceId?: string
    refundProofUrl?: string
    cancellationReason?: string
  }
}

// ============================================================================
// SHARED EMAIL COMPONENTS (Reusable HTML Sections)
// ============================================================================

// Hero Banner Section (Branded Visual)
const getHeroBanner = () => `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding: 24px 24px 0 24px;">
        <img src="${EMAIL_ASSETS.hero}" alt="AR Car Rentals" width="552" style="display: block; width: 100%; max-width: 552px; height: auto; border-radius: 12px;" />
      </td>
    </tr>
  </table>
`

// Status Stepper with different flows for confirmed vs refunded
const getStatusStepper = (currentStep: 'received' | 'confirmed' | 'refunded') => {
  // Different steps for refund flow vs normal flow
  const steps = currentStep === 'refunded' 
    ? [
        { key: 'received', label: 'Received' },
        { key: 'reviewed', label: 'Reviewed' },
        { key: 'refunded', label: 'Refunded' }
      ]
    : currentStep === 'confirmed'
    ? [
        { key: 'received', label: 'Received' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'ready', label: 'Ready' }
      ]
    : [
        { key: 'received', label: 'Received' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'ready', label: 'Ready' }
      ];

  const stepHTML = steps.map((step, index) => {
    let isActive = false;
    let isPast = false;
    
    if (currentStep === 'received') {
      isActive = step.key === 'received';
      isPast = false;
    } else if (currentStep === 'confirmed') {
      // Both received and confirmed are done (green checkmarks)
      isPast = step.key === 'received' || step.key === 'confirmed';
      isActive = false; // No active step, both are completed
    } else if (currentStep === 'refunded') {
      isActive = step.key === 'refunded';
      isPast = step.key === 'received' || step.key === 'reviewed';
    }
    
    // Determine icon and styling
    let iconContent = '○';
    let iconColor = '#a3a3a3';
    let bgColor = '#f5f5f5';
    let borderStyle = '2px solid #e5e5e5';
    
    if (isPast) {
      iconContent = '✓';
      iconColor = '#ffffff';
      bgColor = '#166534';
      borderStyle = 'none';
    } else if (isActive) {
      iconContent = '●';
      iconColor = '#ffffff';
      bgColor = '#E22B2B';
      borderStyle = 'none';
    }
    
    return `
      <td align="center" style="padding: 0 12px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: ${bgColor};
                border: ${borderStyle};
                color: ${iconColor};
                margin: 0 auto 12px;
                font-size: ${isPast ? '20px' : '18px'};
                font-weight: ${isPast ? '700' : '400'};
                line-height: 40px;
                text-align: center;">
                ${iconContent}
              </div>
              <p style="margin: 0; color: ${isPast ? '#171717' : '#737373'}; font-size: 13px; font-weight: ${isPast ? '600' : '400'}; line-height: 1.4; text-align: center;">
                ${step.label}
              </p>
            </td>
          </tr>
        </table>
      </td>
      ${index < steps.length - 1 ? `
      <td style="padding: 0 4px; vertical-align: top; padding-top: 16px;">
        <div style="width: 32px; height: 2px; background-color: ${isPast ? '#166534' : '#e5e5e5'}; margin-top: 4px;"></div>
      </td>` : ''}
    `
  }).join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" style="display: inline-table;">
          <tr>
            ${stepHTML}
          </tr>
        </table>
      </td>
    </tr>
  </table>
`
}

// Booking Reference Card (Most Prominent)
const getBookingReferenceCard = (bookingReference: string) => `
  <div style="background: #E22B2B; border-radius: 10px; padding: 32px 28px; margin-bottom: 28px; text-align: center;">
    <p style="margin: 0 0 12px; color: rgba(255, 255, 255, 0.8); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em;">
      Booking Reference
    </p>
    <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 0.08em; font-family: 'Courier New', monospace; line-height: 1.2;">
      ${bookingReference}
    </p>
    <p style="margin: 16px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; line-height: 1.5;">
      Save this reference to track your booking
    </p>
  </div>
`

// Booking Details Card
const getBookingDetailsCard = (vehicleName?: string, pickupDate?: string, returnDate?: string) => {
  if (!vehicleName && !pickupDate && !returnDate) return ''
  
  return `
    <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 20px; color: #171717; font-size: 15px; font-weight: 600; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5;">
        Booking Details
      </h3>
      ${vehicleName ? `
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f5f5f5;">
          <p style="margin: 0 0 6px; color: #737373; font-size: 13px; font-weight: 500;">Vehicle</p>
          <p style="margin: 0; color: #171717; font-size: 16px; font-weight: 600; line-height: 1.4;">
            ${vehicleName}
          </p>
        </div>
      ` : ''}
      ${pickupDate ? `
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f5f5f5;">
          <p style="margin: 0 0 6px; color: #737373; font-size: 13px; font-weight: 500;">Pickup Date</p>
          <p style="margin: 0; color: #171717; font-size: 16px; font-weight: 600; line-height: 1.4;">
            ${pickupDate}
          </p>
        </div>
      ` : ''}
      ${returnDate ? `
        <div>
          <p style="margin: 0 0 6px; color: #737373; font-size: 13px; font-weight: 500;">Return Date</p>
          <p style="margin: 0; color: #171717; font-size: 16px; font-weight: 600; line-height: 1.4;">
            ${returnDate}
          </p>
        </div>
      ` : ''}
    </div>
  `
}

// CTA Button (Consistent across all templates)
const getTrackBookingCTA = (magicLink: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 16px;">
    <tr>
      <td align="center">
        <a href="${magicLink}" style="
          display: inline-block;
          background-color: #E22B2B;
          color: #ffffff;
          text-decoration: none;
          padding: 16px 48px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 2px 8px rgba(226, 43, 43, 0.3);
        ">
          Track Your Booking
        </a>
      </td>
    </tr>
  </table>
  
  <p style="margin: 0 0 8px; color: #737373; font-size: 12px; text-align: center; line-height: 1.5;">
    Or copy and paste this URL into your browser:
  </p>
  
  <div style="background-color: #fafafa; border: 1px solid #e5e5e5; padding: 12px; border-radius: 6px; margin-bottom: 24px; word-break: break-all; text-align: center;">
    <a href="${magicLink}" style="color: #525252; text-decoration: none; font-size: 12px;">
      ${magicLink}
    </a>
  </div>
  
  <div style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; margin-bottom: 32px;">
    <p style="margin: 0; color: #525252; font-size: 13px; line-height: 1.5;">
      <strong style="color: #171717;">🔒 Security Notice:</strong> This link is unique to your booking and will expire 24 hours after your return date.
    </p>
  </div>
`

// Footer Section
const getEmailFooter = () => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-top: 1px solid #e5e5e5; padding: 32px 24px;">
    <tr>
      <td align="center">
        <h3 style="margin: 0 0 16px; color: #171717; font-size: 15px; font-weight: 600;">
          Need Help?
        </h3>
        <p style="margin: 0 0 12px; color: #525252; font-size: 14px; line-height: 1.6;">
          Our support team is here to assist you
        </p>
        <p style="margin: 0 0 8px; color: #525252; font-size: 14px;">
          <strong style="color: #171717;">📞 Phone:</strong> +63 956 662 5224
        </p>
        <p style="margin: 0 0 8px; color: #525252; font-size: 14px;">
          <strong style="color: #171717;">📧 Email:</strong> <a href="mailto:info@arcarrentals.com" style="color: #E22B2B; text-decoration: none;">info@arcarrentals.com</a>
        </p>
        <p style="margin: 0 0 20px; color: #525252; font-size: 14px;">
          <strong style="color: #171717;">⏰ Hours:</strong> Monday - Saturday, 10:00am - 5:30pm
        </p>
        
        <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0 0 8px; color: #737373; font-size: 12px; line-height: 1.6;">
            You received this email because you booked with AR Car Rentals.
          </p>
          <p style="margin: 0; color: #a3a3a3; font-size: 11px; line-height: 1.6;">
            © 2026 AR Car Rentals. All rights reserved.<br>
            Cebu City, Philippines
          </p>
        </div>
      </td>
    </tr>
  </table>
`

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

// Email HTML template for pending bookings (waiting for admin approval)
const getPendingEmailHTML = (
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
  <meta name="x-apple-disable-message-reformatting">
  <title>Booking Received - Awaiting Confirmation</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
    Booking received - awaiting admin approval. Reference: ${bookingReference}
  </div>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
          
          ${getHeroBanner()}
          
          <!-- Content Area -->
          <tr>
            <td class="content" style="padding: 40px 32px;">
              
              <!-- Title -->
              <h1 style="margin: 0 0 12px; color: #171717; font-size: 32px; font-weight: 700; text-align: center; line-height: 1.3;">
                Booking Received
              </h1>
              <p style="margin: 0 0 32px; color: #737373; font-size: 16px; text-align: center; line-height: 1.6;">
                Thank you for submitting your booking request! We've received your payment receipt and our team is currently reviewing it.
              </p>
              
              ${getStatusStepper('received')}
              
              <!-- Notice -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 0 0 32px;">
                <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.7;">
                  <strong style="color: #78350f; font-size: 16px;">⏰ Pending Admin Approval</strong><br>
                  <span style="margin-top: 8px; display: block;">Your booking will be confirmed once our admin team verifies your payment. You'll receive another email as soon as your booking is approved!</span>
                </p>
              </div>
              
              ${getBookingReferenceCard(bookingReference)}
              
              ${getBookingDetailsCard(vehicleName, pickupDate, returnDate)}
              
              <!-- What Happens Next -->
              <div style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 28px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 20px; color: #171717; font-size: 17px; font-weight: 600;">
                  What Happens Next?
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #525252; font-size: 15px; line-height: 2;">
                  <li style="margin-bottom: 8px;">Our admin team will review your payment receipt</li>
                  <li style="margin-bottom: 8px;">You'll receive a confirmation email once approved (usually within 24 hours)</li>
                  <li style="margin-bottom: 8px;">Your booking status will be updated to "Confirmed"</li>
                  <li>You can pick up your vehicle on the scheduled date</li>
                </ol>
              </div>
              
              ${getTrackBookingCTA(magicLink)}

            </td>
          </tr>

          ${getEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Email HTML template for confirmed bookings
const getConfirmedEmailHTML = (
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
  <meta name="x-apple-disable-message-reformatting">
  <title>Booking Confirmation</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
    Your booking is confirmed! Reference: ${bookingReference}
  </div>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
          
          ${getHeroBanner()}
          
          <!-- Content Area -->
          <tr>
            <td class="content" style="padding: 40px 32px;">
              
              <!-- Title -->
              <h1 style="margin: 0 0 8px; color: #171717; font-size: 28px; font-weight: 700; text-align: center; line-height: 1.2;">
                Booking Confirmed
              </h1>
              <p style="margin: 0 0 24px; color: #737373; font-size: 15px; text-align: center; line-height: 1.5;">
                Thank you for choosing AR Car Rentals! Your booking has been successfully confirmed.
              </p>
              
              ${getStatusStepper('confirmed')}
              
              <!-- Success Notice -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 32px 0 24px;">
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #166534;">✓ Payment Verified</strong><br>
                  Your payment has been verified and your booking is now confirmed. Get ready for your journey!
                </p>
              </div>
              
              ${getBookingReferenceCard(bookingReference)}
              
              ${getBookingDetailsCard(vehicleName, pickupDate, returnDate)}
              
              ${getTrackBookingCTA(magicLink)}

            </td>
          </tr>

          ${getEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Email HTML template for declined/cancelled bookings
const getDeclinedEmailHTML = (
  bookingReference: string,
  customerName: string,
  declineReason: string,
  customMessage?: string,
  vehicleName?: string,
  totalPrice?: number
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #991B1B; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ❌ Booking Cancelled
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                AR Car Rentals - Booking Update
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; color: #262626; font-size: 16px; line-height: 1.5;">
                Dear ${customerName},
              </p>

              <p style="margin: 0 0 20px; color: #262626; font-size: 16px; line-height: 1.5;">
                We regret to inform you that your booking request has been cancelled by our team.
              </p>

              <!-- Booking Reference -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF2F2; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #7f1d1d; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      Booking Reference
                    </p>
                    <p style="margin: 0; color: #991B1B; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                      ${bookingReference}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Decline Reason -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #92400E; font-size: 14px; font-weight: 600;">
                  Reason for Cancellation:
                </p>
                <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.6;">
                  ${declineReason}
                </p>
              </div>

              ${customMessage ? `
              <!-- Additional Message -->
              <div style="margin: 20px 0; padding: 20px; background-color: #fafafa; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #262626; font-size: 14px; font-weight: 600;">
                  Additional Information:
                </p>
                <p style="margin: 0; color: #525252; font-size: 14px; line-height: 1.6;">
                  ${customMessage}
                </p>
              </div>
              ` : ''}

              ${vehicleName ? `
              <!-- Booking Details -->
              <div style="margin: 20px 0; padding: 20px; background-color: #fafafa; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #262626; font-size: 16px; font-weight: 600;">
                  Cancelled Booking Details
                </h3>
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0; color: #737373; font-size: 13px;">Vehicle</p>
                  <p style="margin: 4px 0 0; color: #262626; font-size: 15px; font-weight: 500;">
                    ${vehicleName}
                  </p>
                </div>
                ${totalPrice ? `
                <div>
                  <p style="margin: 0; color: #737373; font-size: 13px;">Amount</p>
                  <p style="margin: 4px 0 0; color: #262626; font-size: 15px; font-weight: 500;">
                    ₱${totalPrice.toLocaleString()}
                  </p>
                </div>
                ` : ''}
              </div>
              ` : ''}

              <!-- Refund Information -->
              <div style="background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #1E40AF; font-size: 14px; font-weight: 600;">
                  💰 Refund Information
                </p>
                <p style="margin: 0; color: #1E3A8A; font-size: 14px; line-height: 1.6;">
                  If you have already made a payment, please contact our support team to process your refund. Refunds are typically processed within 5-7 business days.
                </p>
              </div>

              <!-- Contact Information -->
              <div style="margin: 30px 0; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
                <h3 style="margin: 0 0 12px; color: #262626; font-size: 16px; font-weight: 600;">
                  Need Help?
                </h3>
                <p style="margin: 0 0 12px; color: #525252; font-size: 14px; line-height: 1.6;">
                  If you have any questions or would like to make a new booking, please contact us:
                </p>
                <p style="margin: 0; color: #525252; font-size: 14px; line-height: 1.8;">
                  📞 <strong>Phone:</strong> +63 956 662 5224<br>
                  📧 <strong>Email:</strong> info@arcarrentals.com<br>
                  ⏰ <strong>Hours:</strong> Monday - Saturday, 10:00am - 5:30pm
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #737373; font-size: 14px; line-height: 1.6;">
                We apologize for any inconvenience this may cause. We hope to serve you in the future.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #737373; font-size: 12px; line-height: 1.6;">
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
  `
}

// Email HTML template for refund completed
const getRefundCompletedEmailHTML = (
  bookingReference: string,
  cancellationReason: string,
  vehicleName?: string,
  totalPrice?: number,
  refundReferenceId?: string
) => {
  // Map technical reason codes to user-friendly messages
  const reasonMessages = {
    'payment_failed': 'We were unable to verify your payment',
    'vehicle_unavailable': 'The vehicle you selected is no longer available for your requested dates',
    'other': 'Your booking could not be accommodated at this time'
  }

  const displayReason = reasonMessages[cancellationReason as keyof typeof reasonMessages] || cancellationReason

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Booking Refunded</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
    Your booking has been refunded. Reference: ${bookingReference}
  </div>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
          
          ${getHeroBanner()}
          
          <!-- Content Area -->
          <tr>
            <td class="content" style="padding: 40px 32px;">
              
              <!-- Title -->
              <h1 style="margin: 0 0 8px; color: #171717; font-size: 28px; font-weight: 700; text-align: center; line-height: 1.2;">
                Booking Refunded
              </h1>
              <p style="margin: 0 0 24px; color: #737373; font-size: 15px; text-align: center; line-height: 1.5;">
                We regret to inform you that we had to cancel your booking. Your full refund has been completed.
              </p>
              
              ${getStatusStepper('refunded')}
              
              ${getBookingReferenceCard(bookingReference)}
              
              <!-- Cancellation Reason -->
              <div style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #171717; font-size: 14px; font-weight: 600;">
                  Reason for Cancellation:
                </p>
                <p style="margin: 0; color: #525252; font-size: 14px; line-height: 1.6;">
                  ${displayReason}
                </p>
              </div>

              ${vehicleName || totalPrice ? `
              <!-- Booking Details Card -->
              <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 20px; color: #171717; font-size: 15px; font-weight: 600; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5;">
                  Cancelled Booking Details
                </h3>
                ${vehicleName ? `
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <p style="margin: 0; color: #737373; font-size: 13px;">Vehicle</p>
                  <p style="margin: 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">
                    ${vehicleName}
                  </p>
                </div>
                ` : ''}
                ${totalPrice ? `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <p style="margin: 0; color: #737373; font-size: 13px;">Refund Amount</p>
                  <p style="margin: 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">
                    ₱${totalPrice.toLocaleString()}
                  </p>
                </div>
                ` : ''}
              </div>
              ` : ''}

              <!-- Refund Status Card -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #166534; font-size: 15px; font-weight: 600;">
                  ✓ Refund Completed
                </h3>
                <p style="margin: 0 0 12px; color: #166534; font-size: 14px; line-height: 1.6;">
                  Your refund has been completed successfully. Please check the attached refund proof for your records.
                </p>
                ${refundReferenceId ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #dcfce7;">
                  <p style="margin: 0 0 6px; color: #166534; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                    Refund Reference ID
                  </p>
                  <p style="margin: 0; color: #171717; font-size: 14px; font-family: 'Courier New', monospace; font-weight: 600;">
                    ${refundReferenceId}
                  </p>
                </div>
                ` : ''}
              </div>

              <div style="text-align: center; padding: 24px 0;">
                <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.6;">
                  We apologize for any inconvenience. Thank you for considering AR Car Rentals,<br>and we hope to serve you in the future.
                </p>
              </div>

            </td>
          </tr>

          ${getEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Email HTML template for refund pending (when refund proof is uploaded but not yet processed)
const getRefundPendingEmailHTML = (
  bookingReference: string,
  cancellationReason: string,
  vehicleName?: string,
  totalPrice?: number
) => {
  // Map technical reason codes to user-friendly messages
  const reasonMessages = {
    'payment_failed': 'We were unable to verify your payment',
    'vehicle_unavailable': 'The vehicle you selected is no longer available for your requested dates',
    'other': 'Your booking could not be accommodated at this time'
  }

  const displayReason = reasonMessages[cancellationReason as keyof typeof reasonMessages] || cancellationReason

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Being Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #F59E0B; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ⏳ Refund Being Processed
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                AR Car Rentals - Your refund is in progress
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; color: #262626; font-size: 16px; line-height: 1.5;">
                We regret to inform you that we had to cancel your booking. We have received your refund proof and are currently completing your refund.
              </p>

              <!-- Booking Reference -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFBEB; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #92400E; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      Booking Reference
                    </p>
                    <p style="margin: 0; color: #F59E0B; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                      ${bookingReference}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Cancellation Reason -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #92400E; font-size: 14px; font-weight: 600;">
                  Reason for Cancellation:
                </p>
                <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.6;">
                  ${displayReason}
                </p>
              </div>

              ${vehicleName || totalPrice ? `
              <!-- Booking Details -->
              <div style="margin: 20px 0; padding: 20px; background-color: #fafafa; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #262626; font-size: 16px; font-weight: 600;">
                  Cancelled Booking Details
                </h3>
                ${vehicleName ? `
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0; color: #737373; font-size: 13px;">Vehicle</p>
                  <p style="margin: 4px 0 0; color: #262626; font-size: 15px; font-weight: 500;">
                    ${vehicleName}
                  </p>
                </div>
                ` : ''}
                ${totalPrice ? `
                <div>
                  <p style="margin: 0; color: #737373; font-size: 13px;">Refund Amount</p>
                  <p style="margin: 4px 0 0; color: #262626; font-size: 15px; font-weight: 500;">
                    ₱${totalPrice.toLocaleString()}
                  </p>
                </div>
                ` : ''}
              </div>
              ` : ''}

              <!-- Status Alert -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px; color: #92400E; font-size: 16px; font-weight: 600;">
                  ⏰ Completing Your Refund
                </h3>
                <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.6;">
                  Our admin team has received your refund proof and is finalizing your refund. You'll receive another email with your refund reference ID shortly.
                </p>
              </div>

              <!-- Contact Information -->
              <div style="margin: 30px 0; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
                <h3 style="margin: 0 0 12px; color: #262626; font-size: 16px; font-weight: 600;">
                  Questions About Your Refund?
                </h3>
                <p style="margin: 0 0 12px; color: #525252; font-size: 14px; line-height: 1.6;">
                  If you have any questions, please contact us:
                </p>
                <p style="margin: 0; color: #525252; font-size: 14px; line-height: 1.8;">
                  📞 <strong>Phone:</strong> +63 956 662 5224<br>
                  📧 <strong>Email:</strong> info@arcarrentals.com<br>
                  ⏰ <strong>Hours:</strong> Monday - Saturday, 10:00am - 5:30pm
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #737373; font-size: 14px; line-height: 1.6;">
                We apologize for any inconvenience. Thank you for your patience.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #737373; font-size: 12px; line-height: 1.6;">
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
  `
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Parse request body
    const { 
      email, 
      bookingReference, 
      magicLink, 
      emailType = 'pending', 
      bookingDetails,
      refundDetails 
    }: EmailRequest = await req.json()

    // Validate required fields
    if (!email || !bookingReference || !magicLink) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email, bookingReference, or magicLink' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📧 Sending email to:', email)
    console.log('📝 Booking Reference:', bookingReference)
    console.log('📋 Email Type:', emailType)

    // Prepare email body
    const emailBody: any = {
      from: 'AR Car Rentals <info@arcarrentalscebu.com>',
      to: [email],
      reply_to: 'info@arcarrentalscebu.com',
      subject: '',
      html: '',
    }

    // Choose the appropriate email template and subject based on emailType
    let emailHTML: string
    let subject: string

    if (emailType === 'refund_completed') {
      // Refund completed email
      emailHTML = getRefundCompletedEmailHTML(
        bookingReference,
        refundDetails?.cancellationReason || 'other',
        refundDetails?.vehicleName,
        refundDetails?.totalPrice,
        refundDetails?.refundReferenceId
      )
      subject = `Booking Refunded - ${bookingReference} | AR Car Rentals`
    } else if (emailType === 'refund_pending') {
      // Refund pending email
      emailHTML = getRefundPendingEmailHTML(
        bookingReference,
        refundDetails?.cancellationReason || 'other',
        refundDetails?.vehicleName,
        refundDetails?.totalPrice
      )
      subject = `Refund Being Processed - ${bookingReference} | AR Car Rentals`
    } else if (emailType === 'declined') {
      // Declined/Cancelled booking email
      emailHTML = getDeclinedEmailHTML(
        bookingReference,
        bookingDetails?.customerName || 'Valued Customer',
        bookingDetails?.declineReason || 'Your booking request could not be accommodated at this time.',
        bookingDetails?.customMessage,
        bookingDetails?.vehicleName,
        bookingDetails?.totalPrice
      )
      subject = `Booking Cancelled - ${bookingReference} | AR Car Rentals`
    } else if (emailType === 'confirmed') {
      // Confirmed booking email
      emailHTML = getConfirmedEmailHTML(
        bookingReference,
        magicLink,
        bookingDetails?.vehicleName,
        bookingDetails?.pickupDate,
        bookingDetails?.returnDate
      )
      subject = `Booking Confirmed - ${bookingReference} | AR Car Rentals`
    } else {
      // Pending booking email (default)
      emailHTML = getPendingEmailHTML(
        bookingReference,
        magicLink,
        bookingDetails?.vehicleName,
        bookingDetails?.pickupDate,
        bookingDetails?.returnDate
      )
      subject = `Booking Received - ${bookingReference} (Awaiting Confirmation) | AR Car Rentals`
    }

    // Set subject and HTML
    emailBody.subject = subject
    emailBody.html = emailHTML

    // If refund completed, attach the refund proof image
    if (emailType === 'refund_completed' && refundDetails?.refundProofUrl) {
      try {
        console.log('📎 Fetching refund proof to attach:', refundDetails.refundProofUrl)
        
        // Fetch the image from Supabase Storage
        const imageResponse = await fetch(refundDetails.refundProofUrl)
        
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer()
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
          
          // Extract filename from URL or use booking reference
          const urlParts = refundDetails.refundProofUrl.split('/')
          const filename = urlParts[urlParts.length - 1] || `refund-proof-${bookingReference}.jpg`
          
          // Determine content type from filename
          const extension = filename.split('.').pop()?.toLowerCase() || 'jpg'
          const contentType = extension === 'png' ? 'image/png' : 'image/jpeg'
          
          emailBody.attachments = [{
            filename: `Refund-Proof-${bookingReference}.${extension}`,
            content: base64Image,
            content_type: contentType,
          }]
          
          console.log('✅ Refund proof attached successfully')
        } else {
          console.warn('⚠️ Could not fetch refund proof image, sending email without attachment')
        }
      } catch (attachError) {
        console.error('❌ Error attaching refund proof:', attachError)
        console.log('📧 Continuing to send email without attachment')
      }
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Resend API error:', data)
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to send email' }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Email sent successfully. ID:', data.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: data.id,
        message: 'Email sent successfully' 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
