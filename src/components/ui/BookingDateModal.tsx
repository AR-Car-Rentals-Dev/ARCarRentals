import { type FC, useState, useEffect } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight, HelpCircle, Truck, AlertTriangle } from 'lucide-react';
import { cn } from '@utils/helpers';

export interface BookedDateRange {
  startDate: Date;
  endDate: Date;
}

interface BookingDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: BookingData) => void;
  initialData?: BookingData;
  bookedDateRanges?: BookedDateRange[];
}

export interface BookingData {
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  deliveryMethod: string;
}

const deliveryOptions = [
  { value: '', label: 'Select Delivery Method' },
  { value: 'pickup', label: 'Pick-up at Office' },
  { value: 'airport', label: 'Airport Delivery' },
  { value: 'hotel', label: 'Hotel Delivery' },
  { value: 'custom', label: 'Custom Address Delivery' },
];

// Generate time slots from 6:00 AM to 10:00 PM in 30-minute increments
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    const hourStr = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${hourStr}:00 ${period}`);
    if (hour < 22) {
      slots.push(`${hourStr}:30 ${period}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Minimum Trip Duration Warning Modal - Shows on top of booking modal
 */
const MinimumDurationWarning: FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          Just a quick heads-up!
        </h3>
        <p className="text-lg font-semibold text-[#E22B2B] mb-4">
          Rentals start at 24 Hours
        </p>
        <p className="text-neutral-600 mb-6 leading-relaxed">
          We can't approve rentals shorter than 24 hours because of insurance policies. 
          Please book for at least a day so you're fully covered during your drive!
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#E22B2B] hover:bg-[#c92525] text-white font-semibold rounded-xl transition-colors"
        >
          I understand
        </button>
      </div>
    </div>
  </div>
);

/**
 * Calendar component for date selection
 */
const CalendarPicker: FC<{
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  onSelectDate: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectingEnd: boolean;
  bookedDateRanges?: BookedDateRange[];
}> = ({ selectedStartDate, selectedEndDate, onSelectDate, currentMonth, onMonthChange, selectingEnd, bookedDateRanges = [] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const goToPrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const isDateSelected = (date: Date) => {
    if (selectedStartDate && date.toDateString() === selectedStartDate.toDateString()) return 'start';
    if (selectedEndDate && date.toDateString() === selectedEndDate.toDateString()) return 'end';
    return null;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  };

  // Check if a date falls within any booked date range
  const isDateBooked = (date: Date) => {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    return bookedDateRanges.some(range => {
      const rangeStart = new Date(range.startDate);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(range.endDate);
      rangeEnd.setHours(0, 0, 0, 0);
      
      return dateOnly >= rangeStart && dateOnly < rangeEnd;
    });
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (date < today) return true;
    // When selecting end date, disable dates before or same as start date (minimum 1 day difference)
    if (selectingEnd && selectedStartDate && date <= selectedStartDate) return true;
    // Disable booked dates
    if (isDateBooked(date)) return true;
    return false;
  };

  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-600" />
        </button>
        <h3 className="text-lg font-semibold text-neutral-900">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-neutral-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const disabled = isDateDisabled(date);
          const booked = isDateBooked(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && onSelectDate(date)}
              disabled={disabled}
              title={booked ? 'Already booked' : undefined}
              className={cn(
                'h-10 rounded-lg text-sm font-medium transition-all relative',
                disabled && !booked && 'text-neutral-300 cursor-not-allowed',
                booked && 'bg-neutral-200 text-neutral-400 cursor-not-allowed line-through',
                !disabled && !selected && !inRange && 'hover:bg-neutral-200 text-neutral-700',
                selected === 'start' && 'bg-[#E22B2B] text-white',
                selected === 'end' && 'bg-[#9F0303] text-white',
                inRange && 'bg-[#E22B2B]/20 text-[#E22B2B]'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend for booked dates */}
      {bookedDateRanges.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
          <span className="inline-block w-4 h-4 bg-neutral-200 rounded line-through text-[10px] flex items-center justify-center">x</span>
          <span>Already booked</span>
        </div>
      )}
    </div>
  );
};

/**
 * Time Picker component - Single picker for pick-up time
 */
