import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  MapPin,
  Calendar,
  Clock,
  Download,
  Eye,
  MessageCircle,
  Info,
  BadgeCheck,
  Timer,
  CircleDot,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import Button from '../../components/ui/Button';
import type { Car } from '../../types';

interface LocationState {
  vehicle: Car;
  searchCriteria: {
    pickupLocation: string;
    dropoffLocation?: string;
    pickupDate: string;
    returnDate: string;
    startTime: string;
  };
  renterInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    driversLicense: string;
  };
  driveOption: 'self-drive' | 'with-driver';
  pricing: {
    carBasePrice: number;
    driverCost: number;
    pickupLocationCost?: number;
    dropoffLocationCost?: number;
    totalPrice: number;
    rentalDays: number;
  };
  bookingId: string;
  paymentMethod: 'gcash' | 'cash';
  paymentType: 'pay-now' | 'pay-later';
  amountPaid: number;
  remainingBalance: number;
  receiptFileName?: string;
  receiptFileSize?: number;
}

export const ReceiptSubmittedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const state = location.state as LocationState;

  // Redirect if no state
  if (!state) {
    navigate('/browsevehicles');
    return null;
  }

  const {
    vehicle,
    searchCriteria,
    pricing,
    bookingId,
    paymentType,
    amountPaid,
    remainingBalance,
    receiptFileName,
    receiptFileSize
  } = state;

  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, time: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${dateFormatted} at ${time}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const fullTotalAmount = pricing.totalPrice;

  // Generate and download PDF receipt
  const downloadReceipt = async () => {
    // Long bond paper: 8.5 x 13 inches
    // 1 inch = 25.4mm, so margins = 25.4mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215.9, 330.2] // 8.5 x 13 inches in mm (long bond)
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // ~215.9mm
    const pageHeight = doc.internal.pageSize.getHeight(); // ~279.4mm
    const margin = 25.4; // 1 inch in mm
    const contentWidth = pageWidth - 2 * margin;
    const colWidth = (contentWidth - 10) / 2; // Two columns with 10mm gap
    let y = margin;

    // Helper to check page break
    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > pageHeight - margin - 20) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Helper for text with reset
    const addText = (text: string | undefined | null, x: number, yPos: number, options?: {
      fontSize?: number;
      fontStyle?: 'normal' | 'bold' | 'italic';
      color?: number[];
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    }) => {
      // Ensure text is always a valid string
      const safeText = String(text ?? '');
      if (!safeText) return;

      doc.setFontSize(options?.fontSize || 10);
      doc.setFont('helvetica', options?.fontStyle || 'normal');
      if (options?.color) {
        doc.setTextColor(options.color[0], options.color[1], options.color[2]);
      } else {
        doc.setTextColor(0, 0, 0);
      }

      const textOptions: { align: 'left' | 'center' | 'right'; maxWidth?: number } = {
        align: options?.align || 'left'
      };
      if (options?.maxWidth) {
        textOptions.maxWidth = options.maxWidth;
      }
      doc.text(safeText, x, yPos, textOptions);
    };

    // Draw rounded rectangle helper
    const drawCard = (x: number, yPos: number, w: number, h: number, fillColor?: number[]) => {
      if (fillColor) {
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        doc.roundedRect(x, yPos, w, h, 3, 3, 'F');
      } else {
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(x, yPos, w, h, 3, 3, 'S');
      }
    };

    // ============ HEADER SECTION ============
    // Red header bar
    doc.setFillColor(226, 43, 43);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Load and add logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject();
        logoImg.src = '/ARCarRentals.png';
      });
      doc.addImage(logoImg, 'PNG', margin, 4, 20, 20);
    } catch {
      // If logo fails to load, just show text
    }

    // Company name and tagline
    addText('AR CAR RENTALS', margin + 24, 12, { fontSize: 14, fontStyle: 'bold', color: [255, 255, 255] });
    addText('& Tour Services', margin + 24, 18, { fontSize: 9, fontStyle: 'normal', color: [255, 255, 255] });

    // Contact info on right
    addText('+63 956 662 5224', pageWidth - margin, 12, { fontSize: 8, color: [255, 255, 255], align: 'right' });
    addText('info@arcarrentalscebu.com', pageWidth - margin, 17, { fontSize: 8, color: [255, 255, 255], align: 'right' });
    addText('Cebu City, Philippines', pageWidth - margin, 22, { fontSize: 8, color: [255, 255, 255], align: 'right' });

    y = 38;

    // ============ RECEIPT TITLE ============
    addText('OFFICIAL BOOKING RECEIPT', pageWidth / 2, y, { fontSize: 14, fontStyle: 'bold', align: 'center' });
    y += 3;
    doc.setDrawColor(226, 43, 43);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 35, y, pageWidth / 2 + 35, y);
    y += 10;

    // ============ BOOKING REFERENCE BOX ============
    drawCard(margin, y, contentWidth, 18, [250, 250, 250]);
    addText('Booking Reference:', margin + 5, y + 7, { fontSize: 9, color: [100, 100, 100] });
    addText(bookingId, margin + 5, y + 13, { fontSize: 12, fontStyle: 'bold', color: [226, 43, 43] });

    const now = new Date();
    addText('Date Issued:', pageWidth - margin - 45, y + 7, { fontSize: 9, color: [100, 100, 100] });
    addText(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), pageWidth - margin - 45, y + 13, { fontSize: 10, fontStyle: 'bold' });
    y += 25;

    // ============ TWO COLUMN LAYOUT: CUSTOMER & VEHICLE ============
    checkPageBreak(50);
    const col1X = margin;
    const col2X = margin + colWidth + 10;

    // Customer Information Card (Left Column)
    drawCard(col1X, y, colWidth, 40);
    addText('CUSTOMER INFORMATION', col1X + 5, y + 7, { fontSize: 9, fontStyle: 'bold', color: [226, 43, 43] });
    doc.setDrawColor(226, 43, 43);
    doc.setLineWidth(0.3);
    doc.line(col1X + 5, y + 9, col1X + 45, y + 9);

    const { renterInfo } = state;
    addText(renterInfo.fullName, col1X + 5, y + 17, { fontSize: 10, fontStyle: 'bold' });
    addText(renterInfo.email, col1X + 5, y + 24, { fontSize: 9, color: [80, 80, 80] });
    addText(renterInfo.phoneNumber, col1X + 5, y + 31, { fontSize: 9, color: [80, 80, 80] });

    // Vehicle Details Card (Right Column)
    drawCard(col2X, y, colWidth, 40);
    addText('VEHICLE DETAILS', col2X + 5, y + 7, { fontSize: 9, fontStyle: 'bold', color: [226, 43, 43] });
    doc.setDrawColor(226, 43, 43);
    doc.line(col2X + 5, y + 9, col2X + 38, y + 9);

    addText(vehicle.name, col2X + 5, y + 17, { fontSize: 10, fontStyle: 'bold' });
    addText(`${vehicle.transmission} Transmission`, col2X + 5, y + 24, { fontSize: 9, color: [80, 80, 80] });
    addText(`${vehicle.seats} Passengers`, col2X + 5, y + 31, { fontSize: 9, color: [80, 80, 80] });

    y += 47;

    // ============ RENTAL PERIOD CARD ============
    checkPageBreak(35);
    drawCard(margin, y, contentWidth, 35);
    addText('RENTAL PERIOD', margin + 5, y + 7, { fontSize: 9, fontStyle: 'bold', color: [226, 43, 43] });
    doc.setDrawColor(226, 43, 43);
    doc.line(margin + 5, y + 9, margin + 35, y + 9);

    // Four columns for dates and locations
    const quarterWidth = contentWidth / 4;

    addText('Pick-up Date', margin + 5, y + 16, { fontSize: 8, color: [100, 100, 100] });
    addText(formatDateTime(searchCriteria.pickupDate, searchCriteria.startTime), margin + 5, y + 22, { fontSize: 9, fontStyle: 'bold' });

    addText('Return Date', margin + quarterWidth + 5, y + 16, { fontSize: 8, color: [100, 100, 100] });
    addText(formatDateTime(searchCriteria.returnDate, searchCriteria.startTime), margin + quarterWidth + 5, y + 22, { fontSize: 9, fontStyle: 'bold' });

    addText('Pick-up Location', margin + 5, y + 28, { fontSize: 8, color: [100, 100, 100] });
    addText(searchCriteria.pickupLocation || 'N/A', margin + 5, y + 33, { fontSize: 8, fontStyle: 'bold', maxWidth: quarterWidth * 2 - 10 });

    addText('Drop-off Location', col2X + 5, y + 28, { fontSize: 8, color: [100, 100, 100] });
    addText(searchCriteria.dropoffLocation || searchCriteria.pickupLocation || 'N/A', col2X + 5, y + 33, { fontSize: 8, fontStyle: 'bold', maxWidth: colWidth - 10 });

    y += 42;

    // ============ PAYMENT BREAKDOWN SECTION ============
    checkPageBreak(60);
    addText('PAYMENT BREAKDOWN', margin, y, { fontSize: 10, fontStyle: 'bold' });
    doc.setDrawColor(226, 43, 43);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, margin + 42, y + 2);
    y += 10;

    // Table header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 8, 'F');
    addText('Description', margin + 3, y + 5.5, { fontSize: 8, fontStyle: 'bold', color: [80, 80, 80] });
    addText('Amount', pageWidth - margin - 3, y + 5.5, { fontSize: 8, fontStyle: 'bold', color: [80, 80, 80], align: 'right' });
    y += 10;

    // Line items
    const addLineItem = (desc: string, amount: number) => {
      addText(desc, margin + 3, y + 4, { fontSize: 9 });
      addText(`PHP ${amount.toLocaleString()}.00`, pageWidth - margin - 3, y + 4, { fontSize: 9, align: 'right' });
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);
      y += 9;
    };

    addLineItem(`Car Rental (${pricing.rentalDays} days x PHP ${vehicle.pricePerDay.toLocaleString()}/day)`, pricing.carBasePrice);

    if (state.driveOption === 'self-drive' && vehicle.carWashFee && vehicle.carWashFee > 0) {
      addLineItem('Car Wash Fee', vehicle.carWashFee);
    }
    if (pricing.pickupLocationCost && pricing.pickupLocationCost > 0) {
      addLineItem('Pick-up Delivery Fee', pricing.pickupLocationCost);
    }
    if (pricing.dropoffLocationCost && pricing.dropoffLocationCost > 0) {
      addLineItem('Drop-off Delivery Fee', pricing.dropoffLocationCost);
    }

    // Total row
    y += 2;
    doc.setFillColor(226, 43, 43);
    doc.rect(margin, y, contentWidth, 10, 'F');
    addText('TOTAL AMOUNT', margin + 3, y + 7, { fontSize: 10, fontStyle: 'bold', color: [255, 255, 255] });
    addText(`PHP ${fullTotalAmount.toLocaleString()}.00`, pageWidth - margin - 3, y + 7, { fontSize: 11, fontStyle: 'bold', color: [255, 255, 255], align: 'right' });
    y += 15;

    // Driver fee note for with-driver bookings (not included in total)
    if (state.driveOption === 'with-driver') {
      drawCard(margin, y, contentWidth, 16, [255, 249, 235]);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin, y + 16);
      addText('DRIVER FEE', margin + 5, y + 6, { fontSize: 8, fontStyle: 'bold', color: [180, 83, 9] });
      addText('PHP 1,000.00 per 12 hours  --  Payable directly to the driver upon pickup. Not included in the total above.', margin + 5, y + 12, { fontSize: 7, color: [120, 80, 20] });
      y += 22;
    } else {
      y += 5;
    }

    // ============ PAYMENT STATUS BOX ============
    checkPageBreak(30);
    const statusColor = remainingBalance > 0 ? [255, 243, 224] : [232, 245, 233];
    drawCard(margin, y, contentWidth, 22, statusColor);

    addText('PAYMENT STATUS', margin + 5, y + 7, { fontSize: 8, fontStyle: 'bold', color: [80, 80, 80] });

    // Two columns for payment info
    addText('Amount Paid', margin + 5, y + 14, { fontSize: 8, color: [100, 100, 100] });
    addText(`PHP ${amountPaid.toLocaleString()}.00`, margin + 5, y + 19, { fontSize: 10, fontStyle: 'bold', color: [34, 139, 34] });

    if (remainingBalance > 0) {
      addText('Remaining Balance (Due upon pickup)', col2X, y + 14, { fontSize: 8, color: [100, 100, 100] });
      addText(`PHP ${remainingBalance.toLocaleString()}.00`, col2X, y + 19, { fontSize: 10, fontStyle: 'bold', color: [226, 43, 43] });
    } else {
      addText('Status', col2X, y + 14, { fontSize: 8, color: [100, 100, 100] });
      addText('FULLY PAID', col2X, y + 19, { fontSize: 10, fontStyle: 'bold', color: [34, 139, 34] });
    }

    y += 30;

    // ============ FOOTER NOTES ============
    checkPageBreak(25);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    addText('Important Notes:', margin, y, { fontSize: 8, fontStyle: 'bold', color: [80, 80, 80] });
    y += 5;
    addText('• This is a computer-generated receipt and serves as your official booking confirmation.', margin, y, { fontSize: 7, color: [100, 100, 100] });
    y += 4;
    addText('• Please present this receipt along with a valid ID upon vehicle pickup.', margin, y, { fontSize: 7, color: [100, 100, 100] });
    y += 4;
    addText('• For inquiries, contact us at +63 956 662 5224 or info@arcarrentalscebu.com', margin, y, { fontSize: 7, color: [100, 100, 100] });

    // ============ FOOTER BAR ============
    doc.setFillColor(40, 40, 40);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    addText('© 2024 AR Car Rentals & Tour Services | www.arcarrentals.com', pageWidth / 2, pageHeight - 5, {
      fontSize: 7,
      color: [200, 200, 200],
      align: 'center'
    });

    // Save the PDF
    doc.save(`AR-CarRentals-Receipt-${bookingId}.pdf`);

    // Show toast notification
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-50 flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Page Heading Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-2">
                {paymentType === 'pay-later' ? 'Booking Submitted!' : 'Receipt Submitted!'}
              </h1>
              <p className="text-neutral-500 text-base md:text-lg">
                {paymentType === 'pay-later'
                  ? 'Your booking has been submitted and is awaiting confirmation from our team.'
                  : 'We have received your receipt. Payment verification is currently in progress.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Booking ID Panel */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1">
              <p className="text-neutral-900 text-lg font-bold">
                Booking ID: <span className="text-[#E22B2B] font-mono">{bookingId}</span>
              </p>
              <p className="text-neutral-500 text-sm">
                Please save this reference ID for your records.
              </p>
            </div>
            <button
              onClick={copyBookingId}
              className="group flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-bold transition-all"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Email Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1.5">
              You can safely close this page
            </p>
            <p className="text-sm text-blue-800">
              We've sent a confirmation email with a magic link to track your booking status.
              You can access this page anytime by clicking the link in your email.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column: Timeline & Actions */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Timeline Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm flex-1">
              <h3 className="text-base font-bold text-neutral-900 mb-4">Status Timeline</h3>

              <div className="grid grid-cols-[24px_1fr] gap-x-3">
                {/* Step 1: Done - Booking Created */}
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div className="w-0.5 bg-green-600/30 flex-1 min-h-[32px] mt-1"></div>
                </div>
                <div className="pb-4">
                  <p className="text-neutral-900 text-sm font-bold">Booking Created</p>
                  <p className="text-neutral-500 text-xs">{formatDate(new Date().toISOString())}, {getCurrentTime()}</p>
                </div>

                {paymentType === 'pay-now' ? (
                  <>
                    {/* Pay Now Flow: Step 2 - Receipt Submitted */}
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div className="w-0.5 bg-green-600/30 flex-1 min-h-[32px] mt-1"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-neutral-900 text-sm font-bold">Receipt Submitted</p>
                      <p className="text-neutral-500 text-xs">{formatDate(new Date().toISOString())} • Manual Upload</p>
                    </div>

                    {/* Pay Now Flow: Step 3 - Payment Verification (Active) */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full animate-pulse">
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                      </div>
                      <div className="w-0.5 bg-neutral-200 flex-1 min-h-[32px] mt-1"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-orange-600 text-sm font-bold">Payment Verification</p>
                      <p className="text-neutral-500 text-xs">In Progress • Est. 15-30 mins</p>
                    </div>

                    {/* Pay Now Flow: Step 4 - Booking Confirmed (Future) */}
                    <div className="flex flex-col items-center">
                      <CircleDot className="w-6 h-6 text-neutral-300" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm font-medium">Booking Confirmed</p>
                      <p className="text-neutral-400 text-xs">Pending Verification</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Pay Later Flow: Step 2 - Awaiting Confirmation (Active) */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full animate-pulse">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="w-0.5 bg-neutral-200 flex-1 min-h-[32px] mt-1"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-blue-600 text-sm font-bold">Awaiting Confirmation</p>
                      <p className="text-neutral-500 text-xs">In Progress • Est. 1-2 hours</p>
                    </div>

                    {/* Pay Later Flow: Step 3 - Booking Confirmed (Future) */}
                    <div className="flex flex-col items-center">
                      <CircleDot className="w-6 h-6 text-neutral-300" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm font-medium">Booking Confirmed</p>
                      <p className="text-neutral-400 text-xs">Pay upon pickup</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* What's Next Instructions */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                What's Next?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <BadgeCheck className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-neutral-800">Prepare Documents</p>
                    <p className="text-xs text-neutral-500">Please bring your Driver's License and ID upon vehicle pickup.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Timer className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-neutral-800">Wait for Confirmation</p>
                    <p className="text-xs text-neutral-500">
                      {paymentType === 'pay-later'
                        ? 'Our team will review and confirm your booking within 1-2 hours.'
                        : 'Verification usually takes 15-30 minutes during business hours.'
                      }
                    </p>
                  </div>
                </div>
              </div>
              {paymentType === 'pay-later' && (
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">Payment Reminder</p>
                      <p className="text-xs text-amber-700">
                        Full payment of ₱{fullTotalAmount.toLocaleString()}.00 is due upon vehicle pickup.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                fullWidth
                className="h-11 flex items-center justify-center gap-2 bg-transparent border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg font-bold transition-colors"
                onClick={downloadReceipt}
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
            </div>
          </div>

          {/* Right Column: Summary Cards */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Trip Details Card */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="relative h-36 w-full bg-neutral-100">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white font-bold text-base">{vehicle.name}</p>
                  <p className="text-neutral-300 text-xs capitalize">
                    {vehicle.transmission} • {vehicle.seats} Seats
                  </p>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <Calendar className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">PICK-UP DATE</p>
                    <p className="text-sm font-bold text-neutral-900">
                      {formatDateTime(searchCriteria.pickupDate, searchCriteria.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">RETURN DATE</p>
                    <p className="text-sm font-bold text-neutral-900">
                      {formatDateTime(searchCriteria.returnDate, searchCriteria.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">PICK-UP LOCATION</p>
                    <p className="text-sm font-bold text-neutral-900">{searchCriteria.pickupLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm flex flex-col gap-3 flex-1">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                <h3 className="font-bold text-neutral-900 text-sm">Payment Summary</h3>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">
                  Verification Pending
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Booking Cost</span>
                  <span className="font-medium text-neutral-900">₱{fullTotalAmount.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Type</span>
                  <span className="font-medium text-neutral-900 capitalize">{paymentType}</span>
                </div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-neutral-600 font-bold">Amount Paid</span>
                  <span className="font-bold text-green-600">₱{amountPaid.toLocaleString()}.00</span>
                </div>
                {paymentType === 'pay-later' && remainingBalance > 0 && (
                  <>
                    <div className="flex justify-between text-sm items-center border-t border-neutral-200 pt-2">
                      <span className="text-neutral-600 font-bold">Remaining Balance</span>
                      <span className="font-bold text-[#E22B2B]">₱{remainingBalance.toLocaleString()}.00</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 italic text-right">To be paid upon pickup</p>
                  </>
                )}
              </div>

              {/* Receipt Mini Preview */}
              <div>
                <p className="text-xs text-neutral-500 mb-1.5">Uploaded Receipt:</p>
                <div className="flex items-center gap-3 p-2 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                  <div className="w-9 h-9 bg-neutral-200 rounded flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-neutral-900 truncate">{receiptFileName}</p>
                    <p className="text-[10px] text-neutral-400">{receiptFileSize} KB</p>
                  </div>
                  <Eye className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Bubble */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-neutral-900 hover:scale-105 active:scale-95 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50">
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Receipt Downloaded!</p>
              <p className="text-neutral-400 text-xs">Your official booking receipt has been saved.</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 p-1 hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptSubmittedPage;
