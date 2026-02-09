import React, { useState, useEffect } from 'react';
import {
    Download,
    Calendar,
    Clock,
    MapPin,
    TrendingUp,
    DollarSign,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { supabase } from '@services/supabase';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Types
interface AnalyticsData {
    avgRentalDuration: number;
    topPickupLocation: string;
    leadRecoveryRate: number;
    leadRecoveryChange: number;
    avgRevenuePerBooking: number;
    revenueData: Array<{ month: string; revenue: number }>;
    bookingConversion: {
        totalLeads: number;
        successfulBookings: number;
        conversionRate: number;
    };
    vehiclePerformance: Array<{ model: string; bookings: number }>;
    latestInvoices: Array<{
        id: string;
        customer: string;
        amount: number;
        status: string;
    }>;
    abandonedLeads: Array<{
        name: string;
        initials: string;
        color: string;
        step: string;
        id: string;
    }>;
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-500', 'bg-purple-500'];

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const AdminAnalyticsPage: React.FC = () => {
    const [dateRange] = useState('Last 30 Days');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData>({
        avgRentalDuration: 0,
        topPickupLocation: 'N/A',
        leadRecoveryRate: 0,
        leadRecoveryChange: 0,
        avgRevenuePerBooking: 0,
        revenueData: [],
        bookingConversion: { totalLeads: 0, successfulBookings: 0, conversionRate: 0 },
        vehiclePerformance: [],
        latestInvoices: [],
        abandonedLeads: []
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch avg rental duration
                const { data: bookingsDuration } = await supabase
                    .from('bookings')
                    .select('rental_days')
                    .not('rental_days', 'is', null);

                const avgRentalDuration = bookingsDuration && bookingsDuration.length > 0
                    ? bookingsDuration.reduce((sum, b) => sum + (b.rental_days || 0), 0) / bookingsDuration.length
                    : 0;

                // 2. Fetch top pickup location
                const { data: locationData } = await supabase
                    .from('bookings')
                    .select('pickup_location')
                    .not('pickup_location', 'is', null);

                const locationCounts: Record<string, number> = {};
                locationData?.forEach((b: { pickup_location: string | null }) => {
                    if (b.pickup_location) {
                        locationCounts[b.pickup_location] = (locationCounts[b.pickup_location] || 0) + 1;
                    }
                });
                const topPickupLocation = Object.entries(locationCounts)
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

                // 3. Lead recovery rate
                const { count: totalLeads } = await supabase
                    .from('abandoned_leads')
                    .select('*', { count: 'exact', head: true });

                const { count: recoveredLeads } = await supabase
                    .from('abandoned_leads')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'recovered');

                const leadRecoveryRate = totalLeads && totalLeads > 0
                    ? ((recoveredLeads || 0) / totalLeads) * 100
                    : 0;

                // 4. Avg revenue per booking
                const { data: paymentsData } = await supabase
                    .from('payments')
                    .select('amount')
                    .in('payment_status', ['paid', 'completed']);

                const avgRevenuePerBooking = paymentsData && paymentsData.length > 0
                    ? paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0) / paymentsData.length
                    : 0;

                // 5. Revenue trend (last 6 months)
                const revenueData = [];
                for (let i = 5; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
                    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

                    const { data: monthPayments } = await supabase
                        .from('payments')
                        .select('amount')
                        .in('payment_status', ['paid', 'completed'])
                        .gte('paid_at', monthStart)
                        .lte('paid_at', monthEnd);

                    const revenue = monthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
                    revenueData.push({
                        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                        revenue
                    });
                }

                // 6. Booking conversion
                const { count: successfulBookings } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true });

                const conversionRate = totalLeads && totalLeads > 0
                    ? ((successfulBookings || 0) / ((totalLeads || 0) + (successfulBookings || 0))) * 100
                    : 0;

                // 7. Vehicle performance (top 5)
                const { data: vehicleBookings } = await supabase
                    .from('bookings')
                    .select(`
                        vehicle_id,
                        vehicles (brand, model)
                    `);

                const vehicleCounts: Record<string, { count: number; name: string }> = {};
                vehicleBookings?.forEach((b: any) => {
                    if (b.vehicle_id && b.vehicles) {
                        const name = `${b.vehicles.brand} ${b.vehicles.model}`;
                        if (!vehicleCounts[b.vehicle_id]) {
                            vehicleCounts[b.vehicle_id] = { count: 0, name };
                        }
                        vehicleCounts[b.vehicle_id].count++;
                    }
                });
                const vehiclePerformance = Object.values(vehicleCounts)
                    .map(v => ({ model: v.name, bookings: v.count }))
                    .sort((a, b) => b.bookings - a.bookings)
                    .slice(0, 5);

                // 8. Latest invoices
                const { data: invoicesData } = await supabase
                    .from('payments')
                    .select(`
                        id,
                        amount,
                        payment_status,
                        bookings (
                            customers (full_name)
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(3);

                const latestInvoices = invoicesData?.map((p: any) => ({
                    id: `#INV-${p.id.substring(0, 4).toUpperCase()}`,
                    customer: p.bookings?.customers?.full_name || 'Unknown',
                    amount: p.amount || 0,
                    status: p.payment_status
                })) || [];

                // 9. Abandoned leads for recovery widget
                const { data: leadsData } = await supabase
                    .from('abandoned_leads')
                    .select('id, lead_name, last_step')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(3);

                const abandonedLeads = leadsData?.map((lead: any, index: number) => ({
                    id: lead.id,
                    name: lead.lead_name,
                    initials: getInitials(lead.lead_name),
                    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
                    step: lead.last_step === 'payment' ? 'Payment Confirmation' :
                        lead.last_step === 'renter_info' ? 'Renter Information' : 'Vehicle Selection'
                })) || [];

                setData({
                    avgRentalDuration: Math.round(avgRentalDuration * 10) / 10,
                    topPickupLocation,
                    leadRecoveryRate: Math.round(leadRecoveryRate * 10) / 10,
                    leadRecoveryChange: 5.2, // Could calculate from historical data
                    avgRevenuePerBooking: Math.round(avgRevenuePerBooking * 100) / 100,
                    revenueData,
                    bookingConversion: {
                        totalLeads: totalLeads || 0,
                        successfulBookings: successfulBookings || 0,
                        conversionRate: Math.round(conversionRate * 10) / 10
                    },
                    vehiclePerformance,
                    latestInvoices,
                    abandonedLeads
                });
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-neutral-100 text-neutral-700';
        }
    };

    const maxBookings = data.vehiclePerformance.length > 0
        ? Math.max(...data.vehiclePerformance.map(v => v.bookings))
        : 1;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#E22B2B]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Business Analytics</h1>
                    <p className="text-sm sm:text-base text-neutral-500 mt-1">Performance metrics across vehicles, leads, and bookings.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">{dateRange}</span>
                        <span className="sm:hidden">Filter</span>
                    </button>
                    <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#E22B2B] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#c71f1f]">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export Report</span>
                        <span className="sm:hidden">Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Avg Rental Duration */}
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            +12%
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-4">Avg Rental Duration</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                        {data.avgRentalDuration} <span className="text-lg font-normal">Days</span>
                    </p>
                </div>

                {/* Top Pickup Location */}
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-teal-600" />
                    </div>
                    <p className="text-sm text-neutral-500 mt-4">Top Pickup Location</p>
                    <p className="text-xl font-bold text-neutral-900 mt-1">{data.topPickupLocation}</p>
                </div>

                {/* Lead Recovery Rate */}
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            +{data.leadRecoveryChange}%
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-4">Lead Recovery Rate</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">{data.leadRecoveryRate}%</p>
                </div>

                {/* Avg Revenue Per Booking */}
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="text-sm text-neutral-500 mt-4">Avg. Revenue / Booking</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                        ₱{data.avgRevenuePerBooking.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend - Full Width Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-neutral-900">Revenue Trend</h3>
                        <select className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-600">
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Daily</option>
                        </select>
                    </div>
                    <div className="h-48 sm:h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E22B2B" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#E22B2B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis
                                    hide={true}
                                />
                                <Tooltip
                                    formatter={(value) => [`₱${(value as number || 0).toLocaleString()}`, 'Revenue']}
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '8px 12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#E22B2B"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Conversion */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-6">Booking Conversion</h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-neutral-500">Total Leads (Abandoned)</span>
                                <span className="font-semibold">{data.bookingConversion.totalLeads.toLocaleString()}</span>
                            </div>
                            <div className="h-4 bg-[#E22B2B] rounded-full" />
                        </div>

                        <div className="flex justify-center py-2">
                            <ArrowRight className="w-5 h-5 text-neutral-300 rotate-90" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-neutral-500">Successful Bookings</span>
                                <span className="font-semibold">{data.bookingConversion.successfulBookings}</span>
                            </div>
                            <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#E22B2B]"
                                    style={{ width: `${Math.min(data.bookingConversion.conversionRate, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-3xl font-bold text-[#E22B2B]">{data.bookingConversion.conversionRate}%</p>
                            <p className="text-sm text-neutral-500">Total Conversion Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-900">Vehicle Performance</h3>
                        <p className="text-xs sm:text-sm text-neutral-500">Most frequently booked vehicle models</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#E22B2B]" />
                        <span className="text-xs sm:text-sm text-neutral-600">Bookings Count</span>
                    </div>
                </div>

                {data.vehiclePerformance.length === 0 ? (
                    <div className="h-40 sm:h-48 flex items-center justify-center text-neutral-400">
                        No booking data available
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-2">
                        <div className="flex items-end gap-3 sm:gap-6 h-40 sm:h-48 min-w-fit">
                            {data.vehiclePerformance.map((vehicle) => (
                                <div key={vehicle.model} className="flex-shrink-0 w-16 sm:w-20 lg:flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-neutral-700">{vehicle.bookings}</span>
                                    <div
                                        className="w-full bg-[#E22B2B] rounded-t-lg transition-all min-h-[20px]"
                                        style={{ height: `${(vehicle.bookings / maxBookings) * 100}px` }}
                                    />
                                    <span className="text-[10px] sm:text-xs text-neutral-500 text-center truncate w-full">{vehicle.model}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest Invoices */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Latest Invoices</h3>

                    {data.latestInvoices.length === 0 ? (
                        <div className="py-8 text-center text-neutral-400">No invoices yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-neutral-500 text-left">
                                        <th className="pb-3 font-medium">ID</th>
                                        <th className="pb-3 font-medium">Customer</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.latestInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-t border-neutral-100">
                                            <td className="py-3 font-medium text-neutral-900">{invoice.id}</td>
                                            <td className="py-3 text-neutral-600">{invoice.customer}</td>
                                            <td className="py-3 text-neutral-900">₱{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Abandoned Leads Recovery */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Abandoned Leads Recovery</h3>

                    {data.abandonedLeads.length === 0 ? (
                        <div className="py-8 text-center text-neutral-400">No pending leads</div>
                    ) : (
                        <div className="space-y-4">
                            {data.abandonedLeads.map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${lead.color} flex items-center justify-center text-white font-semibold text-sm`}>
                                            {lead.initials}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">{lead.name}</p>
                                            <p className="text-xs text-neutral-500">Left at: {lead.step}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        onClick={() => window.location.href = '/admin/leads'}
                                    >
                                        Recover
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
