import { type FC, useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, 
  Lock, 
  HelpCircle, 
  Calendar,
  X,
  AlertCircle,
  Wallet,
  Copy,
  CloudUpload,
  QrCode,
  Building2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { Car } from '@/types';
import { updateStep } from '@/utils/sessionManager';
import { createSecureBooking } from '@/services/bookingSecurityService';

type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer';
type PaymentType = 'full' | 'downpayment';

interface CheckoutState {
  vehicle: Car;
  searchCriteria: {
    location: string;
    pickupDate: string;
    returnDate: string;
    startTime: string;
    deliveryMethod: string;
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
}

// Insurance and service fee constants
const INSURANCE_FEE = 300;
const SERVICE_FEE = 200;
const DOWNPAYMENT_AMOUNT = 500;

// Payment method configurations
const PAYMENT_METHODS = {
  gcash: {
    name: 'GCash',
    accountName: 'Rolando Torred Jr',
    accountNumber: '0956 662 5224',
    qrImage: '/gcash-qr.png',
    icon: QrCode,
    scanText: 'Scan QR with GCash App',
  },
  maya: {
    name: 'Maya',
    accountName: 'Rolando Torred Jr',
    accountNumber: '0956 662 5224',
    qrImage: '/maya-qr.png',
    icon: Wallet,
    scanText: 'Scan QR with Maya App',
  },
  bank: {
    name: 'Bank Transfer',
    bankName: 'BDO Unibank',
    accountName: 'AR Car Rentals Inc.',
    accountNumber: '0012-3456-7890',
    icon: Building2,
  },
};

/**
 * Checkout Page - Step 3: GCash Payment
 */
export const CheckoutPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Payment selection state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [paymentType, setPaymentType] = useState<PaymentType>('full');

  // Redirect if no checkout data
  useEffect(() => {
    if (!state?.vehicle) {
      navigate('/browsevehicles');
    }
  }, [state, navigate]);

  if (!state?.vehicle) {
    return null;
  }

  const { vehicle, searchCriteria, pricing, bookingId } = state;

  // Calculate breakdown
  const rentalCost = pricing.carBasePrice;
  const insuranceCost = INSURANCE_FEE;
  const serviceFee = SERVICE_FEE;
  const fullTotalAmount = rentalCost + insuranceCost + serviceFee + pricing.driverCost;
  const amountToPay = paymentType === 'downpayment' ? DOWNPAYMENT_AMOUNT : fullTotalAmount;
  const remainingBalance = fullTotalAmount - DOWNPAYMENT_AMOUNT;

  // Format date for display (Oct 24, 2023)
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not selected';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return '10:00 AM';
    if (time.includes('AM') || time.includes('PM')) return time;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);

    // Use security validation
    const { validateFileType } = await import('../../utils/security');
    const validation = validateFileType(file);
    
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setReceiptFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!receiptFile) return;

    setIsSubmitting(true);

    try {
      // Create secure booking with Supabase
      const result = await createSecureBooking({
        searchCriteria: {
          pickupLocation: searchCriteria.location,
          pickupDate: searchCriteria.pickupDate,
          returnDate: searchCriteria.returnDate,
          startTime: searchCriteria.startTime,
          deliveryMethod: 'pickup'
        },
        vehicle,
        renterInfo: state.renterInfo,
        driveOption: state.driveOption,
        paymentType,
        paymentMethod,
        receiptImage: receiptFile
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create booking');
      }

      console.log('✅ Booking created successfully:', {
        bookingId: result.bookingId,
        bookingReference: result.bookingReference,
        magicLink: result.magicLink
      });

      // Update session step to 'submitted'
      await updateStep('submitted');

      // Navigate to receipt submitted page
      navigate('/browsevehicles/receipt-submitted', {
        state: {
          vehicle,
          searchCriteria,
          renterInfo: state.renterInfo,
          driveOption: state.driveOption,
          pricing,
          bookingId: result.bookingReference,
          paymentMethod,
          paymentType,
          amountPaid: amountToPay,
          remainingBalance,
          receiptFileName: receiptFile.name,
          receiptFileSize: Math.round(receiptFile.size / 1024),
        }
      });
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Progress Steps */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {/* Step 1 - Complete */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#22C55E]">Select Car</span>
            </div>

            {/* Connector */}
            <div className="w-24 h-0.5 bg-[#22C55E]" />

            {/* Step 2 - Complete */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#22C55E]">Enter Details</span>
            </div>

            {/* Connector */}
            <div className="w-24 h-0.5 bg-[#22C55E]" />

            {/* Step 3 - Active */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E22B2B] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">3</span>
              </div>
              <span className="text-sm font-medium text-[#E22B2B]">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Payment Instructions & Upload */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-neutral-200 p-8">
              
              {/* Payment Type Selection */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-neutral-700">Payment Type:</span>
                <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => setPaymentType('full')}
                    className={`px-5 py-2 text-sm font-medium transition-colors ${
                      paymentType === 'full'
                        ? 'bg-[#E22B2B] text-white'
                        : 'bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Full Payment
                  </button>
                  <button
                    onClick={() => setPaymentType('downpayment')}
                    className={`px-5 py-2 text-sm font-medium transition-colors ${
                      paymentType === 'downpayment'
                        ? 'bg-[#E22B2B] text-white'
                        : 'bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Downpayment
                  </button>
                </div>
              </div>

              {/* Downpayment Notice */}
              {paymentType === 'downpayment' && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    You have selected <span className="font-bold">Downpayment</span>. Each booking requires a minimum <span className="font-bold">₱500.00</span> deposit to confirm. The remaining balance will be paid upon pickup.
                  </p>
                </div>
              )}

              {/* Payment Method Tabs */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center bg-neutral-100 rounded-full p-1">
                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      paymentMethod === 'gcash'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    GCash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('maya')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      paymentMethod === 'maya'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    Maya
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank-transfer')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      paymentMethod === 'bank-transfer'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Bank Transfer
                  </button>
                </div>
              </div>

              {/* Bank Transfer Details */}
              {paymentMethod === 'bank-transfer' && (
                <div className="mb-6">
                  <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-4">Bank Account Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-neutral-500">Account Name:</span>
                        <p className="font-medium text-neutral-900">Rolando Torred Jr</p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Contact Number:</span>
                        <p className="font-medium text-neutral-900">0956 662 5224</p>
                      </div>
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-800">
                          ⚠️ Please transfer to the account name and contact number above, then upload your payment proof.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Section (for GCash and Maya) */}
              {(paymentMethod === 'gcash' || paymentMethod === 'maya') && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 border-2 border-[#E22B2B]/20 rounded-2xl">
                      <img 
                        src={PAYMENT_METHODS[paymentMethod].qrImage} 
                        alt={`${PAYMENT_METHODS[paymentMethod].name} QR Code`} 
                        className="w-44 h-44 object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Scan QR Link */}
                  <div className="flex justify-center mb-8">
                    <a 
                      href="#" 
                      className="text-[#E22B2B] text-sm font-medium hover:underline flex items-center gap-1.5"
                    >
                      <span className="text-base">📱</span> {PAYMENT_METHODS[paymentMethod].scanText}
                    </a>
                  </div>
                </>
              )}

              {/* Bank Transfer Details */}
              {paymentMethod === 'bank-transfer' && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 mb-8">
                  <div className="text-center mb-4">
                    <Building2 className="w-12 h-12 text-[#E22B2B] mx-auto mb-2" />
                    <h3 className="font-bold text-lg text-neutral-900">Bank Transfer Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                      <span className="text-sm text-neutral-500">Bank Name</span>
                      <span className="font-semibold text-neutral-900">{PAYMENT_METHODS.bank.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                      <span className="text-sm text-neutral-500">Account Name</span>
                      <span className="font-semibold text-neutral-900">{PAYMENT_METHODS.bank.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-neutral-500">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">{PAYMENT_METHODS.bank.accountNumber}</span>
                        <button 
                          onClick={() => copyToClipboard(PAYMENT_METHODS.bank.accountNumber.replace(/-/g, ''))}
                          className="text-neutral-400 hover:text-[#E22B2B] transition-colors"
                          title={isCopied ? "Copied!" : "Copy number"}
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E22B2B]/20 text-[#E22B2B] text-sm font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">
                      {paymentMethod === 'bank-transfer' ? 'Transfer to Our Account' : 'Scan the QR Code'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {paymentMethod === 'bank-transfer' 
                        ? 'Use your mobile banking app or visit your bank to transfer the payment.'
                        : `Open your ${PAYMENT_METHODS[paymentMethod].name} app, tap "QR Pay", and scan the code above.`
                      }
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E22B2B]/20 text-[#E22B2B] text-sm font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">Send Exact Amount</p>
                    <p className="text-sm text-neutral-500 mb-4">Please ensure you send the exact total amount.</p>
                    
                    {/* Account Details Box (for GCash and Maya) */}
                    {(paymentMethod === 'gcash' || paymentMethod === 'maya') && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">{PAYMENT_METHODS[paymentMethod].name.toUpperCase()} ACCOUNT</p>
                            <p className="font-semibold text-neutral-900">{PAYMENT_METHODS[paymentMethod].accountName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">NUMBER</p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-neutral-900">{PAYMENT_METHODS[paymentMethod].accountNumber}</p>
                              <button 
                                onClick={() => copyToClipboard(PAYMENT_METHODS[paymentMethod].accountNumber.replace(/-/g, ''))}
                                className="relative text-neutral-400 hover:text-[#E22B2B] transition-colors"
                                title={isCopied ? "Copied!" : "Copy number"}
                              >
                                {isCopied ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                          <p className="text-sm text-neutral-500">Total to send:</p>
                          <p className="text-xl font-bold text-[#E22B2B]">₱{amountToPay.toLocaleString()}.00</p>
                        </div>
                      </div>
                    )}

                    {/* Amount Box (for Bank Transfer) */}
                    {paymentMethod === 'bank-transfer' && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-neutral-500">Total to send:</p>
                          <p className="text-xl font-bold text-[#E22B2B]">₱{amountToPay.toLocaleString()}.00</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E22B2B]/20 text-[#E22B2B] text-sm font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">Upload Receipt</p>
                    <p className="text-sm text-neutral-500 mb-4">Take a screenshot of the confirmation receipt and upload it here.</p>
                    
                    {/* Upload Area */}
                    {!receiptPreview ? (
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                          isDragging
                            ? 'border-[#E22B2B] bg-red-50'
                            : 'border-neutral-300 hover:border-[#E22B2B]/50'
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center">
                          <CloudUpload className="w-8 h-8 text-neutral-400 mb-3" />
                          <p className="text-sm text-neutral-700">
                            <span className="text-[#E22B2B] font-medium hover:underline">Click to upload</span>
                            {' '}or drag and drop
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">PNG, JPG or GIF (MAX. 5MB)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".png,.jpg,.jpeg,.gif"
                          onChange={handleInputChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="border border-neutral-200 rounded-xl p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate text-sm">{receiptFile?.name}</p>
                            <p className="text-xs text-neutral-500">
                              {receiptFile && (receiptFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={removeFile}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-neutral-400" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Error */}
                    {uploadError && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-[#E22B2B]">
                        <AlertCircle className="w-4 h-4" />
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-[340px]">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-32">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Order Summary</h3>
                <span className="text-xs font-medium text-[#E22B2B] bg-red-50 px-2 py-1 rounded">
                  ID: #{bookingId}
                </span>
              </div>

              {/* Vehicle Info */}
              <div className="flex gap-3 mb-5 pb-5 border-b border-neutral-100">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-20 h-14 object-cover rounded-lg bg-neutral-100"
                />
                <div>
                  <h4 className="font-semibold text-neutral-900">{vehicle.name}</h4>
                  <p className="text-sm text-neutral-500 capitalize">
                    {vehicle.fuelType} • {vehicle.transmission}
                  </p>
                </div>
              </div>

              {/* Pickup & Return */}
              <div className="space-y-3 mb-5 pb-5 border-b border-neutral-100">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">PICK-UP</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {formatDate(searchCriteria.pickupDate)} - {formatTime(searchCriteria.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">RETURN</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {formatDate(searchCriteria.returnDate)} - {formatTime(searchCriteria.startTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Car Rental ({pricing.rentalDays} day{pricing.rentalDays > 1 ? 's' : ''})</span>
                  <span className="text-neutral-900">₱{rentalCost.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Insurance</span>
                  <span className="text-neutral-900">₱{insuranceCost.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Service Fee</span>
                  <span className="text-neutral-900">₱{serviceFee.toLocaleString()}.00</span>
                </div>
                {pricing.driverCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Driver Fee</span>
                    <span className="text-neutral-900">₱{pricing.driverCost.toLocaleString()}.00</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-neutral-200 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600">Total Amount</span>
                  <span className="font-semibold text-neutral-900">₱{fullTotalAmount.toLocaleString()}.00</span>
                </div>
                
                {paymentType === 'downpayment' && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-600">Downpayment</span>
                      <span className="font-semibold text-[#E22B2B]">₱{DOWNPAYMENT_AMOUNT.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500">Balance (pay upon pickup)</span>
                      <span className="text-neutral-500">₱{remainingBalance.toLocaleString()}.00</span>
                    </div>
                  </>
                )}
              </div>

              {/* Amount to Pay Now */}
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-700">
                    {paymentType === 'downpayment' ? 'Pay Now (Deposit)' : 'Pay Now'}
                  </span>
                  <span className="text-2xl font-bold text-[#E22B2B]">₱{amountToPay.toLocaleString()}.00</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  via {paymentMethod === 'bank-transfer' ? 'Bank Transfer' : PAYMENT_METHODS[paymentMethod].name}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={!receiptFile || isSubmitting}
                className={`py-3.5 text-base font-medium rounded-lg flex items-center justify-center gap-2 ${
                  receiptFile && !isSubmitting
                    ? 'bg-[#E22B2B] hover:bg-[#c92525] border-none'
                    : 'bg-neutral-300 cursor-not-allowed border-none'
                }`}
              >
                <Lock className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Payment Receipt'}
              </Button>

              {/* Terms */}
              <p className="text-xs text-center text-neutral-500 mt-3">
                By proceeding, you agree to our <a href="#" className="text-[#E22B2B] hover:underline">Terms of Service</a>.
              </p>

              {/* Help Link */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-neutral-100">
                <HelpCircle className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-600">
                  Need help? <a href="#" className="text-[#E22B2B] hover:underline">Chat with support</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
