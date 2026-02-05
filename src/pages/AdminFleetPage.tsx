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
    available: 'bg-green-100 text-green-700 border-green-200',
    rented: 'bg-blue-100 text-blue-700 border-blue-200',
    maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const labels = {
    available: 'Available',
    rented: 'Rented',
    maintenance: 'Maintenance',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
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
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;
    
    setIsDeleting(true);
    try {
      // TODO: Implement delete method in vehicleService
      const { success, error } = { success: false, error: 'Delete not implemented yet' };
      // const { success, error } = await vehicleService.delete(selectedVehicle.id);

      if (!success || error) {
        throw new Error(error || 'Failed to delete vehicle');
      }
      
      fetchVehicles();
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      alert(error.message || 'Failed to delete vehicle');
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
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Fleet Management</h1>
          </div>
          <div className="header-actions">
            <Button 
              className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/30"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Vehicle
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img
                src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80'}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <StatusBadge status={vehicle.status} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-neutral-900">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-sm text-neutral-500">
                    {vehicle.vehicle_categories?.name || 'Uncategorized'}
                    {vehicle.color ? ` • ${vehicle.color}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{vehicle.seats}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings2 className="h-4 w-4" />
                  <span>{vehicle.transmission}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Fuel className="h-4 w-4" />
                  <span>{vehicle.fuel_type}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div>
                  <span className="text-xl font-bold text-primary-600">₱{vehicle.price_per_day.toLocaleString()}</span>
                  <span className="text-sm text-neutral-500">/day</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600"
                    title="Edit vehicle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(vehicle)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                    title="Delete vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
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
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${selectedVehicle?.brand} ${selectedVehicle?.model}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
      </div>

      <style>{`
        .fleet-container {
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
          gap: 16px;
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

export default AdminFleetPage;
