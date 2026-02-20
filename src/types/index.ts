// Car-related types
export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  pricePerDay: number;
  carWashFee?: number | null;
  lateReturnFeePerHour?: number | null;
  currency: string;
  seats: number | string;
  transmission: TransmissionType;
  fuelType: FuelType;
  image: string;
  images: string[];
  features: string[];
  available: boolean;
  rating: number;
  reviewCount: number;
}

export type CarCategory = 'sedan' | 'suv' | 'mpv' | 'van';

export type TransmissionType = 'automatic' | 'manual';

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';

// Booking-related types
export interface Booking {
  id: string;
  carId: string;
  car?: Car;
  userId: string;
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffDate: string;
  dropoffTime: string;
  totalDays: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  // Refund workflow fields
  cancellationReason?: string;
  refundStatus?: RefundStatus;
  refundReferenceId?: string;
  refundProofUrl?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refund_pending' | 'refunded';

export type RefundStatus = 'none' | 'pending' | 'completed';

// Search-related types
export interface SearchParams {
  pickupLocation: string;
  pickupDate: string;
  carType?: CarCategory;
}

// Testimonial types
export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  location?: string;
  verified: boolean;
  reviewUrl?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
