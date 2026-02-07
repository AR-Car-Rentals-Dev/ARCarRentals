import { type FC, useState, useEffect } from 'react';
import { ArrowRight, Calendar, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { config } from '@utils/config';

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

    // Quick booking form state
    const [bookingForm, setBookingForm] = useState({
        carType: '',
        pickupLocation: '',
        returnLocation: '',
        rentalDate: '',
        returnDate: '',
    });

    const handleBookingChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setBookingForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBookNow = () => {
        // Navigate to browse vehicles with search params
        const searchParams = new URLSearchParams();
        if (bookingForm.carType) searchParams.set('type', bookingForm.carType);
        if (bookingForm.pickupLocation) searchParams.set('location', bookingForm.pickupLocation);
        if (bookingForm.rentalDate) searchParams.set('pickupDate', bookingForm.rentalDate);
        if (bookingForm.returnDate) searchParams.set('returnDate', bookingForm.returnDate);

        navigate(`/browsevehicles?${searchParams.toString()}`);
    };

    // Car types for dropdown
    const carTypes = [
        { value: 'sedan', label: 'Sedan' },
        { value: 'suv', label: 'SUV' },
        { value: 'hatchback', label: 'Hatchback' },
        { value: 'mpv', label: 'MPV / Van' },
        { value: 'pickup', label: 'Pickup' },
    ];

    // Popular locations
    const locations = [
        'Mactan-Cebu International Airport',
        'SM Seaside City Cebu',
        'Ayala Center Cebu',
        'SM City Cebu',
        'Cebu IT Park',
        'Mandaue City',
        'Lapu-Lapu City',
    ];

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="bg-white">
            {/* Header - Centered (same as About Us) */}
            <div className="pt-12 pb-6 text-center">
                <h1 className="text-4xl font-bold text-neutral-900 mb-3">CONTACT US</h1>
                <p className="text-sm">
                    <span className="text-neutral-500">Home</span>
                    <span className="text-neutral-400 mx-2">/</span>
                    <span className="text-neutral-900">Contact Us</span>
                </p>
            </div>

            {/* Section 1 - Quick Booking: Form Left (30%) + Image Carousel Right (70%) */}
            <section className="pt-8 pb-12 bg-white">
                <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-8 items-stretch">
                        {/* Left Column - Dark Booking Form Card (30%) */}
                        <div className="lg:col-span-3 bg-neutral-900 rounded-2xl p-6 text-white min-h-[480px] flex flex-col">
                            <h2 className="text-xl font-bold mb-5">Book your car</h2>

                            <div className="space-y-3 flex-1">
                                {/* Car Type */}
                                <select
                                    name="carType"
                                    value={bookingForm.carType}
                                    onChange={handleBookingChange}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E22B2B] transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                                >
                                    <option value="" className="bg-neutral-800">Car type</option>
                                    {carTypes.map(type => (
                                        <option key={type.value} value={type.value} className="bg-neutral-800">{type.label}</option>
                                    ))}
                                </select>

                                {/* Place of Rental */}
                                <select
                                    name="pickupLocation"
                                    value={bookingForm.pickupLocation}
                                    onChange={handleBookingChange}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E22B2B] transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                                >
                                    <option value="" className="bg-neutral-800">Place of rental</option>
                                    {locations.map(loc => (
                                        <option key={loc} value={loc} className="bg-neutral-800">{loc}</option>
                                    ))}
                                </select>

                                {/* Place of Return */}
                                <select
                                    name="returnLocation"
                                    value={bookingForm.returnLocation}
                                    onChange={handleBookingChange}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E22B2B] transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                                >
                                    <option value="" className="bg-neutral-800">Place of return</option>
                                    {locations.map(loc => (
                                        <option key={loc} value={loc} className="bg-neutral-800">{loc}</option>
                                    ))}
                                </select>

                                {/* Rental Date */}
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="rentalDate"
                                        value={bookingForm.rentalDate}
                                        onChange={handleBookingChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E22B2B] transition-all [color-scheme:dark]"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                                </div>

                                {/* Return Date */}
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="returnDate"
                                        value={bookingForm.returnDate}
                                        onChange={handleBookingChange}
                                        min={bookingForm.rentalDate || new Date().toISOString().split('T')[0]}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E22B2B] transition-all [color-scheme:dark]"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Book Now Button */}
                            <button
                                onClick={handleBookNow}
                                className="w-full mt-5 bg-[#E22B2B] hover:bg-[#c82424] text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                Book now
                            </button>
                        </div>

                        {/* Right Column - Image Carousel (70%) */}
                        <div className="lg:col-span-7 rounded-2xl overflow-hidden min-h-[480px] relative">
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

            {/* Section 2 - Google Maps */}
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
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125429.46452522576!2d123.78856823266098!3d10.315699084428868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a999258dfc7bd5%3A0x7c7e9be8c08f2ad2!2sCebu%20City%2C%20Cebu%2C%20Philippines!5e0!3m2!1sen!2sus!4v1707357600000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="AR Car Rentals Location - Cebu City"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Section 3 - CTA Section */}
            <section className="py-24 px-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E22B2B]/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#E22B2B]/10 rounded-full blur-[100px]"></div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="max-w-[1200px] mx-auto relative z-10">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-[#E22B2B]/20 border border-[#E22B2B]/30 rounded-full px-4 py-2 mb-8">
                            <span className="w-2 h-2 bg-[#E22B2B] rounded-full animate-pulse"></span>
                            <span className="text-[#E22B2B] text-sm font-semibold">Ready When You Are</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                            Ready to Hit the Road?
                        </h2>
                        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                            Browse our premium fleet and find the perfect vehicle for your Cebu adventure. Easy booking, transparent pricing, exceptional service.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/browsevehicles')}
                                className="inline-flex items-center gap-3 bg-[#E22B2B] hover:bg-[#c82424] text-white px-10 py-5 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105"
                            >
                                Browse Vehicles
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => navigate('/how-to-rent')}
                                className="inline-flex items-center gap-3 bg-transparent hover:bg-white/10 text-white border-2 border-neutral-600 hover:border-white/30 px-10 py-5 rounded-xl font-bold text-base transition-all duration-300"
                            >
                                Learn How It Works
                            </Button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-neutral-500 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-[#E22B2B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>No Hidden Fees</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-[#E22B2B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>24/7 Support</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-[#E22B2B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Fully Insured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUsPage;
