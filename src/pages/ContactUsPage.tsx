import { type FC, useState, useEffect } from 'react';
import { Search, Phone, Mail, MapPin, Clock, Car as CarIcon, Cog, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { config } from '@utils/config';
import type { CarCategory, TransmissionType } from '@/types';

// Cebu scenic images for carousel
const cebuImages = [
    {
        url: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
        caption: 'Crystal Clear Waters of Cebu',
        location: 'Sumilon Island'
    },
    {
        url: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80',
        caption: 'Pristine White Sand Beach',
        location: 'Bantayan Island'
    },
    {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        caption: 'Breathtaking Mountain Views',
        location: 'Osmeña Peak'
    },
    {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
        caption: 'Tropical Paradise',
        location: 'Moalboal'
    },
    {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        caption: 'Stunning Sunset Beach',
        location: 'Malapascua Island'
    }
];

/**
 * Contact Us Page - Quick Booking and Contact Information
 */
export const ContactUsPage: FC = () => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % cebuImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Quick booking form state - matching landing page
    const [carType, setCarType] = useState<CarCategory | ''>('');
    const [transmission, setTransmission] = useState<TransmissionType | ''>('');
    const [seats, setSeats] = useState<string>('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Build URL parameters from preference filters
        const params = new URLSearchParams();

        if (carType) {
            params.append('carType', carType);
        }

        if (transmission) {
            params.append('transmission', transmission);
        }

        if (seats) {
            params.append('seats', seats);
        }

        // Navigate to browse vehicles page with filter parameters
        navigate(`/browsevehicles?${params.toString()}`);
    };

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="bg-white">
            {/* Section 1 - Quick Booking: Form Left (30%) + Image Carousel Right (70%) */}
            <section className="pt-8 pb-12 bg-white">
                <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-8 items-stretch">
                        {/* Left Column - Light Booking Form Card (30%) - Matching Landing Page Style */}
                        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6 min-h-[400px] flex flex-col">
                            <h2 className="text-xl font-bold text-neutral-900 mb-5">Find Your Car</h2>

                            <form onSubmit={handleSearch} className="space-y-4 flex-1 flex flex-col">
                                {/* Car Type */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-2">
                                        CAR TYPE
                                    </label>
                                    <div className="relative">
                                        <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                                        <select
                                            value={carType}
                                            onChange={(e) => setCarType(e.target.value as CarCategory | '')}
                                            className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg appearance-none bg-white hover:border-[#E22B2B] focus:border-[#E22B2B] focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 transition-colors text-neutral-900"
                                        >
                                            <option value="">All Types</option>
                                            <option value="sedan">Sedan</option>
                                            <option value="suv">SUV</option>
                                            <option value="van">Van</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Transmission */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-2">
                                        TRANSMISSION
                                    </label>
                                    <div className="relative">
                                        <Cog className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                                        <select
                                            value={transmission}
                                            onChange={(e) => setTransmission(e.target.value as TransmissionType | '')}
                                            className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg appearance-none bg-white hover:border-[#E22B2B] focus:border-[#E22B2B] focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 transition-colors text-neutral-900"
                                        >
                                            <option value="">Any</option>
                                            <option value="automatic">Automatic</option>
                                            <option value="manual">Manual</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Number of Seats */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-2">
                                        NUMBER OF SEATS
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                                        <select
                                            value={seats}
                                            onChange={(e) => setSeats(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg appearance-none bg-white hover:border-[#E22B2B] focus:border-[#E22B2B] focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 transition-colors text-neutral-900"
                                        >
                                            <option value="">Any</option>
                                            <option value="2-5">2 - 5 Seats</option>
                                            <option value="6-8">6 - 8 Seats</option>
                                            <option value="9+">9+ Seats</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Search Button */}
                                <div className="mt-auto pt-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        leftIcon={<Search className="h-5 w-5" />}
                                    >
                                        Find Available Cars
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Right Column - Image Carousel (70%) */}
                        <div className="lg:col-span-7 rounded-2xl overflow-hidden min-h-[400px] relative">
                            {/* Images */}
                            {cebuImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.caption}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                                    {/* Caption */}
                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <p className="text-2xl font-bold mb-1">{image.caption}</p>
                                        <p className="text-sm text-white/80 flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {image.location}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Carousel Indicators */}
                            <div className="absolute bottom-6 right-6 flex gap-2">
                                {cebuImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Info Row - Below Section 1 */}
            <section className="py-12 bg-white">
                <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* Phone */}
                        <a
                            href={`tel:${config.contact.phone.replace(/\s/g, '')}`}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="w-12 h-12 bg-[#E22B2B] rounded-full flex items-center justify-center mb-3">
                                <Phone className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-1">Phone</h3>
                            <p className="text-[#E22B2B] text-sm group-hover:underline">{config.contact.phone}</p>
                        </a>

                        {/* Email */}
                        <a
                            href={`mailto:${config.contact.email}`}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="w-12 h-12 bg-[#E22B2B] rounded-full flex items-center justify-center mb-3">
                                <Mail className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-1">Email</h3>
                            <p className="text-[#E22B2B] text-sm group-hover:underline">{config.contact.email}</p>
                        </a>

                        {/* Location */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-[#E22B2B] rounded-full flex items-center justify-center mb-3">
                                <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-1">Location</h3>
                            <p className="text-neutral-600 text-sm">{config.contact.location}</p>
                        </div>

                        {/* Business Hours */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-[#E22B2B] rounded-full flex items-center justify-center mb-3">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-1">Business Hours</h3>
                            <p className="text-neutral-600 text-sm">{config.contact.businessHours}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pickup & Delivery Fees Section */}
            <section className="py-20 bg-neutral-100">
                <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Pickup & Delivery Fees</h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            We offer flexible delivery options to suit your schedule. Choose office pickup for free or get your car delivered to your location.
                        </p>
                    </div>

                    {/* Location Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Office Pickup - Most Popular */}
                        <div className="relative bg-white rounded-xl p-6 border-2 border-[#E22B2B] shadow-sm">
                            <div className="absolute -top-3 left-4">
                                <span className="bg-[#E22B2B] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">
                                    Most Popular
                                </span>
                            </div>
                            <div className="flex flex-col items-center text-center pt-2">
                                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-[#E22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900 mb-1">Office Pickup</h3>
                                <p className="text-neutral-500 text-xs mb-3">Visit our HQ in Lapu-Lapu</p>
                                <p className="text-[#E22B2B] text-xl font-bold">FREE</p>
                            </div>
                        </div>

                        {/* Lapu-Lapu Area */}
                        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900 mb-1">Lapu-Lapu City</h3>
                                <p className="text-neutral-500 text-xs mb-3">Resorts & Hotels</p>
                                <p className="text-neutral-900 text-xl font-bold">₱300 per way</p>
                            </div>
                        </div>

                        {/* Mandaue City */}
                        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900 mb-1">Mandaue City</h3>
                                <p className="text-neutral-500 text-xs mb-3">Business District</p>
                                <p className="text-neutral-900 text-xl font-bold">₱350 per way</p>
                            </div>
                        </div>

                        {/* Cebu City */}
                        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900 mb-1">Cebu City</h3>
                                <p className="text-neutral-500 text-xs mb-3">Pier / SM / Ayala</p>
                                <p className="text-neutral-900 text-xl font-bold">₱450 per way</p>
                            </div>
                        </div>

                        {/* Talisay City */}
                        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900 mb-1">Talisay City</h3>
                                <p className="text-neutral-500 text-xs mb-3">South Area</p>
                                <p className="text-neutral-900 text-xl font-bold">₱500 per way</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Self-Drive Requirements Section */}
            <section className="py-20 bg-white">
                <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Self-Drive Requirements</h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            Renting a car is simple. Just prepare these three things for a smooth handover process.
                        </p>
                    </div>

                    {/* Requirements Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Driver's License */}
                        <div className="bg-white rounded-xl p-8 border border-neutral-200 shadow-sm border-t-4 border-t-[#E22B2B]">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-[#E22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">Driver's License</h3>
                            <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                A valid professional or non-professional driver's license. Foreign licenses are accepted for up to 90 days from arrival.
                            </p>
                            <p className="text-[#E22B2B] text-sm font-medium flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Must be valid & original
                            </p>
                        </div>

                        {/* Valid ID */}
                        <div className="bg-white rounded-xl p-8 border border-neutral-200 shadow-sm border-t-4 border-t-[#E22B2B]">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-[#E22B2B]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571l-1.518-1.057A14.18 14.18 0 0010 11V8.414c1.262-.097 2.475-.35 3.615-.744l-.706-1.875A12.94 12.94 0 0110 6.28V4h2c0 .266-.017.528-.05.787l1.963.325C13.97 4.752 14 4.378 14 4V2h-4v4.28a15.05 15.05 0 01-4 0V2H2v2c0 .378.03.752.087 1.112L4.05 4.787A10.05 10.05 0 014 4h2v2.28a12.94 12.94 0 01-2.909.536l-.706 1.875A15.027 15.027 0 006 8.414V11c0 3.517 1.009 6.799 2.753 9.571L7.235 21.63a16.18 16.18 0 01-3.069-8.013L2.1 13.252a18.2 18.2 0 003.31 8.765L4 23h4l-.6-1.2a16.18 16.18 0 004.6-11.8v-.586A10.03 10.03 0 0012 11zm0-11c5.523 0 10 4.477 10 10a9.959 9.959 0 01-1.793 5.707l-1.424-1.424A7.963 7.963 0 0020 10c0-4.411-3.589-8-8-8S4 5.589 4 10c0 1.626.486 3.137 1.317 4.4L3.893 15.824A9.959 9.959 0 012 10C2 4.477 6.477 0 12 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">One (1) Valid ID</h3>
                            <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                Government-issued ID such as Passport, SSS, or Voter's ID for verification purposes. We will take a photo for our records.
                            </p>
                            <p className="text-[#E22B2B] text-sm font-medium flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Govt. issued
                            </p>
                        </div>

                        {/* Security Deposit */}
                        <div className="bg-white rounded-xl p-8 border border-neutral-200 shadow-sm border-t-4 border-t-[#E22B2B]">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-[#E22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">Security Deposit</h3>
                            <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                A refundable cash security deposit of ₱2,000. This is returned upon safe return of the car.
                            </p>
                            <p className="text-[#E22B2B] text-sm font-medium flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Fully Refundable
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Find Us - Google Maps Section */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-[1600px] mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Find Us</h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            Visit our office in Cebu City for in-person consultations and vehicle viewings.
                        </p>
                    </div>

                    {/* Map Container */}
                    <div className="rounded-3xl overflow-hidden h-[450px] lg:h-[500px]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1097.9893781772598!2d123.95057130262597!3d10.31254061844564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a9993cc853238d%3A0xf750bf6ab6483471!2sAR%20Car%20Rentals%20%26%20Tour%20Services%20Cebu!5e0!3m2!1sen!2sph!4v1770650571353!5m2!1sen!2sph"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="AR Car Rentals & Tour Services Cebu - Location"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Section 2 - Track Your Booking Banner */}
            <section className="py-20 bg-neutral-50">
                <div className="mx-auto w-full max-w-[1600px] bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden relative" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    {/* Background Image */}
                    <div className="absolute inset-0 bg-[url('/CCLEXOverlay.png')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

                    {/* Content */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-12 md:p-16 relative z-10 gap-10">
                        <div className="md:max-w-xl">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Track Your Booking</h2>
                            <p className="text-neutral-300 text-lg leading-relaxed">
                                Already booked a vehicle? Enter your booking reference number to check the status of your reservation and view your rental details.
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/track-booking')}
                                className="inline-flex items-center gap-3 bg-[#E22B2B] hover:bg-white hover:text-black text-white px-10 py-5 rounded-lg font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-xl"
                            >
                                Track Booking
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUsPage;
