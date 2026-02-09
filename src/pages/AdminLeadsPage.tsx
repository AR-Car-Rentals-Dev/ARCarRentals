import { type FC, useState, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    Download,
    Phone,
    Mail,
    MessageCircle,
    X,
    User,
    Car,
    Clock,
    CheckCircle,
    Send,
    FileText,
    TrendingUp,
    Target
} from 'lucide-react';
import { supabase } from '@services/supabase';

// Types
interface Lead {
    id: string;
    lead_name: string;
    email: string | null;
    phone: string | null;
    vehicle_id: string | null;
    vehicle_name: string | null;
    vehicle_image: string | null;
    pickup_location: string | null;
    dropoff_location: string | null;
    pickup_date: string | null;
    return_date: string | null;
    estimated_price: number | null;
    drive_option: string | null;
    last_step: 'date_selection' | 'renter_info' | 'payment';
    drop_off_timestamp: string;
    automation_status: 'not_sent' | 'sent' | 'opened' | 'clicked';
    automation_sent_at: string | null;
    automation_opened_at: string | null;
    automation_clicked_at: string | null;
    status: 'pending' | 'recovered' | 'expired';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

// Mock data for development
const MOCK_LEADS: Lead[] = [
    {
        id: 'L-4921',
        lead_name: 'Matt Alexius Merano',
        email: 'mattmerano12@gmail.com',
        phone: '+63 1213212312',
        vehicle_id: null,
        vehicle_name: 'Mitsubishi Montero',
        vehicle_image: '/vehicles/montero.jpg',
        pickup_location: 'Lapu-Lapu City',
        dropoff_location: 'Lapu-Lapu City',
        pickup_date: '2026-02-10',
        return_date: '2026-02-12',
        estimated_price: 8600,
        drive_option: 'self-drive',
        last_step: 'payment',
        drop_off_timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        automation_status: 'not_sent',
        automation_sent_at: null,
        automation_opened_at: null,
        automation_clicked_at: null,
        status: 'pending',
        admin_notes: null,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'L-4920',
        lead_name: 'John Smith',
        email: 'john.smith@corp.com',
        phone: '+63 9171234567',
        vehicle_id: null,
        vehicle_name: 'Toyota Fortuner',
        vehicle_image: '/vehicles/fortuner.jpg',
        pickup_location: 'Cebu City',
        dropoff_location: 'Cebu City',
        pickup_date: '2026-02-15',
        return_date: '2026-02-17',
        estimated_price: 9200,
        drive_option: 'with-driver',
        last_step: 'renter_info',
        drop_off_timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        automation_status: 'sent',
        automation_sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        automation_opened_at: null,
        automation_clicked_at: null,
        status: 'pending',
        admin_notes: null,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'L-4919',
        lead_name: 'Ana Lopez',
        email: 'ana.lopez@yahoo.com',
        phone: '+63 9998765432',
        vehicle_id: null,
        vehicle_name: 'Honda Civic',
        vehicle_image: '/vehicles/civic.jpg',
        pickup_location: 'Mandaue City',
        dropoff_location: 'Mandaue City',
        pickup_date: '2026-02-08',
        return_date: '2026-02-09',
        estimated_price: 4650,
        drive_option: 'self-drive',
        last_step: 'date_selection',
        drop_off_timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        automation_status: 'not_sent',
        automation_sent_at: null,
        automation_opened_at: null,
        automation_clicked_at: null,
        status: 'expired',
        admin_notes: null,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'L-4918',
        lead_name: 'Robert Chen',
        email: 'rob.chen@gmail.com',
        phone: '+63 9221239876',
        vehicle_id: null,
        vehicle_name: 'Ford Everest',
        vehicle_image: '/vehicles/everest.jpg',
        pickup_location: 'Talisay City',
        dropoff_location: 'AR Car Rentals Office',
        pickup_date: '2026-02-20',
        return_date: '2026-02-22',
        estimated_price: 10800,
        drive_option: 'self-drive',
        last_step: 'payment',
        drop_off_timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        automation_status: 'clicked',
        automation_sent_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
        automation_opened_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
        automation_clicked_at: new Date(Date.now() - 45 * 60 * 60 * 1000).toISOString(),
        status: 'recovered',
        admin_notes: 'Successfully converted after discount offer.',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Helper functions
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
};

const getLastStepLabel = (step: string): string => {
    switch (step) {
        case 'date_selection': return 'Date Selection';
        case 'renter_info': return 'Renter Info';
        case 'payment': return 'Payment';
        default: return step;
    }
};

const getStatusColor = (status: string): { bg: string; text: string; border: string } => {
    switch (status) {
        case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
        case 'recovered': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
        case 'expired': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
        default: return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200' };
    }
};

const getAutomationBadge = (status: string): { label: string; color: string } => {
    switch (status) {
        case 'not_sent': return { label: 'Not Sent', color: 'text-neutral-500' };
        case 'sent': return { label: 'Email Sent', color: 'text-blue-600' };
        case 'opened': return { label: 'Email Opened', color: 'text-purple-600' };
        case 'clicked': return { label: 'Link Clicked', color: 'text-green-600' };
        default: return { label: status, color: 'text-neutral-500' };
    }
};

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string): string => {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
        'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
        'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
        'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

/**
 * Admin Leads Page - CRM-style Leads Management Dashboard
 */
export const AdminLeadsPage: FC = () => {
    // State
    const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState('7');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    const itemsPerPage = 10;

    // Fetch leads from Supabase (with fallback to mock data)
    useEffect(() => {
        const fetchLeads = async () => {
            setIsLoading(true);
            try {
                // Use the leads_with_vehicle view for vehicle info
                // Only show PENDING and ABANDONED leads (exclude RECOVERED)
                const { data, error } = await supabase
                    .from('leads_with_vehicle')
                    .select('*')
                    .neq('status', 'recovered')  // Exclude recovered leads
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn('Using mock data:', error.message);
                    setLeads(MOCK_LEADS);
                } else if (data && data.length > 0) {
                    // Transform data to match Lead interface
                    const transformedLeads: Lead[] = data.map((lead: any) => ({
                        id: lead.id,
                        lead_name: lead.lead_name,
                        email: lead.email,
                        phone: lead.phone,
                        vehicle_id: lead.vehicle_id,
                        vehicle_name: lead.vehicle_name || null,
                        vehicle_image: lead.vehicle_image || null,
                        pickup_location: lead.pickup_location,
                        dropoff_location: lead.dropoff_location,
                        pickup_date: lead.pickup_date,
                        return_date: lead.return_date,
                        estimated_price: lead.estimated_price,
                        drive_option: lead.drive_option,
                        last_step: lead.last_step,
                        drop_off_timestamp: lead.drop_off_timestamp,
                        automation_status: lead.automation_status,
                        automation_sent_at: lead.automation_sent_at,
                        automation_opened_at: lead.automation_opened_at,
                        automation_clicked_at: lead.automation_clicked_at,
                        status: lead.status,
                        admin_notes: lead.admin_notes,
                        created_at: lead.created_at,
                        updated_at: lead.updated_at
                    }));
                    setLeads(transformedLeads);
                } else {
                    setLeads(MOCK_LEADS);
                }
            } catch {
                console.warn('Falling back to mock data');
                setLeads(MOCK_LEADS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeads();
    }, []);

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = searchQuery === '' ||
            lead.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.vehicle_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Analytics calculations
    const totalAbandoned = leads.length;
    const recoveredCount = leads.filter(l => l.status === 'recovered').length;
    const conversionRate = totalAbandoned > 0 ? ((recoveredCount / totalAbandoned) * 100).toFixed(1) : '0';

    // Open lead details panel
    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
        setAdminNotes(lead.admin_notes || '');
        setIsPanelOpen(true);
    };

    // Close panel
    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedLead(null);
    };

    // Handle WhatsApp click
    const handleWhatsApp = (phone: string | null, e: React.MouseEvent) => {
        e.stopPropagation();
        if (phone) {
            const cleanPhone = phone.replace(/[^0-9+]/g, '');
            window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
        }
    };

    // Handle Email click
    const handleEmail = (email: string | null, e: React.MouseEvent) => {
        e.stopPropagation();
        if (email) {
            window.location.href = `mailto:${email}?subject=Complete Your AR Car Rentals Booking`;
        }
    };

    // Save admin notes
    const saveAdminNotes = async () => {
        if (!selectedLead) return;

        try {
            await supabase
                .from('abandoned_leads')
                .update({ admin_notes: adminNotes })
                .eq('id', selectedLead.id);

            // Update local state
            setLeads(prev => prev.map(l =>
                l.id === selectedLead.id ? { ...l, admin_notes: adminNotes } : l
            ));
            setSelectedLead(prev => prev ? { ...prev, admin_notes: adminNotes } : null);
        } catch (err) {
            console.error('Failed to save notes:', err);
        }
    };

    // Mark as recovered
    const markAsRecovered = async () => {
        if (!selectedLead) return;

        try {
            await supabase
                .from('abandoned_leads')
                .update({ status: 'recovered' })
                .eq('id', selectedLead.id);

            setLeads(prev => prev.map(l =>
                l.id === selectedLead.id ? { ...l, status: 'recovered' as const } : l
            ));
            setSelectedLead(prev => prev ? { ...prev, status: 'recovered' as const } : null);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    return (
        <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">Leads Management</h1>
                    <p className="text-sm sm:text-base text-neutral-500 mt-1">Track and recover abandoned bookings.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
                {/* Total Abandoned */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 min-w-[160px] sm:min-w-0 sm:flex-1 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-neutral-500">Total Abandoned</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900">{totalAbandoned}</p>
                    <p className="text-xs text-neutral-400 mt-1">last 7 days</p>
                </div>

                {/* Recovered */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 min-w-[160px] sm:min-w-0 sm:flex-1 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-neutral-500">Recovered</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900">{recoveredCount}</p>
                    <p className="text-xs text-neutral-400 mt-1">converted leads</p>
                </div>

                {/* Pending */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 min-w-[160px] sm:min-w-0 sm:flex-1 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-neutral-500">Pending</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900">{leads.filter(l => l.status === 'pending').length}</p>
                    <p className="text-xs text-neutral-400 mt-1">awaiting action</p>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 min-w-[160px] sm:min-w-0 sm:flex-1 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Target className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-neutral-500">Conversion Rate</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-[#E22B2B]">{conversionRate}%</p>
                    <p className="text-xs text-neutral-400 mt-1">success rate</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search leads, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B]"
                    />
                </div>
                <div className="flex items-center gap-3">
                    {/* Date Range Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDateDropdown(!showDateDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                            Last {dateRange} Days
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {showDateDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                                {['7', '14', '30', '90'].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => { setDateRange(days); setShowDateDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${dateRange === days ? 'text-[#E22B2B] font-medium' : 'text-neutral-700'}`}
                                    >
                                        Last {days} Days
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                            {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {showStatusDropdown && (
                            <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                                {['all', 'pending', 'recovered', 'expired'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${statusFilter === status ? 'text-[#E22B2B] font-medium' : 'text-neutral-700'}`}
                                    >
                                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Leads Table - Desktop */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hidden lg:block">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    <div className="col-span-3">Lead Name</div>
                    <div className="col-span-2">Contact Info</div>
                    <div className="col-span-2">Vehicle Interest</div>
                    <div className="col-span-2">Abandonment Details</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Quick Actions</div>
                </div>

                {/* Table Body */}
                {isLoading ? (
                    <div className="p-12 text-center text-neutral-500">Loading leads...</div>
                ) : paginatedLeads.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">No leads found</div>
                ) : (
                    paginatedLeads.map((lead) => {
                        const statusColors = getStatusColor(lead.status);
                        const automationBadge = getAutomationBadge(lead.automation_status);

                        return (
                            <div
                                key={lead.id}
                                onClick={() => handleLeadClick(lead)}
                                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors items-center"
                            >
                                {/* Lead Name */}
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(lead.lead_name)} flex items-center justify-center text-white font-semibold text-sm`}>
                                        {getInitials(lead.lead_name)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900">{lead.lead_name}</p>
                                        <p className="text-xs text-neutral-400">ID: #{lead.id}</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="col-span-2 space-y-1">
                                    {lead.email && (
                                        <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                            <span className="truncate max-w-[140px]">{lead.email}</span>
                                        </div>
                                    )}
                                    {lead.phone && (
                                        <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                            <span>{lead.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Vehicle Interest */}
                                <div className="col-span-2 flex items-center gap-3">
                                    <div className="w-12 h-8 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                                        {lead.vehicle_image ? (
                                            <img src={lead.vehicle_image} alt={lead.vehicle_name || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Car className="w-5 h-5 text-neutral-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 text-sm">{lead.vehicle_name || 'Unknown'}</p>
                                        <p className="text-xs text-neutral-400 capitalize">{lead.drive_option?.replace('-', ' ') || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Abandonment Details */}
                                <div className="col-span-2">
                                    <p className="text-sm">
                                        <span className="text-neutral-500">Dropped at: </span>
                                        <span className="font-medium text-red-600">{getLastStepLabel(lead.last_step)}</span>
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-0.5">{formatTimeAgo(lead.drop_off_timestamp)}</p>
                                    {lead.automation_status !== 'not_sent' && (
                                        <p className={`text-xs font-medium mt-1 ${automationBadge.color}`}>{automationBadge.label}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="col-span-1">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                    </span>
                                </div>

                                {/* Quick Actions */}
                                <div className="col-span-2 flex items-center justify-end gap-2">
                                    {lead.status === 'recovered' ? (
                                        <span className="text-xs text-neutral-400 italic">No actions needed</span>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => handleWhatsApp(lead.phone, e)}
                                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                title="WhatsApp"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleEmail(lead.email, e)}
                                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                title="Email"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-200 bg-white">
                    <p className="text-sm text-neutral-500">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> of <span className="font-medium">{filteredLeads.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-sm font-medium rounded-lg ${currentPage === page ? 'bg-[#E22B2B] text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                        {totalPages > 3 && <span className="text-neutral-400">...</span>}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads Cards - Mobile */}
            <div className="lg:hidden space-y-3">
                {isLoading ? (
                    <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-500">Loading leads...</div>
                ) : paginatedLeads.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-500">No leads found</div>
                ) : (
                    paginatedLeads.map((lead) => {
                        const statusColors = getStatusColor(lead.status);

                        return (
                            <div
                                key={lead.id}
                                onClick={() => handleLeadClick(lead)}
                                className="bg-white rounded-xl border border-neutral-200 p-4 cursor-pointer active:bg-neutral-50"
                            >
                                {/* Header: Avatar + Name + Status */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(lead.lead_name)} flex items-center justify-center text-white font-semibold text-sm`}>
                                            {getInitials(lead.lead_name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">{lead.lead_name}</p>
                                            <p className="text-xs text-neutral-400">#{lead.id}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                    </span>
                                </div>

                                {/* Vehicle */}
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-100">
                                    <div className="w-10 h-7 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                                        {lead.vehicle_image ? (
                                            <img src={lead.vehicle_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Car className="w-4 h-4 text-neutral-400" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-700">{lead.vehicle_name || 'Unknown Vehicle'}</span>
                                </div>

                                {/* Contact + Drop info */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-neutral-400 mb-1">Contact</p>
                                        {lead.email && <p className="text-neutral-600 truncate text-xs">{lead.email}</p>}
                                        {lead.phone && <p className="text-neutral-600 text-xs">{lead.phone}</p>}
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 mb-1">Dropped at</p>
                                        <p className="text-red-600 font-medium text-xs">{getLastStepLabel(lead.last_step)}</p>
                                        <p className="text-neutral-400 text-xs">{formatTimeAgo(lead.drop_off_timestamp)}</p>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                {lead.status !== 'recovered' && (
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                                        <button
                                            onClick={(e) => handleWhatsApp(lead.phone, e)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            WhatsApp
                                        </button>
                                        <button
                                            onClick={(e) => handleEmail(lead.email, e)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {/* Mobile Pagination */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center bg-[#E22B2B] text-white text-sm font-medium rounded-lg">
                            {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-out Panel */}
            {isPanelOpen && selectedLead && (
                <>
                    {/* Overlay with blur - z-[60] to cover sidebar (z-50) */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        onClick={handleClosePanel}
                    />

                    {/* Panel - responsive width (full on mobile, 50% on tablet, 25% on desktop) */}
                    <div className="fixed top-0 right-0 h-full w-[90vw] sm:w-[50vw] lg:w-[25vw] bg-white shadow-2xl z-[70] overflow-y-auto">
                        {/* Panel Header */}
                        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-neutral-900">Lead Details</h2>
                            <button
                                onClick={handleClosePanel}
                                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Lead Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Lead Information
                                </h3>
                                <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full ${getAvatarColor(selectedLead.lead_name)} flex items-center justify-center text-white font-bold`}>
                                            {getInitials(selectedLead.lead_name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">{selectedLead.lead_name}</p>
                                            <p className="text-sm text-neutral-400">ID: #{selectedLead.id}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-neutral-200 space-y-2">
                                        {selectedLead.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-neutral-400" />
                                                <span className="text-neutral-700">{selectedLead.email}</span>
                                            </div>
                                        )}
                                        {selectedLead.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-neutral-400" />
                                                <span className="text-neutral-700">{selectedLead.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Booking Summary */}
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Car className="w-4 h-4" />
                                    Booking Summary
                                </h3>
                                <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-12 bg-neutral-200 rounded overflow-hidden">
                                            {selectedLead.vehicle_image ? (
                                                <img src={selectedLead.vehicle_image} alt={selectedLead.vehicle_name || ''} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Car className="w-6 h-6 text-neutral-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">{selectedLead.vehicle_name || 'Unknown Vehicle'}</p>
                                            <p className="text-sm text-neutral-500 capitalize">{selectedLead.drive_option?.replace('-', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-neutral-200 grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-neutral-400">Pickup</p>
                                            <p className="text-sm font-medium text-neutral-700">{selectedLead.pickup_date || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-400">Return</p>
                                            <p className="text-sm font-medium text-neutral-700">{selectedLead.return_date || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {selectedLead.estimated_price && (
                                        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                                            <span className="text-sm text-neutral-500">Estimated Price</span>
                                            <span className="text-lg font-bold text-[#E22B2B]">₱{selectedLead.estimated_price.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Journey Timeline */}
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Customer Journey
                                </h3>
                                <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
                                    {/* Booking Started */}
                                    <div className="flex gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-neutral-700">Booking Started</p>
                                            <p className="text-xs text-neutral-400">{new Date(selectedLead.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Drop-off */}
                                    <div className="flex gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-neutral-700">Dropped at {getLastStepLabel(selectedLead.last_step)}</p>
                                            <p className="text-xs text-neutral-400">{new Date(selectedLead.drop_off_timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Automation Events */}
                                    {selectedLead.automation_sent_at && (
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-neutral-700">Follow-up Email Sent</p>
                                                <p className="text-xs text-neutral-400">{new Date(selectedLead.automation_sent_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedLead.automation_opened_at && (
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-neutral-700">Email Opened</p>
                                                <p className="text-xs text-neutral-400">{new Date(selectedLead.automation_opened_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedLead.automation_clicked_at && (
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-neutral-700">Link Clicked</p>
                                                <p className="text-xs text-neutral-400">{new Date(selectedLead.automation_clicked_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Admin Actions
                                </h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleWhatsApp(selectedLead.phone, { stopPropagation: () => { } } as React.MouseEvent)}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call Lead
                                        </button>
                                        <button
                                            onClick={() => handleEmail(selectedLead.email, { stopPropagation: () => { } } as React.MouseEvent)}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                            Send Discount
                                        </button>
                                    </div>
                                    {selectedLead.status !== 'recovered' && (
                                        <button
                                            onClick={markAsRecovered}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E22B2B] text-white rounded-lg font-medium hover:bg-[#c92525] transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Mark as Booked
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Internal Notes */}
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Internal Notes</h3>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    onBlur={saveAdminNotes}
                                    placeholder="Add notes about this lead..."
                                    className="w-full p-3 border border-neutral-200 rounded-xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B]"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminLeadsPage;
