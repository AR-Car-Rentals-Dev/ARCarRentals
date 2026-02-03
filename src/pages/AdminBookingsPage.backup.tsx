import { type FC, useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  User,
  MapPin,
  Download,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button, Input, ConfirmDialog } from '@components/ui';
import { supabase } from '@services/supabase';

// Types
interface Customer {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  address?: string;
}

interface VehicleCategory {
  name: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  price_per_day: number;
  image_url?: string;
  vehicle_categories?: VehicleCategory;
}

interface Payment {
  id: string;
  booking_id: string;
  payment_status: string;
  payment_method: string;
  amount: number;
  transaction_reference?: string;
  receipt_url?: string;
  payment_proof_url?: string;
  paid_at?: string;
  created_at: string;
}

interface BookingWithDetails {
  id: string;
  booking_reference: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  start_time?: string;
  rental_days: number;
  pickup_location: string;
  pickup_time?: string;
  total_amount: number;
  booking_status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  created_at: string;
  customers?: Customer;
  vehicles?: Vehicle;
  payments?: Payment[];
}

interface BookingStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
  completed: number;
}

// Status configurations
const STATUS_CONFIG = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
  completed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed' },
} as const;

const StatusBadge: FC<{ status: keyof typeof STATUS_CONFIG }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Booking Details Modal Component
interface BookingDetailsModalProps {
  booking: BookingWithDetails;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const BookingDetailsModalComponent: FC<BookingDetailsModalProps> = ({ booking, onClose, onStatusUpdate }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const latestPayment = booking.payments && booking.payments.length > 0 
    ? booking.payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  const receiptUrl = latestPayment?.receipt_url || latestPayment?.payment_proof_url;

  const endDate = new Date(booking.start_date);
  endDate.setDate(endDate.getDate() + booking.rental_days);

  const handleStatusChange = async (newStatus: typeof booking.booking_status) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', booking.id);

      if (error) throw error;

      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update booking status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getAvailableStatusTransitions = (currentStatus: typeof booking.booking_status) => {
    const transitions: Record<typeof booking.booking_status, typeof booking.booking_status[]> = {
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['completed', 'cancelled'],
      rejected: [],
      cancelled: [],
      completed: [],
    };
    return transitions[currentStatus] || [];
  };

  const availableStatuses = getAvailableStatusTransitions(booking.booking_status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Booking Details</h3>
                <p className="text-sm text-primary-600 font-medium">{booking.booking_reference}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={booking.booking_status} />
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-neutral-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-neutral-600" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Full Name</p>
                    <p className="text-sm font-medium text-neutral-900">{booking.customers?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-neutral-900">{booking.customers?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Contact Number</p>
                    <p className="text-sm font-medium text-neutral-900">{booking.customers?.contact_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Address</p>
                    <p className="text-sm font-medium text-neutral-900">{booking.customers?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-neutral-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-600" />
                  Booking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Pickup Location</p>
                    <p className="text-sm font-medium text-neutral-900">{booking.pickup_location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Pickup Time</p>
                    <p className="text-sm font-medium text-neutral-900">{booking.pickup_time || booking.start_time || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Start Date</p>
                    <p className="text-sm font-medium text-neutral-900">{new Date(booking.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">End Date</p>
                    <p className="text-sm font-medium text-neutral-900">{endDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Rental Days</p>
                    <p className="text-sm font-medium text-neutral-900">{booking.rental_days} day{booking.rental_days > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-primary-600">₱{booking.total_amount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-neutral-500 mb-1">Created At</p>
                    <p className="text-sm font-medium text-neutral-900">{new Date(booking.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {booking.vehicles && (
                <div className="bg-neutral-50 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <Car className="h-4 w-4 text-neutral-600" />
                    Vehicle Information
                  </h4>
                  {booking.vehicles.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={booking.vehicles.image_url}
                        alt={`${booking.vehicles.brand} ${booking.vehicles.model}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Category</p>
                      <p className="text-sm font-medium text-neutral-900">{booking.vehicles.vehicle_categories?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Brand & Model</p>
                      <p className="text-sm font-medium text-neutral-900">{booking.vehicles.brand} {booking.vehicles.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Transmission</p>
                      <p className="text-sm font-medium text-neutral-900">{booking.vehicles.transmission}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Fuel Type</p>
                      <p className="text-sm font-medium text-neutral-900">{booking.vehicles.fuel_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Seats</p>
                      <p className="text-sm font-medium text-neutral-900">{booking.vehicles.seats}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Price per Day</p>
                      <p className="text-sm font-medium text-neutral-900">₱{booking.vehicles.price_per_day.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {latestPayment && (
                <div className="bg-neutral-50 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-600" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Payment Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        latestPayment.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {latestPayment.payment_status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Payment Method</p>
                      <p className="text-sm font-medium text-neutral-900">{latestPayment.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Amount</p>
                      <p className="text-sm font-medium text-neutral-900">₱{latestPayment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Transaction Reference</p>
                      <p className="text-sm font-medium text-neutral-900">{latestPayment.transaction_reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Paid At</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {latestPayment.paid_at ? new Date(latestPayment.paid_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Receipt Image */}
                  {receiptUrl ? (
                    <div className="mt-4">
                      <p className="text-xs text-neutral-500 mb-2">Payment Receipt</p>
                      <div className="relative group">
                        <img
                          src={receiptUrl}
                          alt="Payment Receipt"
                          className="w-full h-64 object-contain rounded-lg border-2 border-green-200 bg-white cursor-pointer"
                          onClick={() => setShowImageModal(true)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => setShowImageModal(true)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-lg text-sm font-medium text-neutral-900 shadow-lg"
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-6 border-2 border-dashed border-neutral-300 rounded-lg text-center">
                      <p className="text-sm text-neutral-500">No receipt uploaded</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Update Actions */}
              {availableStatuses.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-3">Update Booking Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableStatuses.map(status => (
                      <Button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={isUpdatingStatus}
                        className={`${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text} hover:opacity-80`}
                      >
                        {isUpdatingStatus ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>Update to {STATUS_CONFIG[status].label}</>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-neutral-200 px-6 py-4 flex justify-end flex-shrink-0">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showImageModal && receiptUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-6xl max-h-full">
            <img
              src={receiptUrl}
              alt="Payment Receipt Full Size"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white text-neutral-900 rounded-full p-2 hover:bg-neutral-200 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Admin Bookings Management Page
 */
export const AdminBookingsPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [stats, setStats] = useState<BookingStats>({ total: 0, pending: 0, accepted: 0, rejected: 0, cancelled: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings with all related data
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers (
            id,
            full_name,
            email,
            contact_number,
            address
          ),
          vehicles (
            id,
            brand,
            model,
            transmission,
            fuel_type,
            seats,
            price_per_day,
            image_url,
            vehicle_categories (
              name
            )
          ),
          payments (
            id,
            booking_id,
            payment_status,
            payment_method,
            amount,
            transaction_reference,
            receipt_url,
            payment_proof_url,
            paid_at,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsData = (data || []) as BookingWithDetails[];
      setBookings(bookingsData);
      
      // Calculate stats
      const statsData: BookingStats = {
        total: bookingsData.length,
        pending: bookingsData.filter(b => b.booking_status === 'pending').length,
        accepted: bookingsData.filter(b => b.booking_status === 'accepted').length,
        rejected: bookingsData.filter(b => b.booking_status === 'rejected').length,
        cancelled: bookingsData.filter(b => b.booking_status === 'cancelled').length,
        completed: bookingsData.filter(b => b.booking_status === 'completed').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Real-time subscription
    const subscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.booking_status === filterStatus);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.booking_reference?.toLowerCase().includes(query) ||
        b.customers?.full_name?.toLowerCase().includes(query) ||
        b.customers?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page on filter/search change
  }, [bookings, filterStatus, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', selectedBooking.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bookings-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Bookings Management</h1>
          </div>
          <div className="header-actions">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={fetchBookings}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <div className="user-info-section">
              <div className="user-details">
                <div className="user-name">Admin User</div>
                <div className="user-role">Administrator</div>
              </div>
              <div className="user-avatar">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
              </div>
            </div>
          </div>
        </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
              )}
              <p className="stat-label">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              )}
              <p className="stat-label">Pending</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              )}
              <p className="stat-label">Accepted</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              )}
              <p className="stat-label">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by booking #, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-neutral-400" />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No bookings found</h3>
            <p className="text-neutral-500">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No rental bookings have been created yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Booking #</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Vehicle</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Pickup</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Return</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-neutral-600">Amount</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => {
                    const endDate = new Date(booking.start_date);
                    endDate.setDate(endDate.getDate() + booking.rental_days);
                    
                    return (
                      <tr 
                        key={booking.id} 
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-medium text-primary-600">{booking.booking_reference}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">
                                {booking.customers?.full_name || 'N/A'}
                              </p>
                              <p className="text-xs text-neutral-500">{booking.customers?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-neutral-400" />
                            <div>
                              <p className="font-medium text-neutral-900">
                                {booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-neutral-900">{new Date(booking.start_date).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-neutral-900">{endDate.toLocaleDateString()}</p>
                          <p className="text-xs text-neutral-500">{booking.rental_days} day{booking.rental_days > 1 ? 's' : ''}</p>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={booking.booking_status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-semibold text-neutral-900">₱{booking.total_amount.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleViewDetails(booking)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(booking);
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                              title="Delete booking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium text-neutral-900">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {isDetailsModalOpen && selectedBooking && (
        <BookingDetailsModalComponent
          booking={selectedBooking}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Booking"
        message={`Are you sure you want to delete booking ${selectedBooking?.booking_reference}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
      </div>

      <style>{`
        .bookings-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          line-height: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-details {
          text-align: right;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .user-role {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.2;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: #f3f4f6;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-label {
          font-size: 13px;
          color: #9ca3af;
        }

        .search-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .user-info-section {
            align-self: flex-end;
          }

          .page-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default AdminBookingsPage;
