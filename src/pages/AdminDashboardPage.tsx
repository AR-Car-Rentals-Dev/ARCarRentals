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

  // Chart data - dynamically loaded from database
  const [chartData, setChartData] = useState<Array<{ month: string; bookings: number }>>([]);

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
        // 1. Fetch total fleet count
        const { count: totalFleet } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true });

        // 2. Fetch maintenance vehicles count
        const { count: maintenanceVehicles } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'maintenance');

        // 3. Fetch active bookings (confirmed + pending with paid status)
        const { data: activeBookingsData } = await supabase
          .from('bookings')
          .select(`
            id,
            payments (payment_status)
          `)
          .in('booking_status', ['pending', 'confirmed']);

        // Filter bookings with paid payments
        const actualActiveBookings = activeBookingsData?.filter((booking: any) => {
          const latestPayment = booking.payments?.[0];
          return latestPayment?.payment_status === 'paid' || latestPayment?.payment_status === 'completed';
        }).length || 0;

        // 4. Calculate this month's revenue (paid bookings only)
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data: revenueData } = await supabase
          .from('bookings')
          .select(`
            total_amount,
            payments!inner (
              payment_status,
              paid_at
            )
          `)
          .gte('payments.paid_at', firstDayOfMonth)
          .lte('payments.paid_at', lastDayOfMonth)
          .in('payments.payment_status', ['paid', 'completed']);
        
        const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

        // 5. Fetch bookings over time (last 6 months)
        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthStart)
            .lte('created_at', monthEnd);

          monthsData.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            bookings: count || 0,
          });
        }
        setChartData(monthsData);

        // 6. Fetch recent bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_reference,
            booking_status,
            total_amount,
            start_date,
            customers (full_name),
            vehicles (brand, model)
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        if (bookingsData) {
          const transformed: RecentBooking[] = bookingsData.map((booking: any) => ({
            id: booking.booking_reference || booking.id.substring(0, 11),
            customer: booking.customers?.full_name || 'Unknown Customer',
            vehicle: booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'Unknown Vehicle',
            date: new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: booking.booking_status === 'confirmed' || booking.booking_status === 'pending' ? 'active' : 
                   booking.booking_status === 'completed' ? 'completed' : 'cancelled',
          }));
          setRecentBookings(transformed);
        }

        // 7. Calculate fleet statistics
        const total = totalFleet || 0;
        const booked = actualActiveBookings;
        const maintenance = maintenanceVehicles || 0;
        const available = Math.max(0, total - booked - maintenance);
        const utilization = total > 0 ? Math.round((booked / total) * 100) : 0;

        setStats({
          totalRevenue,
          activeBookings: booked,
          totalFleet: total,
          utilization,
          availableVehicles: available,
          bookedVehicles: booked,
          maintenanceVehicles: maintenance,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty/zero values on error
        setStats({
          totalRevenue: 0,
          activeBookings: 0,
          totalFleet: 0,
          utilization: 0,
          availableVehicles: 0,
          bookedVehicles: 0,
          maintenanceVehicles: 0,
        });
        setRecentBookings([]);
        setChartData([]);
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
        <h1 className="page-title">Dashboard</h1>

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
            value={`₱${stats.totalRevenue.toLocaleString()}`}
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
              {isLoading || chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[280px]">
                  <div className="text-neutral-400">Loading chart data...</div>
                </div>
              ) : (
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
              )}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-neutral-400">Loading bookings...</div>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-neutral-400">No bookings yet</div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 1.8vw, 24px);
        }

        /* Page Header */
        .user-info-section {
          display: flex;
          align-items: center;
          gap: clamp(10px, 0.9vw, 12px);
          justify-content: flex-end;
          margin-bottom: 4px;
        }

        .page-title {
          font-size: clamp(24px, 2vw, 32px);
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .user-details {
          text-align: right;
        }

        .user-name {
          font-size: clamp(13px, 1vw, 14px);
          font-weight: 600;
          color: #1a1a1a;
        }

        .user-role {
          font-size: clamp(11px, 0.85vw, 12px);
          color: #9ca3af;
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

        /* KPI Cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: clamp(16px, 1.5vw, 20px);
        }

        .kpi-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: clamp(12px, 1vw, 16px);
          padding: clamp(18px, 1.8vw, 24px);
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
          font-size: clamp(12px, 0.95vw, 13px);
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
          font-size: clamp(24px, 2vw, 32px);
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }

        .kpi-helper {
          font-size: clamp(12px, 0.95vw, 13px);
          color: #9ca3af;
        }

        /* Analytics Row */
        .analytics-row {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: clamp(16px, 1.5vw, 20px);
        }

        .chart-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: clamp(12px, 1vw, 16px);
          padding: clamp(18px, 1.8vw, 24px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .chart-header {
          margin-bottom: clamp(20px, 2vw, 24px);
        }

        .chart-title {
          font-size: clamp(14px, 1.15vw, 16px);
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
          border-radius: clamp(12px, 1vw, 16px);
          padding: clamp(18px, 1.8vw, 24px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .fleet-status-title {
          font-size: clamp(14px, 1.15vw, 16px);
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 24px 0;
        }

        .fleet-status-list {
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 1.8vw, 24px);
        }

        .fleet-status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .fleet-status-label {
          display: flex;
          align-items: center;
          gap: clamp(10px, 0.9vw, 12px);
          font-size: clamp(13px, 1vw, 14px);
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
          border-radius: clamp(12px, 1vw, 16px);
          padding: clamp(18px, 1.8vw, 24px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .bookings-header {
          margin-bottom: 20px;
        }

        .bookings-title {
          font-size: clamp(14px, 1.15vw, 16px);
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
          font-size: clamp(12px, 0.95vw, 13px);
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
          padding: clamp(14px, 1.2vw, 16px);
          font-size: clamp(13px, 1vw, 14px);
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
          border-radius: clamp(10px, 0.85vw, 12px);
          font-size: clamp(11px, 0.85vw, 12px);
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

        /* 4K and Ultra-wide (2560px+) */
        @media (min-width: 2560px) {
          .kpi-grid {
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
          .kpi-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }

        /* Standard Desktop - 125% scaling (1280px - 1439px) */
        @media (min-width: 1280px) and (max-width: 1439px) {
          .kpi-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
          }
          
          .page-title {
            font-size: 26px;
          }
          
          .analytics-row {
            grid-template-columns: 1fr;
          }

          .fleet-status-card {
            max-width: none;
          }
        }

        /* Tablet and Small Desktop (1024px - 1279px) */
        @media (max-width: 1279px) {
          .analytics-row {
            grid-template-columns: 1fr;
          }

          .fleet-status-card {
            max-width: none;
          }
          
          .kpi-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) {
          .user-info-section {
            margin-bottom: 0;
          }

          .page-title {
            font-size: 24px;
          }

          .kpi-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }

          .kpi-card {
            padding: 16px;
          }

          .kpi-value {
            font-size: 24px;
          }

          .kpi-label {
            font-size: 12px;
          }

          .chart-card,
          .fleet-status-card,
          .bookings-card {
            padding: 16px;
          }

          .bookings-table th,
          .bookings-table td {
            padding: 10px 8px;
            font-size: 12px;
          }

          .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .bookings-table {
            min-width: 500px;
          }
        }

        /* Mobile (max-width: 767px) */
        @media (max-width: 767px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* Small Mobile (max-width: 480px) */
        @media (max-width: 480px) {
          .kpi-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .kpi-card {
            padding: 14px;
            border-radius: 12px;
          }

          .kpi-value {
            font-size: 22px;
          }

          .page-title {
            font-size: 22px;
          }

          .dashboard-container {
            gap: 16px;
          }

          .chart-container {
            margin: 0 -8px;
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
