import { type FC, useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Trash2,
  User,
  RefreshCw,
  Plus,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Button, Input, ConfirmDialog } from '@components/ui';
import { supabase } from '@services/supabase';
import { AdminPageSkeleton } from '@components/ui/AdminPageSkeleton';
import { BookingDetailsViewModal } from '@components/ui/BookingDetailsViewModal';
import { SmartDeclineModal } from '@components/ui/SmartDeclineModal';

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
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refund_pending' | 'refunded';
  created_at: string;
  cancellation_reason?: string;
  refund_status?: 'none' | 'pending' | 'completed';
  refund_reference_id?: string;
  refund_proof_url?: string;
  customers?: Customer;
  vehicles?: Vehicle;
  payments?: Payment[];
}



// Booking List Card Component
interface BookingListCardProps {
  booking: BookingWithDetails;
  onClick: () => void;
  onDelete: () => void;
}

const BookingListCard: FC<BookingListCardProps> = ({ booking, onClick, onDelete }) => {
  const endDate = new Date(booking.start_date);
  endDate.setDate(endDate.getDate() + booking.rental_days);

  return (
    <div className="booking-list-card">
      <div className="grid gap-6" style={{ gridTemplateColumns: '3fr 1.8fr 3.5fr 1.5fr auto' }}>
        {/* Vehicle Column - Without Image */}
        <div className="flex items-center">
          <div>
            <div className="text-xs text-red-600 font-bold mb-1">
              {booking.booking_reference}
            </div>
            <div className="text-sm font-semibold text-neutral-900">
              {booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'N/A'}
            </div>
            {/* Horizontal divider with specs */}
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
              <span>{booking.vehicles?.vehicle_categories?.name || 'SUV'}</span>
              <div className="h-3 w-px bg-neutral-300"></div>
              <span>{booking.vehicles?.seats || 7} Seats</span>
            </div>
          </div>
        </div>

        {/* Customer Column */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white flex-shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-neutral-900 truncate">
              {booking.customers?.full_name || 'N/A'}
            </div>
            <div className="text-xs text-neutral-500 truncate">
              {booking.customers?.contact_number || ''}
            </div>
          </div>
        </div>

        {/* Trip Info Column - Contains Pickup, Arrow, Return, Duration */}
        <div className="flex items-start gap-4 pl-16">
          {/* Pickup */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">PICKUP</div>
            <div className="text-sm font-medium text-neutral-900">
              {new Date(booking.start_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            <div className="text-xs text-neutral-500">
              {booking.start_time || '10:00 AM'}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center pt-4">
            <ArrowRight className="h-5 w-5 text-neutral-400" />
          </div>

          {/* Return */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">RETURN</div>
            <div className="text-sm font-medium text-neutral-900">
              {endDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            <div className="text-xs text-neutral-500">
              {booking.pickup_time || '10:00 AM'}
            </div>
          </div>

          {/* Duration Badge */}
          <div className="flex items-center pt-4 pl-24">
            <div className="text-sm font-medium text-neutral-600">
              {booking.rental_days === 1 ? '1 Day' : `${booking.rental_days} Days`}
            </div>
          </div>
        </div>

        {/* Total & Status Column */}
        <div>
          <div className="text-2xl font-bold text-neutral-900 mb-2">
            ₱{booking.total_amount.toLocaleString()}
          </div>
          <div className={`status-badge status-${booking.booking_status}`}>
            {booking.booking_status === 'confirmed' ? 'ACCEPTED' : 
             booking.booking_status === 'refund_pending' ? 'REFUND PENDING' : 
             booking.booking_status.toUpperCase()}
          </div>
        </div>

        {/* Actions Column */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onClick}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 whitespace-nowrap"
          >
            View Details
          </Button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="Delete booking"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Admin Bookings Management Page
 */
export const AdminBookingsPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Filter bookings based on search and active tab
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(b => b.booking_status === 'pending');
    } else if (activeTab === 'accepted') {
      filtered = filtered.filter(b => b.booking_status === 'confirmed');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(b => b.booking_status === 'completed');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(b => ['cancelled', 'refunded', 'refund_pending'].includes(b.booking_status));
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
  }, [bookings, searchQuery, activeTab]);

  const handleExportBookings = () => {
    try {
      // Prepare CSV data with proper column widths
      const headers = ['Booking ID', 'Customer Name', 'Contact Number', 'Vehicle', 'Pickup Date', 'Return Date', 'Duration', 'Total Amount (PHP)', 'Status'];
      
      const csvRows = filteredBookings.map(booking => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.start_date);
        endDate.setDate(endDate.getDate() + booking.rental_days);
        
        // Format dates as readable format with proper spacing
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        return [
          (booking.booking_reference || '').padEnd(15),
          (booking.customers?.full_name || 'N/A').padEnd(25),
          (booking.customers?.contact_number || '').padEnd(15),
          (booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'N/A').padEnd(20),
          formatDate(startDate),
          formatDate(endDate),
          `${booking.rental_days} Day${booking.rental_days !== 1 ? 's' : ''}`.padEnd(10),
          booking.total_amount.toString().padStart(10),
          booking.booking_status.toUpperCase().padEnd(12)
        ].map(field => `"${field.trim()}"`).join(',');
      });
      
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      
      // Create and download file with UTF-8 BOM for proper encoding
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const fileName = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      showSuccessToast(`Successfully exported ${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''} to ${fileName}`);
    } catch (error) {
      console.error('Error exporting bookings:', error);
      alert('Failed to export bookings');
    }
  };

  const showSuccessToast = (message: string) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'export-success-toast';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 24px;
        right: 24px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
      ">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white"/>
        </svg>
        <span style="font-size: 14px; font-weight: 500;">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

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
        {/* Page Header with Search and Actions */}
        <div className="page-header-row">
          <h1 className="page-title">Bookings Management</h1>
          <div className="search-section">
            <Input
              placeholder="Search by booking #, customer, or car..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-neutral-400" />}
            />
          </div>
          <div className="header-actions-group">
            <div className="action-buttons">
              <Button 
                variant="outline" 
                className="refresh-button"
                onClick={fetchBookings}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                className="export-button"
                onClick={handleExportBookings}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="vertical-divider"></div>
            <div className="user-info-section">
              <div className="user-details">
                <div className="user-name">Admin User</div>
                <div className="user-role">ADMINISTRATOR</div>
              </div>
              <div className="user-avatar">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Filter Buttons */}
        <div className="tabs-container">
          <div className="tabs-wrapper">
            <button
              onClick={() => setActiveTab('all')}
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            >
              All Bookings
              <span className="tab-count">{bookings.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
            >
              Pending
              <span className="tab-count">{bookings.filter(b => b.booking_status === 'pending').length}</span>
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`tab-button ${activeTab === 'accepted' ? 'active' : ''}`}
            >
              Accepted
              <span className="tab-count">{bookings.filter(b => b.booking_status === 'confirmed').length}</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            >
              Completed
              <span className="tab-count">{bookings.filter(b => b.booking_status === 'completed').length}</span>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
            >
              Cancelled/Refunded
              <span className="tab-count">{bookings.filter(b => ['cancelled', 'refunded', 'refund_pending'].includes(b.booking_status)).length}</span>
            </button>
          </div>
          <div className="filter-buttons">
            <Button variant="outline" className="filter-btn">
              <Calendar className="h-4 w-4" />
              Filter by Date
            </Button>
            <Button variant="outline" className="filter-btn">
              <Calendar className="h-4 w-4" />
              Filter by Car
            </Button>
          </div>
        </div>

        {/* Column Headers */}
        {!isLoading && filteredBookings.length > 0 && (
          <div className="column-headers">
            <div className="column-header">VEHICLE & ID</div>
            <div className="column-header">CUSTOMER</div>
            <div className="column-header">TRIP INFO</div>
            <div className="column-header">TOTAL & STATUS</div>
            <div className="column-header"></div>
          </div>
        )}

        {/* Bookings List */}
        <div className="bookings-list">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No bookings found</h3>
              <p className="text-neutral-500">
                {searchQuery || activeTab !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No rental bookings have been created yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <BookingListCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => handleViewClick(booking)}
                  onDelete={() => handleDeleteClick(booking)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="floating-add-button"
        title="Add new booking (Walk-in)"
      >
        <Plus className="h-6 w-6" />
      </button>

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
        booking={selectedBooking as any}
        onStatusUpdate={fetchBookings}
      />

      <SmartDeclineModal
        isOpen={isDeclineModalOpen}
        booking={selectedBooking}
        onClose={() => {
          setIsDeclineModalOpen(false);
          setSelectedBooking(null);
        }}
        onDeclineComplete={fetchBookings}
      />

      <style>{`
        .bookings-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 80px;
        }

        .page-header-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          background: white;
          padding: 16px 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .page-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          white-space: nowrap;
          min-width: 220px;
        }

        .search-section {
          flex: 1;
          max-width: 400px;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: auto;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white !important;
          border: 1px solid #d1d5db !important;
          color: #1f2937 !important;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-button:hover {
          background: #f9fafb !important;
          border-color: #9ca3af !important;
        }

        .refresh-button svg {
          color: #E22B2B;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #E22B2B !important;
          border: 1px solid #E22B2B !important;
          color: white !important;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .export-button:hover {
          background: #c71f1f !important;
          border-color: #c71f1f !important;
        }

        .export-button svg {
          color: white;
        }

        .vertical-divider {
          width: 1px;
          height: 32px;
          background: #e5e7eb;
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
          font-size: 11px;
          color: #9ca3af;
          letter-spacing: 0.5px;
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

        .tabs-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          margin: 0 -20px 24px -20px;
          padding: 0 20px;
        }

        .tabs-wrapper {
          display: flex;
          gap: 8px;
          overflow-x: hidden;
        }

        .tabs-wrapper::-webkit-scrollbar {
          display: none;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white !important;
          border: 1px solid #d1d5db !important;
          color: #6b7280 !important;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
        }

        .filter-btn svg {
          color: #9ca3af;
        }

        .tab-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px 16px 16px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          margin-bottom: -1px;
        }

        .tab-button:hover {
          color: #1f2937;
          background: #f9fafb;
        }

        .tab-button.active {
          color: #E22B2B;
          border-bottom-color: #E22B2B;
        }

        .tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 20px;
          padding: 0 8px;
          background: #f3f4f6;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .tab-button.active .tab-count {
          background: #fee2e2;
          color: #E22B2B;
        }

        .column-headers {
          display: grid;
          grid-template-columns: 2.5fr 1.8fr 3.5fr 1.5fr auto;
          gap: 24px;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .column-header {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .booking-list-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s;
        }

        .booking-list-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-completed {
          background: #e0e7ff;
          color: #3730a3;
        }

        .status-cancelled {
          background: #f3f4f6;
          color: #4b5563;
        }

        .status-refund_pending {
          background: #fed7aa;
          color: #9a3412;
        }

        .status-refunded {
          background: #dbeafe;
          color: #1e40af;
        }

        .bookings-list {
          min-height: 400px;
        }

        .floating-add-button {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 56px;
          height: 56px;
          background: #E22B2B;
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(226, 43, 43, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .floating-add-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(226, 43, 43, 0.5);
        }

        .floating-add-button:active {
          transform: scale(0.95);
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
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

          .tabs-container {
            margin: 0 -16px;
            padding: 0 16px;
          }

          .floating-add-button {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminBookingsPage;
