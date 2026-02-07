import { type FC, useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Fuel,
  Users,
  Settings2,
} from 'lucide-react';
import { Card, Button, Input, AddVehicleModal, EditVehicleModal, ConfirmDialog } from '@components/ui';
import { vehicleService, type Vehicle as VehicleType, type VehicleStats } from '@services/vehicleService';
import { AdminPageSkeleton } from '@components/ui/AdminPageSkeleton';

const StatusBadge: FC<{ status: VehicleType['status'] }> = ({ status }) => {
  const styles = {
    available: 'bg-[#22C55E]',
    rented: 'bg-[#3B82F6]',
    maintenance: 'bg-[#EAB308]',
  };

  const labels = {
    available: 'AVAILABLE',
    rented: 'RENTED',
    maintenance: 'MAINTENANCE',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

/**
 * Admin Fleet Management Page
 */
export const AdminFleetPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const [vehiclesRes, statsRes] = await Promise.all([
        vehicleService.getAll(),
        vehicleService.getStats(),
      ]);

      if (vehiclesRes.data) {
        setVehicles(vehiclesRes.data);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery || filterStatus !== 'all') {
        const statusFilter = filterStatus === 'all' ? undefined : (filterStatus as VehicleType['status']);
        const result = await vehicleService.search(searchQuery, statusFilter);
        if (result.data) {
          setVehicles(result.data);
        }
      } else {
        const result = await vehicleService.getAll();
        if (result.data) {
          setVehicles(result.data);
        }
      }
    };

    const debounce = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, filterStatus]);

  const handleEdit = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setDeleteError(null); // Clear any previous errors
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;
    
    setIsDeleting(true);
    setDeleteError(null); // Clear any previous errors
    
    try {
      const { success, error } = await vehicleService.delete(selectedVehicle.id);

      if (!success || error) {
        setDeleteError(error || 'Failed to delete vehicle');
        return;
      }
      
      // Success - close modal and refresh
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      setDeleteError(null);
      fetchVehicles();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      setDeleteError(error.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <AdminPageSkeleton />;
  }

  return (
    <>
      <div className="fleet-container">
        {/* Admin User Info - Above Title */}
        <div className="user-info-section">
          <div className="user-details">
            <div className="user-name">Admin User</div>
            <div className="user-role">Administrator</div>
          </div>
          <div className="user-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
          </div>
        </div>

        {/* Page Title */}
        <h1 className="page-title">Fleet Management</h1>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Car className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-neutral-900">{stats?.total || 0}</p>
              )}
              <p className="stat-label">Total Vehicles</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Car className="h-5 w-5 text-green-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-green-600">{stats?.available || 0}</p>
              )}
              <p className="stat-label">Available</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Car className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">{stats?.rented || 0}</p>
              )}
              <p className="stat-label">Rented</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-12 bg-neutral-200 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-yellow-600">{stats?.maintenance || 0}</p>
              )}
              <p className="stat-label">Maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search vehicles..."
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
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Car className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No vehicles found</h3>
            <p className="text-neutral-500 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first vehicle to the fleet'}
            </p>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Vehicle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-[16px] border border-[#ededf2] shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {/* Header: Name + Category Badge */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-[#1f1f1f] leading-tight">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <span className="px-2.5 py-1 text-xs font-semibold text-white bg-[#e53935] rounded-full flex-shrink-0 whitespace-nowrap">
                  {vehicle.vehicle_categories?.name || 'Uncategorized'}
                </span>
              </div>
            </div>

            {/* Car Image with Status Badge Inside */}
            <div className="px-5 py-2">
              <div className="bg-[#fafafa] rounded-xl overflow-hidden relative" style={{ height: '160px' }}>
                {/* Status Badge - Inside Image */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <StatusBadge status={vehicle.status} />
                </div>
                <img
                  src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80'}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Specs Row */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-around text-[#6b7280]">
                <div className="flex flex-col items-center gap-1.5">
                  <Settings2 className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs capitalize font-medium">{vehicle.transmission}</span>
                </div>
                <div className="h-8 w-px bg-[#eaeaf0]"></div>
                <div className="flex flex-col items-center gap-1.5">
                  <Users className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs font-medium">{vehicle.seats} Seats</span>
                </div>
                <div className="h-8 w-px bg-[#eaeaf0]"></div>
                <div className="flex flex-col items-center gap-1.5">
                  <Fuel className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs capitalize font-medium">{vehicle.fuel_type}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-[#eaeaf0]" />

            {/* Price & Admin Actions - Push to bottom */}
            <div className="px-5 py-4 flex items-center justify-between mt-auto gap-3">
              <div className="flex flex-col flex-shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#e53935] leading-none">
                    ₱{vehicle.price_per_day.toLocaleString()}
                  </span>
                </div>
                <span className="text-[#6b7280] text-xs font-medium">/day</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(vehicle)}
                  className="p-2.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 border border-blue-200"
                  title="Edit vehicle"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClick(vehicle)}
                  className="p-2.5 hover:bg-red-50 rounded-lg transition-colors text-red-600 border border-red-200"
                  title="Delete vehicle"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchVehicles}
      />

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={fetchVehicles}
        vehicle={selectedVehicle}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedVehicle(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${selectedVehicle?.brand} ${selectedVehicle?.model}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        errorMessage={deleteError}
      />

      {/* Floating Add Button for Mobile */}
      <button
        className="fleet-floating-add"
        onClick={() => setIsAddModalOpen(true)}
        title="Add Vehicle"
      >
        <Plus className="h-6 w-6" />
      </button>
      </div>

      <style>{`
        .fleet-container {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 1.5vw, 20px);
        }

        .page-title {
          font-size: clamp(24px, 2vw, 32px);
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 4px 0;
          line-height: 1;
        }

        .user-info-section {
          display: flex;
          align-items: center;
          gap: clamp(10px, 0.9vw, 12px);
          justify-content: flex-end;
          margin-bottom: 4px;
        }

        .user-details {
          text-align: right;
        }

        .user-name {
          font-size: clamp(13px, 1vw, 14px);
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .user-role {
          font-size: clamp(11px, 0.85vw, 12px);
          color: #9ca3af;
          line-height: 1.2;
        }

        .user-avatar {
          width: clamp(36px, 2.8vw, 40px);
          height: clamp(36px, 2.8vw, 40px);
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
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: clamp(16px, 1.5vw, 20px);
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: clamp(12px, 1vw, 16px);
          padding: clamp(18px, 1.8vw, 24px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-label {
          font-size: clamp(12px, 0.95vw, 13px);
          color: #9ca3af;
        }

        .search-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: clamp(12px, 1vw, 16px);
          padding: clamp(16px, 1.5vw, 20px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .fleet-floating-add {
          display: flex;
          position: fixed;
          bottom: clamp(24px, 2.5vw, 32px);
          right: clamp(24px, 2.5vw, 32px);
          width: 56px;
          height: 56px;
          background: #E22B2B;
          color: white;
          border: none;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(226, 43, 43, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .fleet-floating-add:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(226, 43, 43, 0.5);
        }

        /* 4K and Ultra-wide (2560px+) */
        @media (min-width: 2560px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            max-width: 1600px;
          }
          
          .page-title {
            font-size: 32px;
          }
        }

        /* Large Desktop - 1920x1080 (1440px - 2559px) */
        @media (min-width: 1440px) and (max-width: 2559px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }

        /* Standard Desktop - 125% scaling (1280px - 1439px) */
        @media (min-width: 1280px) and (max-width: 1439px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
          }
          
          .page-title {
            font-size: 26px;
          }
        }

        /* Tablet and Small Desktop (1024px - 1279px) */
        @media (max-width: 1279px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) {
          .fleet-container {
            gap: 16px;
            padding-bottom: 80px;
          }

          .user-info-section {
            margin-bottom: 0;
          }

          .page-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
          }

          .search-card {
            padding: 12px;
          }

          .fleet-floating-add {
            bottom: 24px;
            right: 24px;
          }
        }

        /* Mobile (max-width: 767px) */
        @media (max-width: 767px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* Small Mobile (max-width: 480px) */
        @media (max-width: 480px) {
          .page-title {
            font-size: 22px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 14px;
            border-radius: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminFleetPage;
