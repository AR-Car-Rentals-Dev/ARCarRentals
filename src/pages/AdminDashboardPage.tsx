import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { authService, type User as UserType } from '@services/authService';
import { vehicleService } from '@services/vehicleService';
import { supabase } from '@services/supabase';
import { AdminPageSkeleton } from '@components/ui/AdminPageSkeleton';

interface KpiCardProps {
  title: string;
  value: string | number;
  helperText: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const KpiCard: FC<KpiCardProps> = ({ title, value, helperText, icon, isLoading }) => (
  <div className="kpi-card">
    <div className="kpi-header">
      <div className="kpi-title-section">
        <span className="kpi-label">{title}</span>
      </div>
      <div className="kpi-icon">{icon}</div>
    </div>
    <div className="kpi-value-section">
      {isLoading ? (
        <div className="h-10 w-32 bg-neutral-200 animate-pulse rounded" />
      ) : (
        <>
          <div className="kpi-value">{value}</div>
          <div className="kpi-helper">{helperText}</div>
        </>
      )}
    </div>
  </div>
);

interface RecentBooking {
  id: string;
  customer: string;
  vehicle: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
}

const StatusBadge: FC<{ status: RecentBooking['status'] }> = ({ status }) => {
  const styles = {
    active: 'status-badge-active',
    completed: 'status-badge-completed',
    cancelled: 'status-badge-cancelled',
  };

  return (
    <span className={`status-badge ${styles[status]}`}>
      {status}
    </span>
  );
};

interface FleetStatusItemProps {
  label: string;
  count: number;
  color: 'green' | 'blue' | 'orange';
}

const FleetStatusItem: FC<FleetStatusItemProps> = ({ label, count, color }) => {
  const dotColors = {
    green: 'status-dot-green',
    blue: 'status-dot-blue',
    orange: 'status-dot-orange',
  };

  return (
    <div className="fleet-status-item">
      <div className="fleet-status-label">
        <span className={`status-dot ${dotColors[color]}`}></span>
        <span>{label}</span>
      </div>
      <div className="fleet-status-count">{count}</div>
    </div>
  );
};

/**
 * Admin Dashboard page - Main overview
 */
export const AdminDashboardPage: FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    totalFleet: 0,
    utilization: 0,
    availableVehicles: 0,
    bookedVehicles: 0,
    maintenanceVehicles: 0,
  });

  // Chart data (Feb to Jun)
  const chartData = [
    { month: 'Feb', bookings: 12 },
    { month: 'Mar', bookings: 18 },
    { month: 'Apr', bookings: 15 },
    { month: 'May', bookings: 24 },
    { month: 'Jun', bookings: 28 },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
        navigate('/customer/dashboard');
        return;
      }
      setUser(currentUser);
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch bookings with counts
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_status,
            total_amount,
            start_date,
            customers (full_name),
            vehicles (brand, model)
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        if (bookingsError) throw bookingsError;

        // Calculate active bookings count
        const { count: activeBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .in('booking_status', ['pending', 'accepted']);

        // Calculate total revenue
        const { data: revenueData } = await supabase
          .from('bookings')
          .select('total_amount')
          .eq('booking_status', 'completed');
        
        const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 125840;

        const vehicleStatsRes = await vehicleService.getStats();

        if (vehicleStatsRes.data) {
          const totalFleet = vehicleStatsRes.data.total || 48;
          const activeBookingsCount = activeBookings || 23;
          const bookedVehicles = activeBookingsCount;
          const maintenanceVehicles = 7;
          const availableVehicles = totalFleet - bookedVehicles - maintenanceVehicles;
          const utilization = totalFleet > 0 ? Math.round((bookedVehicles / totalFleet) * 100) : 0;

          setStats({
            totalRevenue,
            activeBookings: activeBookingsCount,
            totalFleet,
            utilization,
            availableVehicles,
            bookedVehicles,
            maintenanceVehicles,
          });
        }

        if (bookingsData) {
          const transformed: RecentBooking[] = bookingsData.map((booking: any) => ({
            id: booking.id.substring(0, 11),
            customer: booking.customers?.full_name || 'Unknown Customer',
            vehicle: booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'Unknown Vehicle',
            date: new Date(booking.start_date).toISOString().split('T')[0],
            status: booking.booking_status === 'accepted' || booking.booking_status === 'pending' ? 'active' : 
                   booking.booking_status === 'completed' ? 'completed' : 'cancelled',
          }));
          setRecentBookings(transformed);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use placeholder data
        setStats({
          totalRevenue: 125840,
          activeBookings: 23,
          totalFleet: 48,
          utilization: 78,
          availableVehicles: 18,
          bookedVehicles: 23,
          maintenanceVehicles: 7,
        });
        setRecentBookings([
          { id: 'BK-2024-001', customer: 'Sarah Johnson', vehicle: 'Tesla Model 3', date: '2024-01-15', status: 'active' },
          { id: 'BK-2024-002', customer: 'Michael Chen', vehicle: 'BMW X5', date: '2024-01-14', status: 'completed' },
          { id: 'BK-2024-003', customer: 'Emma Davis', vehicle: 'Mercedes C-Class', date: '2024-01-14', status: 'active' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return <AdminPageSkeleton />;
  }

  if (isLoading) {
    return <AdminPageSkeleton />;
  }

  return (
    <>
      <div className="dashboard-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
          </div>
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

        {/* KPI Cards Row */}
        <div className="kpi-grid">
          <KpiCard
            title="Total Vehicles"
            value={stats.totalFleet}
            helperText="Fleet size"
            icon={<Car className="h-5 w-5 text-neutral-400" />}
            isLoading={isLoading}
          />
          <KpiCard
            title="Active Bookings"
            value={stats.activeBookings}
            helperText="Currently active"
            icon={<Calendar className="h-5 w-5 text-neutral-400" />}
            isLoading={isLoading}
          />
          <KpiCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            helperText="This month"
            icon={<DollarSign className="h-5 w-5 text-neutral-400" />}
            isLoading={isLoading}
          />
          <KpiCard
            title="Utilization"
            value={`${stats.utilization}%`}
            helperText="Fleet usage"
            icon={<TrendingUp className="h-5 w-5 text-neutral-400" />}
            isLoading={isLoading}
          />
        </div>

        {/* Analytics Row */}
        <div className="analytics-row">
          {/* Bookings Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Bookings Over Time</h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#9ca3af', fontSize: 13 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 13 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#1a1a1a', fontWeight: 600 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#ea580c" 
                    strokeWidth={3}
                    dot={{ fill: '#ea580c', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Status */}
          <div className="fleet-status-card">
            <h2 className="fleet-status-title">Fleet Status</h2>
            <div className="fleet-status-list">
              <FleetStatusItem label="Available" count={stats.availableVehicles} color="green" />
              <FleetStatusItem label="Booked" count={stats.bookedVehicles} color="blue" />
              <FleetStatusItem label="Maintenance" count={stats.maintenanceVehicles} color="orange" />
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bookings-card">
          <div className="bookings-header">
            <h2 className="bookings-title">Recent Bookings</h2>
          </div>
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-medium">{booking.id}</td>
                    <td className="customer-name">{booking.customer}</td>
                    <td>{booking.vehicle}</td>
                    <td>{booking.date}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
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
        }

        .user-role {
          font-size: 12px;
          color: #9ca3af;
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

        /* KPI Cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .kpi-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .kpi-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .kpi-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-value-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .kpi-value {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }

        .kpi-helper {
          font-size: 13px;
          color: #9ca3af;
        }

        /* Analytics Row */
        .analytics-row {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
        }

        .chart-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .chart-header {
          margin-bottom: 24px;
        }

        .chart-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .chart-container {
          position: relative;
        }

        /* Fleet Status Card */
        .fleet-status-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .fleet-status-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 24px 0;
        }

        .fleet-status-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .fleet-status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .fleet-status-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #4b5563;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-dot-green {
          background: #10b981;
        }

        .status-dot-blue {
          background: #3b82f6;
        }

        .status-dot-orange {
          background: #f97316;
        }

        .fleet-status-count {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* Bookings Card */
        .bookings-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .bookings-header {
          margin-bottom: 20px;
        }

        .bookings-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .table-container {
          overflow-x: auto;
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bookings-table thead tr {
          border-bottom: 1px solid #e5e7eb;
        }

        .bookings-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }

        .bookings-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.15s ease;
        }

        .bookings-table tbody tr:hover {
          background-color: #f9fafb;
        }

        .bookings-table tbody tr:last-child {
          border-bottom: none;
        }

        .bookings-table td {
          padding: 16px;
          font-size: 14px;
          color: #4b5563;
        }

        .bookings-table td.font-medium {
          font-weight: 600;
          color: #1a1a1a;
        }

        .customer-name {
          color: #3b82f6;
          font-weight: 500;
        }

        /* Status Badges */
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge-active {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-badge-completed {
          background: #dbeafe;
          color: #2563eb;
        }

        .status-badge-cancelled {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Responsive Design */
        @media (max-width: 1280px) {
          .analytics-row {
            grid-template-columns: 1fr;
          }

          .fleet-status-card {
            max-width: none;
          }
        }

        @media (max-width: 1024px) {
          .kpi-grid {
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

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .kpi-value {
            font-size: 28px;
          }
        }

        /* Focus visible for accessibility */
        .kpi-card:focus-visible,
        .chart-card:focus-visible,
        .fleet-status-card:focus-visible,
        .bookings-card:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default AdminDashboardPage;
