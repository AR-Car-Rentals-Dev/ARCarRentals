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
} from 'lucide-react';
import { Card, Button, Input, AddBookingModal, EditBookingModal, ConfirmDialog, BookingDetailsModal, StatusUpdateModal } from '@components/ui';
import { bookingService as adminBookingService, type Booking as BookingType, type BookingStats } from '@services/adminBookingService';
import { supabase } from '@services/supabase';

const StatusBadge: FC<{ status: BookingType['status']; onClick?: () => void }> = ({ status, onClick }) => {
  const config = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
    active: { bg: 'bg-green-100', text: 'text-green-700', icon: Car },
    completed: { bg: 'bg-neutral-100', text: 'text-neutral-700', icon: CheckCircle },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  };

  const { bg, text, icon: Icon } = config[status];

  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} hover:opacity-80 transition-opacity cursor-pointer`}
    >
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

/**
 * Admin Bookings Management Page
 */
export const AdminBookingsPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRowClick = (booking: BookingType) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleStatusClick = (booking: BookingType) => {
    setSelectedBooking(booking);
    setIsStatusModalOpen(true);
  };

  const handleDeleteClick = (booking: BookingType) => {
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
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        adminBookingService.getAll(),
        adminBookingService.getStats(),
      ]);

      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery || filterStatus !== 'all') {
        const statusFilter = filterStatus === 'all' ? undefined : (filterStatus as BookingType['status']);
        const result = await adminBookingService.search(searchQuery, statusFilter);
        if (result.data) {
          setBookings(result.data);
        }
      } else {
        const result = await adminBookingService.getAll();
        if (result.data) {
          setBookings(result.data);
        }
      }
    };

    const debounce = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Bookings Management</h1>
          <p className="text-neutral-500">View and manage all rental bookings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-neutral-900">{stats?.total || 0}</p>
              )}
              <p className="text-sm text-neutral-500">Total Bookings</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              )}
              <p className="text-sm text-neutral-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Car className="h-5 w-5 text-green-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              )}
              <p className="text-sm text-neutral-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">{stats?.completed || 0}</p>
              )}
              <p className="text-sm text-neutral-500">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by booking # or customer..."
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
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No bookings found</h3>
            <p className="text-neutral-500 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No rental bookings have been created yet'}
            </p>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Calendar className="h-5 w-5 mr-2" />
              Create New Booking
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Booking #</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Vehicle</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Dates</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Location</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-neutral-600">Amount</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr 
                    key={booking.id} 
                    onClick={() => handleRowClick(booking)}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <span className="font-medium text-primary-600">{booking.booking_number}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {booking.customer_name || booking.users?.full_name || 'Guest'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900">
                            {booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'Unknown'}
                          </p>
                          <p className="text-sm text-neutral-500">{booking.drive_option === 'with-driver' ? 'With Driver' : 'Self-Drive'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-neutral-900">{new Date(booking.pickup_date).toLocaleDateString()}</p>
                        <p className="text-neutral-500">to {new Date(booking.return_date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-neutral-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{booking.pickup_delivery_location || booking.pickup_location || 'Office'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={booking.status} onClick={() => handleStatusClick(booking)} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-semibold text-neutral-900">₱{(booking.total_amount || booking.total_price || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBookings}
      />

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBooking(null);
        }}
        onSuccess={fetchBookings}
        booking={selectedBooking}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBooking(null);
        }}
        onStatusUpdate={fetchBookings}
        booking={selectedBooking}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedBooking(null);
        }}
        onSuccess={fetchBookings}
        booking={selectedBooking}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Booking"
        message={`Are you sure you want to delete booking ${selectedBooking?.booking_number}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminBookingsPage;
