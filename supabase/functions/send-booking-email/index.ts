// Supabase Edge Function for sending booking confirmation emails via Resend
// Deploy with: supabase functions deploy send-booking-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  email: string
  bookingReference: string
  magicLink: string
  bookingDetails?: {
    vehicleName?: string
    pickupDate?: string
    returnDate?: string
  }
}

// Email HTML template
const getEmailHTML = (
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
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #E22B2B; padding: 40px; text-align: center;">
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
              
              <p style="margin: 0 0 20px; color: #262626; font-size: 16px; line-height: 1.5;">
                Thank you for choosing AR Car Rentals! Your booking has been successfully confirmed.
              </p>

              <!-- Booking Reference -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF2F2; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #7f1d1d; font-size: 12px; font-weight: 600; text-transform: uppercase;">
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

              <!-- Magic Link -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #262626; font-size: 16px; font-weight: 600;">
                  Track Your Booking
                </h3>
                <p style="margin: 0 0 20px; color: #525252; font-size: 14px; line-height: 1.5;">
                  Click the button below to view your booking details and track your reservation:
                </p>
                
                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: #E22B2B;">
                      <a href="${magicLink}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                        View Booking Details
                      </a>
                    </td>
                  </tr>
                </table>

                <div style="margin-top: 20px; padding: 15px; background-color: #fafafa; border-radius: 6px; border-left: 3px solid #E22B2B;">
                  <p style="margin: 0 0 8px; color: #525252; font-size: 12px; font-weight: 600;">
                    Or copy this link:
                  </p>
                  <p style="margin: 0; color: #737373; font-size: 12px; word-break: break-all;">
                    ${magicLink}
                  </p>
                </div>
              </div>

              <!-- Security Notice -->
              <div style="margin: 30px 0 0; padding: 15px; background-color: #FEF3C7; border-radius: 8px; border-left: 3px solid #F59E0B;">
                <p style="margin: 0; color: #92400E; font-size: 13px; line-height: 1.5;">
                  <strong>🔒 Security Notice:</strong> This link is unique to your booking and will expire 24 hours after your return date.
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
    const { email, bookingReference, magicLink, bookingDetails }: EmailRequest = await req.json()

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

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AR Car Rentals <onboarding@resend.dev>',
        to: [email],
        subject: `Booking Confirmed - ${bookingReference} | AR Car Rentals`,
        html: getEmailHTML(
          bookingReference,
          magicLink,
          bookingDetails?.vehicleName,
          bookingDetails?.pickupDate,
          bookingDetails?.returnDate
        ),
      }),
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
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
