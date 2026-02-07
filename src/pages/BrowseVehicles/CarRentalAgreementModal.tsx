import { type FC, useState } from 'react';
import { X, FileText, AlertTriangle, Shield, Car } from 'lucide-react';
import { Button } from '@/components/ui';

interface CarRentalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  isSelfDrive: boolean;
}

/**
 * Car Rental Agreement Modal - Contract-style document
 * Designed for easy reading with minimal scrolling (approx. 2 scroll actions)
 */
export const CarRentalAgreementModal: FC<CarRentalAgreementModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  isSelfDrive,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAgreeAndContinue = () => {
    if (isAgreed) {
      onAgree();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal - Wide contract style */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header - Contract title bar */}
        <div className="bg-[#121212] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">CAR RENTAL AGREEMENT</h2>
              <p className="text-xs text-white/60">AR Car Rentals Inc. • Please read carefully before proceeding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content - Contract body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FAFAFA]" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Contract Paper */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            
            {/* Two Column Layout for Terms & Penalties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Left Column - Terms & Conditions */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
                  <Shield className="w-4 h-4 text-[#E22B2B]" />
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Terms & Conditions</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-700 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E22B2B] font-bold">•</span>
                    <span>Renter must be at least <strong>21 years old</strong> with a valid driver's license.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E22B2B] font-bold">•</span>
                    <span>Security deposit of <strong>₱5,000</strong> required upon turnover (refundable).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E22B2B] font-bold">•</span>
                    <span>Rental period calculated in <strong>24-hour increments</strong>. Late returns incur charges.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E22B2B] font-bold">•</span>
                    <span>Vehicle must be returned in the <strong>same condition</strong> as when rented.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E22B2B] font-bold">•</span>
                    <span>Renter is responsible for all <strong>traffic violations</strong> during rental period.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E22B2B] font-bold">•</span>
                    <span>Insurance included but <strong>excludes negligence</strong>, drunk driving, unauthorized use.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E22B2B] font-bold">•</span>
                    <span>Fuel policy: Return with <strong>same fuel level</strong> as pickup (Full-to-Full).</span>
                  </li>
                </ul>
              </div>

              {/* Right Column - Penalties & Fines */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Penalties & Fines</h3>
                </div>
                <div className="overflow-hidden rounded border border-neutral-200 text-xs">
                  <table className="w-full">
                    <tbody className="divide-y divide-neutral-100">
                      <tr className="bg-neutral-50">
                        <td className="px-2 py-1.5 text-neutral-700">Late return</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-[#E22B2B]">₱500/hr</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1.5 text-neutral-700">Lost key replacement</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-[#E22B2B]">₱15,000</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="px-2 py-1.5 text-neutral-700">Smoking inside vehicle</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-[#E22B2B]">₱5,000</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1.5 text-neutral-700">Unauthorized pet</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-[#E22B2B]">₱3,000</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="px-2 py-1.5 text-neutral-700">Interior damage/stains</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-[#E22B2B]">₱2,000+</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1.5 text-neutral-700">Traffic violation</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-[#E22B2B]">Actual + ₱500</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="px-2 py-1.5 text-neutral-700">Towing fee</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-[#E22B2B]">₱5,000+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Prohibited Use & Reminders - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Prohibited Use */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <h4 className="text-xs font-bold text-[#E22B2B] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E22B2B] text-white flex items-center justify-center text-[10px]">✕</span>
                  Strictly Prohibited
                </h4>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-700">
                  <span>• Illegal activities</span>
                  <span>• Racing/reckless driving</span>
                  <span>• Driving under influence</span>
                  <span>• Overloading vehicle</span>
                  <span>• Sub-leasing vehicle</span>
                  <span>• Hazardous materials</span>
                  <span>• Unauthorized areas</span>
                </div>
              </div>

              {/* Important Reminders */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">!</span>
                  Important Reminders
                </h4>
                <div className="grid grid-cols-1 gap-1 text-xs text-neutral-700">
                  <span>• Take photos/videos of vehicle before and after use</span>
                  <span>• Report accidents immediately to our 24/7 hotline: <strong>0956-662-5224</strong></span>
                  <span>• Keep all documents (OR/CR) inside the vehicle at all times</span>
                  <span>• Extension requests must be made 6 hours before scheduled return</span>
                </div>
              </div>
            </div>

            {/* Self-Drive Section - Only if applicable */}
            {isSelfDrive && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Self-Drive Requirements</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded p-2 text-center border border-amber-200">
                    <p className="text-[10px] text-amber-600 uppercase font-medium">Car Wash</p>
                    <p className="text-xs text-neutral-800 font-semibold">Wash before return</p>
                    <p className="text-[10px] text-neutral-500">or pay ₱450</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center border border-amber-200">
                    <p className="text-[10px] text-amber-600 uppercase font-medium">Payment</p>
                    <p className="text-xs text-neutral-800 font-semibold">Full upon turnover</p>
                    <p className="text-[10px] text-neutral-500">before delivery</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center border border-amber-200">
                    <p className="text-[10px] text-amber-600 uppercase font-medium">Delivery</p>
                    <p className="text-xs text-neutral-800 font-semibold">Additional charges</p>
                    <p className="text-[10px] text-neutral-500">based on location</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center border border-amber-200">
                    <p className="text-[10px] text-amber-600 uppercase font-medium">Gas Level</p>
                    <p className="text-xs text-neutral-800 font-semibold">Same upon return</p>
                    <p className="text-[10px] text-neutral-500">₱300/bar if not</p>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Line */}
            <div className="border-t border-dashed border-neutral-300 pt-4 mt-2">
              <p className="text-[10px] text-neutral-500 text-center italic">
                By checking the box below, you acknowledge that you have read, understood, and agree to all terms, conditions, penalties, and policies stated in this agreement.
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Agreement & Actions */}
        <div className="border-t border-neutral-200 bg-white px-6 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-5 h-5 text-[#E22B2B] border-neutral-300 rounded focus:ring-[#E22B2B] cursor-pointer"
              />
              <span className="text-sm text-neutral-700">
                I have read and agree to the <span className="font-semibold text-neutral-900">Car Rental Agreement</span>
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAgreeAndContinue}
                disabled={!isAgreed}
                className={`px-5 py-2.5 text-sm font-medium ${
                  isAgreed
                    ? 'bg-[#E22B2B] hover:bg-[#c92525] border-none'
                    : 'bg-neutral-300 cursor-not-allowed border-none'
                }`}
              >
                Agree & Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRentalAgreementModal;
