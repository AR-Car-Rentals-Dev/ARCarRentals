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
import { AdminPageSkeleton } from '@components/ui/AdminPageSkeleton';
import { BookingDetailsViewModal } from '@components/ui/BookingDetailsViewModal';

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
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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

  const handleDeleteClick = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const handleViewClick = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
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

  if (isLoading) {
    return <AdminPageSkeleton />;
  }

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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClick(booking);
                              }}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                              title="View booking details"
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

      <BookingDetailsViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onStatusUpdate={fetchBookings}
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
