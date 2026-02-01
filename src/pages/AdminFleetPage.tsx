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
import { supabase } from '@services/supabase';

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
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', selectedVehicle.id);

      if (error) throw error;
      
      fetchVehicles();
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Fleet Management</h1>
          <p className="text-neutral-500">Manage your vehicle inventory</p>
        </div>
        <Button 
          className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/30"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
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
              <p className="text-sm text-neutral-500">Total Vehicles</p>
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
                <p className="text-2xl font-bold text-green-600">{stats?.available || 0}</p>
              )}
              <p className="text-sm text-neutral-500">Available</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
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
              <p className="text-sm text-neutral-500">Rented</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
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
              <p className="text-sm text-neutral-500">Maintenance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
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
      </Card>

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
                    {vehicle.vehicle_categories?.name || vehicle.type || 'Uncategorized'}
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
  );
};

export default AdminFleetPage;
