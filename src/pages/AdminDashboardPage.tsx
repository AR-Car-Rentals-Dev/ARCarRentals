import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@components/ui';
import { authService, type User as UserType } from '@services/authService';
import { vehicleService } from '@services/vehicleService';
import { bookingService as adminBookingService, type Booking } from '@services/adminBookingService';
import { customerService } from '@services/customerService';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  isLoading?: boolean;
}

const StatCard: FC<StatCardProps> = ({ title, value, change, changeType = 'neutral', icon, iconBg, iconColor, isLoading }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
        {isLoading ? (
          <div className="h-9 w-24 bg-neutral-200 animate-pulse rounded" />
        ) : (
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
        )}
        {change && !isLoading && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' : 'text-neutral-500'
          }`}>
            {changeType === 'positive' && <TrendingUp className="h-4 w-4" />}
            {changeType === 'negative' && <TrendingDown className="h-4 w-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${iconBg}`}>
        <div className={iconColor}>{icon}</div>
      </div>
    </div>
  </Card>
);

interface RecentBooking {
  id: string;
  customer: string;
  car: string;
  status: 'confirmed' | 'pending' | 'completed' | 'active' | 'cancelled';
  date: string;
  amount: string;
}

const StatusBadge: FC<{ status: RecentBooking['status'] }> = ({ status }) => {
  const styles = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    active: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  
  const icons = {
    confirmed: <CheckCircle className="h-3 w-3" />,
    pending: <Clock className="h-3 w-3" />,
    completed: <CheckCircle className="h-3 w-3" />,
    active: <Clock className="h-3 w-3" />,
    cancelled: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
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
    totalBookings: 0,
    totalCustomers: 0,
    totalFleet: 0,
  });

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
        // Fetch all stats in parallel
        const [bookingStatsRes, vehicleStatsRes, customerStatsRes, recentBookingsRes] = await Promise.all([
          adminBookingService.getStats(),
          vehicleService.getStats(),
          customerService.getStats(),
          adminBookingService.getRecent(5),
        ]);

        // Update stats
        if (bookingStatsRes.data && vehicleStatsRes.data && customerStatsRes.data) {
          setStats({
            totalRevenue: bookingStatsRes.data.totalRevenue || 0,
            totalBookings: bookingStatsRes.data.total || 0,
            totalCustomers: customerStatsRes.data.total || 0,
            totalFleet: vehicleStatsRes.data.total || 0,
          });
        }

        // Update recent bookings - transform Booking[] to RecentBooking[]
        if (recentBookingsRes.data) {
          const transformed: RecentBooking[] = recentBookingsRes.data.map((booking: Booking) => ({
            id: booking.id,
            customer: booking.users?.full_name || 'Unknown',
            car: booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'Unknown',
            status: booking.status as RecentBooking['status'],
            date: new Date(booking.pickup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: `₱${(booking.total_amount || 0).toLocaleString()}`,
          }));
          setRecentBookings(transformed);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user.fullName || 'Admin'}! 👋
            </h1>
            <p className="text-white/80">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="px-4 py-2 bg-white text-primary-600 rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              View Bookings
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Revenue"
          value={`₱${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Bookings"
          value={stats.totalBookings}
          icon={<Calendar className="h-6 w-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Fleet Size"
          value={stats.totalFleet}
          icon={<Car className="h-6 w-6" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Recent Bookings</h2>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-neutral-900 font-semibold mb-1">No bookings yet</h3>
                <p className="text-neutral-500 text-sm">When customers make bookings, they'll appear here.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Car</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-medium text-neutral-900">{booking.customer}</span>
                      </td>
                      <td className="py-4 px-4 text-neutral-600">{booking.car}</td>
                      <td className="py-4 px-4 text-neutral-600">{booking.date}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-neutral-900">{booking.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/fleet')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Add New Vehicle</p>
                  <p className="text-sm text-neutral-500">Add car to your fleet</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">New Booking</p>
                  <p className="text-sm text-neutral-500">Create manual booking</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/customers')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">View Customers</p>
                  <p className="text-sm text-neutral-500">Manage customer list</p>
                </div>
              </button>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Alerts</h2>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-neutral-100 animate-pulse rounded-xl" />
                <div className="h-16 bg-neutral-100 animate-pulse rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3">
                {stats.totalBookings === 0 && stats.totalCustomers === 0 && stats.totalFleet === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500 text-sm">No alerts at the moment</p>
                  </div>
                ) : (
                  <>
                    {stats.totalBookings > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                        <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">{stats.totalBookings} Active {stats.totalBookings === 1 ? 'Booking' : 'Bookings'}</p>
                          <p className="text-sm text-blue-700">Monitor your current rentals</p>
                        </div>
                      </div>
                    )}
                    {stats.totalFleet === 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">No Vehicles in Fleet</p>
                          <p className="text-sm text-yellow-700">Add vehicles to start accepting bookings</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
