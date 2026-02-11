import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Shield, Clock } from 'lucide-react';

export const TrackBookingLookupPage = () => {
    const navigate = useNavigate();
    const [reference, setReference] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = reference.trim();
        if (!trimmed) {
            setError('Please enter your booking reference number');
            return;
        }
        setError('');
        navigate(`/track/${trimmed}`);
    };

    return (
        <div className="min-h-[calc(100vh-120px)] bg-neutral-50">
            <div className="w-full max-w-3xl mx-auto px-4 md:px-8 py-16">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-[#E22B2B]/10 border border-[#E22B2B]/20 rounded-full px-4 py-1.5 mb-5">
                        <Search className="w-3.5 h-3.5 text-[#E22B2B]" />
                        <span className="text-[#E22B2B] text-xs font-semibold uppercase tracking-wider">Booking Tracker</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">Track Your Booking</h1>
                    <p className="text-neutral-500 max-w-md mx-auto">
                        Enter your booking reference number to view the status of your reservation and rental details.
                    </p>
                </div>

                {/* Search Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-10 shadow-sm mb-8">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="reference" className="block text-sm font-semibold text-neutral-700 mb-2">
                            Booking Reference Number
                        </label>
                        <p className="text-xs text-neutral-400 mb-4">
                            You can find this in your booking confirmation email (e.g., AR-2026-CBVS)
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                                <input
                                    id="reference"
                                    type="text"
                                    value={reference}
                                    onChange={(e) => { setReference(e.target.value.toUpperCase()); setError(''); }}
                                    placeholder="e.g. AR-2026-CBVS"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 font-medium text-lg placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] transition-all"
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 bg-[#E22B2B] hover:bg-[#c92020] text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-red-200/40 hover:shadow-xl hover:shadow-red-200/60 flex-shrink-0"
                            >
                                Track Booking
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-3 flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {error}
                            </p>
                        )}
                    </form>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MapPin className="w-5 h-5 text-[#E22B2B]" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-800 mb-1">Real-Time Status</h3>
                        <p className="text-xs text-neutral-400">Track your booking from reservation to pickup</p>
                    </div>
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-5 h-5 text-[#E22B2B]" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-800 mb-1">Secure & Private</h3>
                        <p className="text-xs text-neutral-400">Your booking details are protected and encrypted</p>
                    </div>
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-5 h-5 text-[#E22B2B]" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-800 mb-1">Instant Updates</h3>
                        <p className="text-xs text-neutral-400">Get the latest status of your vehicle reservation</p>
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center mt-8">
                    <p className="text-sm text-neutral-400">
                        Can't find your reference number? Check your email or{' '}
                        <a href="mailto:info@arcarrentalscebu.com" className="text-[#E22B2B] hover:underline font-medium">contact support</a>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default TrackBookingLookupPage;
