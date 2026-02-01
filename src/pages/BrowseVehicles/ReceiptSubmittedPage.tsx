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
  CircleDot
} from 'lucide-react';
import Button from '../../components/ui/Button';
import type { Car } from '../../types';

interface LocationState {
  vehicle: Car;
  searchCriteria: {
    pickupLocation: string;
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
    taxesAndFees: number;
    totalPrice: number;
    rentalDays: number;
  };
  bookingId: string;
  paymentMethod: 'gcash' | 'maya' | 'bank';
  paymentType: 'full' | 'downpayment';
  amountPaid: number;
  remainingBalance: number;
  receiptFileName: string;
  receiptFileSize: number;
}

export const ReceiptSubmittedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

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
                Receipt Submitted!
              </h1>
              <p className="text-neutral-500 text-base md:text-lg">
                We have received your receipt. Payment verification is currently in progress.
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
                {/* Step 1: Done */}
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div className="w-0.5 bg-green-600/30 flex-1 min-h-[32px] mt-1"></div>
                </div>
                <div className="pb-4">
                  <p className="text-neutral-900 text-sm font-bold">Booking Created</p>
                  <p className="text-neutral-500 text-xs">{formatDate(new Date().toISOString())}, {getCurrentTime()}</p>
                </div>

                {/* Step 2: Done */}
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div className="w-0.5 bg-green-600/30 flex-1 min-h-[32px] mt-1"></div>
                </div>
                <div className="pb-4">
                  <p className="text-neutral-900 text-sm font-bold">Receipt Submitted</p>
                  <p className="text-neutral-500 text-xs">{formatDate(new Date().toISOString())} • Manual Upload</p>
                </div>

                {/* Step 3: Active/Pending */}
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

                {/* Step 4: Future */}
                <div className="flex flex-col items-center">
                  <CircleDot className="w-6 h-6 text-neutral-300" />
                </div>
                <div>
                  <p className="text-neutral-400 text-sm font-medium">Booking Confirmed</p>
                  <p className="text-neutral-400 text-xs">Pending Verification</p>
                </div>
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
                    <p className="text-xs text-neutral-500">Verification usually takes 15-30 minutes during business hours.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                fullWidth
                className="h-11 flex items-center justify-center gap-2 bg-[#E22B2B] hover:bg-[#c92525] text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-600/20 border-none"
                onClick={() => navigate('/customer/bookings')}
              >
                <MapPin className="w-4 h-4" />
                Track Booking
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="h-11 flex items-center justify-center gap-2 bg-transparent border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg font-bold transition-colors"
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
                {paymentType === 'downpayment' && (
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
    </div>
  );
};

export default ReceiptSubmittedPage;