const TimePicker: FC<{
  selectedTime: string;
  onSelectTime: (time: string) => void;
}> = ({ selectedTime, onSelectTime }) => (
  <div className="bg-neutral-50 rounded-xl p-4 h-full">
    <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
      <Clock className="h-4 w-4" />
      Pick-up Time
    </h4>
    <div className="max-h-[280px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
      {timeSlots.map((time) => (
        <button
          key={time}
          onClick={() => onSelectTime(time)}
          className={cn(
            'w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors text-left',
            selectedTime === time
              ? 'bg-[#E22B2B] text-white'
              : 'hover:bg-neutral-200 text-neutral-700'
          )}
        >
          {time}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Booking Date/Time Modal Component
 * Allows users to select start date, end date, pick-up time, and delivery method
 * Return time is automatically set to match pick-up time
 */
export const BookingDateModal: FC<BookingDateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  bookedDateRanges = [],
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate || null);
  const [pickupTime, setPickupTime] = useState(initialData?.startTime || '');
  const [deliveryMethod, setDeliveryMethod] = useState(initialData?.deliveryMethod || '');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMinDurationWarning, setShowMinDurationWarning] = useState(true); // Show on open
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  // Check if selected date range overlaps with any booked range
  const checkOverlap = (start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    
    const selectedStart = new Date(start);
    selectedStart.setHours(0, 0, 0, 0);
    const selectedEnd = new Date(end);
    selectedEnd.setHours(0, 0, 0, 0);
    
    return bookedDateRanges.some(range => {
      const rangeStart = new Date(range.startDate);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(range.endDate);
      rangeEnd.setHours(0, 0, 0, 0);
      
      // Check if ranges overlap
      return selectedStart < rangeEnd && selectedEnd > rangeStart;
    });
  };

  // Reset state when modal opens - show warning every time
  useEffect(() => {
    if (isOpen) {
      setStartDate(initialData?.startDate || null);
      setEndDate(initialData?.endDate || null);
      setPickupTime(initialData?.startTime || '');
      setDeliveryMethod(initialData?.deliveryMethod || '');
      setCurrentMonth(new Date());
      setActiveTab('start');
      setShowMinDurationWarning(true); // Always show warning when modal opens
      setOverlapWarning(null);
    }
  }, [isOpen, initialData]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleDateSelect = (date: Date) => {
    if (activeTab === 'start') {
      setStartDate(date);
      setOverlapWarning(null); // Clear warning when start date changes
      // If end date is before or same as start date, reset it
      if (endDate && date >= endDate) {
        setEndDate(null);
      } else if (endDate) {
        // Check for overlap with new start date
        if (checkOverlap(date, endDate)) {
          setOverlapWarning('Selected dates overlap with an existing booking. Please choose different dates.');
        }
      }
      // Auto-switch to end tab after selecting start
      setActiveTab('end');
    } else {
      // Ensure end date is after start date (at least 1 day for 24hr minimum)
      if (startDate && date <= startDate) {
        return;
      }
      setEndDate(date);
      // Check for overlap
      if (checkOverlap(startDate, date)) {
        setOverlapWarning('Selected dates overlap with an existing booking. Please choose different dates.');
      } else {
        setOverlapWarning(null);
      }
    }
  };

  const hasOverlap = checkOverlap(startDate, endDate);

  const handleConfirm = () => {
    // Prevent confirmation if dates overlap with existing bookings
    if (hasOverlap) {
      setOverlapWarning('Cannot confirm: Selected dates overlap with an existing booking. Please choose different dates.');
      return;
    }
    
    // Return time is the same as pickup time
    onConfirm({
      startDate,
      startTime: pickupTime,
      endDate,
      endTime: pickupTime, // Same time as pickup
      deliveryMethod,
    });
    onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setPickupTime('');
    setDeliveryMethod('');
    setActiveTab('start');
    setOverlapWarning(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900">
              Set booking date and time
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Date Selection & Info */}
              <div className="space-y-4">
                {/* Tab Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('start')}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-xl font-semibold transition-all',
                      activeTab === 'start'
                        ? 'bg-[#E22B2B] text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    Pick-up Date
                  </button>
                  <button
                    onClick={() => setActiveTab('end')}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-xl font-semibold transition-all',
                      activeTab === 'end'
                        ? 'bg-[#9F0303] text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    Return Date
                  </button>
                </div>

                {/* Selected Dates Display */}
                <div className="space-y-3">
                  <div 
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all cursor-pointer',
                      activeTab === 'start' ? 'border-[#E22B2B] bg-[#E22B2B]/5' : 'border-neutral-200'
                    )}
                    onClick={() => setActiveTab('start')}
                  >
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Pick-up Date</span>
                    </div>
                    <p className="font-semibold text-neutral-900">{formatDate(startDate)}</p>
                    {pickupTime && (
                      <p className="text-sm text-[#E22B2B] mt-1">{pickupTime}</p>
                    )}
                  </div>

                  <div 
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all cursor-pointer',
                      activeTab === 'end' ? 'border-[#9F0303] bg-[#9F0303]/5' : 'border-neutral-200'
                    )}
                    onClick={() => setActiveTab('end')}
                  >
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Return Date</span>
                    </div>
                    <p className="font-semibold text-neutral-900">{formatDate(endDate)}</p>
                    {pickupTime && endDate && (
                      <p className="text-sm text-[#9F0303] mt-1">{pickupTime}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                    <Truck className="h-4 w-4" />
                    Delivery Method
                  </label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full p-3 border border-neutral-200 rounded-xl text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#E22B2B] focus:border-transparent"
                  >
                    {deliveryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 24-Hour Policy Info */}
                <div className="flex items-start gap-2 p-3 bg-neutral-100 rounded-xl">
                  <HelpCircle className="h-5 w-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">24-Hour Minimum Policy</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      All rentals require a minimum 24-hour booking period. Return time will match your pick-up time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Column - Calendar */}
              <div>
                <CalendarPicker
                  selectedStartDate={startDate}
                  selectedEndDate={endDate}
                  onSelectDate={handleDateSelect}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  selectingEnd={activeTab === 'end'}
                  bookedDateRanges={bookedDateRanges}
                />
              </div>

              {/* Right Column - Time Picker */}
              <div>
                <TimePicker
                  selectedTime={pickupTime}
                  onSelectTime={setPickupTime}
                />
              </div>
            </div>
          </div>

          {/* Overlap Warning Message */}
          {overlapWarning && (
            <div className="px-6 py-3 bg-amber-50 border-t border-amber-200">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{overlapWarning}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-4 p-6 border-t border-neutral-200">
            <button
              onClick={handleClear}
              className="flex-1 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleConfirm}
              disabled={!startDate || !endDate || !pickupTime || hasOverlap}
              className={cn(
                'flex-1 py-3 font-semibold rounded-xl transition-colors',
                startDate && endDate && pickupTime && !hasOverlap
                  ? 'bg-[#E22B2B] hover:bg-[#c92525] text-white'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              )}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      {/* Minimum Duration Warning Modal - Shows on top when modal opens */}
      {showMinDurationWarning && (
        <MinimumDurationWarning onClose={() => setShowMinDurationWarning(false)} />
      )}
    </>
  );
};

export default BookingDateModal;
