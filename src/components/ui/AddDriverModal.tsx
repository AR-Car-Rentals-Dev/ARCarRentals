import { type FC, useState } from 'react';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar,
  Image,
} from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { supabase } from '@services/supabase';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DriverFormData {
  full_name: string;
  phone_number: string;
  email: string;
  date_of_birth: string;
  license_number: string;
  license_expiry: string;
  years_of_experience: string;
  rate_per_day: string;
  status: 'available' | 'on_duty' | 'unavailable';
  languages_spoken: string;
  specializations: string;
  profile_photo: string;
  notes: string;
}

const initialFormData: DriverFormData = {
  full_name: '',
  phone_number: '',
  email: '',
  date_of_birth: '',
  license_number: '',
  license_expiry: '',
  years_of_experience: '0',
  rate_per_day: '',
  status: 'available',
  languages_spoken: 'English, Tagalog',
  specializations: '',
  profile_photo: '',
  notes: '',
};

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'License Details', icon: CreditCard },
  { id: 4, title: 'Rate & Status', icon: DollarSign },
];

export const AddDriverModal: FC<AddDriverModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.full_name;
      case 2:
        return !!formData.phone_number;
      case 3:
        return !!(formData.license_number && formData.license_expiry);
      case 4:
        return !!formData.rate_per_day;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      setError(null);
    } else {
      const messages: Record<number, string> = {
        1: 'Please enter driver full name',
        2: 'Please enter phone number',
        3: 'Please enter license number and expiry date',
        4: 'Please enter rate per day',
      };
      setError(messages[currentStep] || 'Please fill in required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const driverData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email || null,
        date_of_birth: formData.date_of_birth || null,
        license_number: formData.license_number,
        license_expiry: formData.license_expiry,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        rate_per_day: parseFloat(formData.rate_per_day),
        status: formData.status,
        languages_spoken: formData.languages_spoken
          ? formData.languages_spoken.split(',').map(l => l.trim())
          : null,
        specializations: formData.specializations
          ? formData.specializations.split(',').map(s => s.trim())
          : null,
        profile_photo: formData.profile_photo || null,
        notes: formData.notes || null,
      };

      const { error: insertError } = await supabase
        .from('drivers')
        .insert(driverData);

      if (insertError) {
        throw insertError;
      }

      setFormData(initialFormData);
      setCurrentStep(1);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error adding driver:', err);
      setError(err.message || 'Failed to add driver. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setError(null);
    onClose();
  };

  const progress = (currentStep / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Enter the driver's personal information.
            </p>
            <Input
              label="Full Name *"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Juan Dela Cruz"
              leftIcon={<User className="h-4 w-4" />}
            />
            <Input
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
            <Input
              label="Profile Photo URL"
              name="profile_photo"
              value={formData.profile_photo}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              leftIcon={<Image className="h-4 w-4" />}
              helperText="Optional: URL to driver's photo"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Enter contact information.
            </p>
            <Input
              label="Phone Number *"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+63 956 662 5224"
              leftIcon={<Phone className="h-4 w-4" />}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="driver@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Languages Spoken"
              name="languages_spoken"
              value={formData.languages_spoken}
              onChange={handleChange}
              placeholder="English, Tagalog, Cebuano"
              helperText="Separate multiple languages with commas"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Driver's license information.
            </p>
            <Input
              label="License Number *"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              placeholder="N01-12-345678"
              leftIcon={<CreditCard className="h-4 w-4" />}
            />
            <Input
              label="License Expiry Date *"
              name="license_expiry"
              type="date"
              value={formData.license_expiry}
              onChange={handleChange}
              leftIcon={<Calendar className="h-4 w-4" />}
            />
            <Input
              label="Years of Experience"
              name="years_of_experience"
              type="number"
              value={formData.years_of_experience}
              onChange={handleChange}
              placeholder="0"
            />
            <Input
              label="Specializations"
              name="specializations"
              value={formData.specializations}
              onChange={handleChange}
              placeholder="Long Distance, Luxury Cars, SUV/Trucks"
              helperText="Separate multiple specializations with commas"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Set the driver's rate and availability status.
            </p>
            <Input
              label="Rate Per Day (₱) *"
              name="rate_per_day"
              type="number"
              value={formData.rate_per_day}
              onChange={handleChange}
              placeholder="1500"
              leftIcon={<DollarSign className="h-4 w-4" />}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="available">Available</option>
                <option value="on_duty">On Duty</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                placeholder="Any additional notes about this driver..."
              />
            </div>

            {/* Summary Preview */}
            <div className="p-4 bg-neutral-900 rounded-lg text-white mt-6">
              <h4 className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Driver Summary</h4>
              <p className="font-semibold">{formData.full_name || 'Name not set'}</p>
              <p className="text-sm text-neutral-400">{formData.phone_number || 'Phone not set'}</p>
              {formData.email && (
                <p className="text-sm text-neutral-400">{formData.email}</p>
              )}
              <p className="text-xs text-primary-500 mt-2">
                ₱{formData.rate_per_day || '0'}/day • {formData.status.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 uppercase tracking-wide">
            Add New Driver
          </h2>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Title */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            {(() => {
              const StepIcon = STEPS[currentStep - 1].icon;
              return <StepIcon className="h-5 w-5 text-primary-600" />;
            })()}
            {STEPS[currentStep - 1].title}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[280px]">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add Driver
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddDriverModal;
