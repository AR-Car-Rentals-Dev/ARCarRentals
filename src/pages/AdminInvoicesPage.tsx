import React, { useState, useEffect } from 'react';
import {
    Search,
    Download,
    Plus,
    TrendingUp,
    FileText,
    RefreshCw,
    ChevronDown,
    Mail,
    Loader2
} from 'lucide-react';
import { supabase } from '@services/supabase';

// Types
interface Invoice {
    id: string;
    paymentId: string;
    customer: {
        name: string;
        initials: string;
        color: string;
    };
    bookingRef: string;
    date: string;
    amount: number;
    method: string;
    methodType: string;
    status: string;
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-teal-500', 'bg-rose-500'];

const getInitials = (name: string): string => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getAvatarColor = (index: number): string => {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
};

const AdminInvoicesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingInvoices: 0,
        refundsIssued: 0,
        revenueChange: 0
    });
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchInvoices = async () => {
            setIsLoading(true);
            try {
                // Fetch payments with booking and customer data
                const { data: paymentsData, error } = await supabase
                    .from('payments')
                    .select(`
                        id,
                        amount,
                        payment_method,
                        payment_status,
                        created_at,
                        bookings (
                            booking_reference,
                            customers (
                                full_name
                            )
                        )
                    `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching invoices:', error);
                    return;
                }

                // Transform data to Invoice format
                const transformedInvoices: Invoice[] = (paymentsData || []).map((payment: any, index: number) => {
                    const customerName = payment.bookings?.customers?.full_name || 'Unknown Customer';
                    return {
                        id: `#PAY-${payment.id.substring(0, 4).toUpperCase()}`,
                        paymentId: payment.id,
                        customer: {
                            name: customerName,
                            initials: getInitials(customerName),
                            color: getAvatarColor(index)
                        },
                        bookingRef: payment.bookings?.booking_reference || 'N/A',
                        date: new Date(payment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }),
                        amount: payment.amount || 0,
                        method: formatPaymentMethod(payment.payment_method),
                        methodType: payment.payment_method?.toLowerCase() || 'card',
                        status: payment.payment_status || 'pending'
                    };
                });

                setInvoices(transformedInvoices);

                // Calculate stats
                const totalRevenue = transformedInvoices
                    .filter(inv => inv.status === 'paid' || inv.status === 'completed')
                    .reduce((sum, inv) => sum + inv.amount, 0);

                const pendingCount = transformedInvoices.filter(inv => inv.status === 'pending').length;

                const refundsTotal = transformedInvoices
                    .filter(inv => inv.status === 'refunded')
                    .reduce((sum, inv) => sum + inv.amount, 0);

                setStats({
                    totalRevenue,
                    pendingInvoices: pendingCount,
                    refundsIssued: refundsTotal,
                    revenueChange: 12.5 // Could calculate from historical data
                });

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const formatPaymentMethod = (method: string | null): string => {
        if (!method) return 'Unknown';
        switch (method.toLowerCase()) {
            case 'gcash':
                return 'GCash';
            case 'bank_transfer':
                return 'Bank Transfer';
            case 'cash':
                return 'Cash';
            case 'card':
            case 'credit_card':
                return 'Credit Card';
            default:
                return method;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'refunded':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'failed':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-neutral-100 text-neutral-700 border-neutral-200';
        }
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">Invoices Management</h1>
                    <p className="text-sm sm:text-base text-neutral-500 mt-1">Review and manage car rental payments and invoices.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">Export</span>
                    </button>
                    <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#E22B2B] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#c71f1f]">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create Invoice</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
                {/* Total Revenue */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 min-w-[160px] sm:min-w-0 sm:flex-1 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                            +{stats.revenueChange}%
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-3 sm:mt-4">Total Revenue</p>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900 mt-1">
                        ₱{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* Pending Invoices */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 min-w-[160px] sm:min-w-0 sm:flex-1 flex-shrink-0">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-3 sm:mt-4">Pending Invoices</p>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900 mt-1">{stats.pendingInvoices}</p>
                </div>

                {/* Refunds Issued */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 min-w-[160px] sm:min-w-0 sm:flex-1 flex-shrink-0">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                        <RefreshCw className="w-4 sm:w-5 h-4 sm:h-5 text-rose-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-3 sm:mt-4">Refunds Issued</p>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900 mt-1">
                        ₱{stats.refundsIssued.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search invoices, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B]"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        Payment Method
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        Date Range
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Invoices Table - Desktop */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hidden lg:block">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    <div className="col-span-2">Invoice ID</div>
                    <div className="col-span-2">Customer</div>
                    <div className="col-span-2">Booking Ref</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                {paginatedInvoices.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">No invoices found</div>
                ) : (
                    paginatedInvoices.map((invoice) => (
                        <div
                            key={invoice.paymentId}
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors items-center"
                        >
                            {/* Invoice ID */}
                            <div className="col-span-2 font-medium text-neutral-900">{invoice.id}</div>

                            {/* Customer */}
                            <div className="col-span-2 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${invoice.customer.color} flex items-center justify-center text-white font-semibold text-xs`}>
                                    {invoice.customer.initials}
                                </div>
                                <span className="text-neutral-700">{invoice.customer.name}</span>
                            </div>

                            {/* Booking Ref */}
                            <div className="col-span-2 text-neutral-500">{invoice.bookingRef}</div>

                            {/* Date */}
                            <div className="col-span-1 text-neutral-500 text-sm">{invoice.date}</div>

                            {/* Amount */}
                            <div className="col-span-1 font-semibold text-neutral-900">
                                ₱{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>

                            {/* Method */}
                            <div className="col-span-2 text-neutral-600 text-sm">{invoice.method}</div>

                            {/* Status */}
                            <div className="col-span-1">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${getStatusStyles(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end gap-2">
                                <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Download">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Email">
                                    <Mail className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {/* Pagination */}
                {filteredInvoices.length > 0 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-200 bg-white">
                        <p className="text-sm text-neutral-500">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> of <span className="font-medium">{filteredInvoices.length}</span> invoices
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
                )}
            </div>

            {/* Invoices Cards - Mobile */}
            <div className="lg:hidden space-y-3">
                {paginatedInvoices.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-500">No invoices found</div>
                ) : (
                    paginatedInvoices.map((invoice) => (
                        <div
                            key={invoice.paymentId}
                            className="bg-white rounded-xl border border-neutral-200 p-4"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${invoice.customer.color} flex items-center justify-center text-white font-semibold text-sm`}>
                                        {invoice.customer.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-900">{invoice.customer.name}</p>
                                        <p className="text-xs text-neutral-400">{invoice.id}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${getStatusStyles(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3 pb-3 border-b border-neutral-100">
                                <div>
                                    <p className="text-xs text-neutral-400 mb-1">Booking Ref</p>
                                    <p className="text-neutral-700">{invoice.bookingRef}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 mb-1">Date</p>
                                    <p className="text-neutral-700">{invoice.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 mb-1">Amount</p>
                                    <p className="font-semibold text-neutral-900">₱{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 mb-1">Method</p>
                                    <p className="text-neutral-700">{invoice.method}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {/* Mobile Pagination */}
                {filteredInvoices.length > 0 && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between">
                        <p className="text-xs text-neutral-500">
                            {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length}
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
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInvoicesPage;
