import { type FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { generateWebPageSchema, generateBreadcrumbSchema, combineSchemas } from '@/utils/seoSchemas';

// Terms of service sections for navigation
const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'eligibility', title: 'Eligibility' },
    { id: 'services', title: 'Our Services' },
    { id: 'booking', title: 'Booking & Reservations' },
    { id: 'payment', title: 'Payment Terms' },
    { id: 'cancellation', title: 'Cancellation & Refunds' },
    { id: 'responsibilities', title: 'Your Responsibilities' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'contact', title: 'Contact Us' },
];

/**
 * Terms of Service Page - Minimalist 2-column layout with sticky navigation
 */
export const TermsOfServicePage: FC = () => {
    const [activeSection, setActiveSection] = useState('acceptance');
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    // SEO structured data
    const structuredData = combineSchemas([
        generateWebPageSchema({
            url: 'https://arcarrentalscebu.com/terms',
            name: 'Terms of Service - AR Car Rentals',
            description: 'Terms and conditions for using AR Car Rentals services in Cebu, Philippines. Learn about booking policies, payment terms, cancellation, and your responsibilities.',
        }),
        generateBreadcrumbSchema([
            { name: 'Home', url: 'https://arcarrentalscebu.com' },
            { name: 'Terms of Service', url: 'https://arcarrentalscebu.com/terms' },
        ]),
    ]);

    // Update active section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map(s => document.getElementById(s.id));
            const scrollPosition = window.scrollY + 150;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const section = sectionElements[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <>
            <SEO
                title="Terms of Service"
                description="Terms and conditions for using AR Car Rentals services in Cebu, Philippines. Learn about booking policies, payment terms, cancellation, refunds, and your responsibilities as a customer."
                keywords={[
                    'terms of service',
                    'car rental terms',
                    'rental agreement',
                    'booking policy',
                    'cancellation policy',
                    'rental conditions',
                    'Cebu car rental',
                    'customer agreement',
                ]}
                canonical="https://arcarrentalscebu.com/terms"
                structuredData={structuredData}
            />
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="bg-white min-h-screen">
            {/* Header Section - Minimalist */}
            <section className="border-b border-neutral-200 py-12">
                <div className="mx-auto w-full max-w-[1200px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    {/* Back Button */}
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm mb-4">
                        <Link to="/" className="text-neutral-500 hover:text-neutral-900 transition-colors">
                            Home
                        </Link>
                        <span className="text-neutral-300">/</span>
                        <span className="text-neutral-900">Terms of Service</span>
                    </nav>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">Terms of Service</h1>
                    <p className="text-neutral-500 mt-3">Last updated: February 10, 2026</p>
                </div>
            </section>

            {/* Main Content - Two Column Layout */}
            <section className="py-16">
                <div className="mx-auto w-full max-w-[1200px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                        {/* Left Column - Sticky Navigation */}
                        <aside className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24">
                                <nav className="space-y-1">
                                    {sections.map((section) => {
                                        const isActive = activeSection === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`w-full text-left py-2 px-3 rounded-md text-sm transition-all duration-200 ${isActive
                                                    ? 'text-neutral-900 font-medium bg-neutral-100'
                                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                {section.title}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>

                        {/* Right Column - Content */}
                        <main className="lg:col-span-3">
                            <div>

                                {/* Acceptance of Terms */}
                                <section id="acceptance" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Acceptance of Terms</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            Welcome to AR Car Rentals. By accessing or using our website, mobile applications, or rental services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                                        </p>
                                        <p>
                                            If you do not agree with any of these terms, you are prohibited from using or accessing our services. We reserve the right to modify these terms at any time, and your continued use of our services constitutes acceptance of any changes.
                                        </p>
                                    </div>
                                </section>

                                {/* Eligibility */}
                                <section id="eligibility" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Eligibility</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>To rent a vehicle from AR Car Rentals, you must meet the following requirements:</p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Be at least 21 years of age</li>
                                            <li>Possess a valid driver's license (local or international)</li>
                                            <li>Hold a valid government-issued identification</li>
                                            <li>Have a clean driving record with no major violations</li>
                                            <li>Provide accurate and truthful information during booking</li>
                                        </ul>
                                        <p>
                                            For self-drive rentals, an LTO-verified driver's license is required. Additional age restrictions may apply for certain vehicle categories.
                                        </p>
                                    </div>
                                </section>

                                {/* Our Services */}
                                <section id="services" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Our Services</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>AR Car Rentals provides the following services in Cebu, Philippines:</p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li><strong>Self-Drive Rentals:</strong> Vehicles available for customers to drive independently</li>
                                            <li><strong>With Driver Rentals:</strong> Vehicles with professional drivers for tours and transfers</li>
                                            <li><strong>Airport Transfers:</strong> Pickup and drop-off services at Mactan-Cebu International Airport</li>
                                            <li><strong>Tour Packages:</strong> Curated travel experiences around Cebu and nearby destinations</li>
                                            <li><strong>Long-term Rentals:</strong> Extended rental options for weekly or monthly use</li>
                                        </ul>
                                        <p>
                                            All vehicles are regularly maintained and inspected to ensure safety and reliability. Service availability may vary based on location and demand.
                                        </p>
                                    </div>
                                </section>

                                {/* Booking & Reservations */}
                                <section id="booking" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Booking & Reservations</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p><strong>Making a Reservation:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Reservations can be made through our website, phone, or messaging platforms</li>
                                            <li>All bookings require complete and accurate customer information</li>
                                            <li>A confirmation will be sent to your email upon successful booking</li>
                                            <li>Vehicle availability is subject to confirmation at the time of booking</li>
                                        </ul>
                                        <p><strong>Vehicle Pickup:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Present valid ID and driver's license at pickup</li>
                                            <li>Inspect the vehicle and note any existing damage before departure</li>
                                            <li>Sign the rental agreement acknowledging vehicle condition</li>
                                            <li>Late pickups may result in reduced rental time or forfeiture</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* Payment Terms */}
                                <section id="payment" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Payment Terms</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p><strong>Accepted Payment Methods:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Cash (Philippine Peso)</li>
                                            <li>Bank transfer / Online banking</li>
                                            <li>GCash and other e-wallets</li>
                                            <li>Major credit and debit cards</li>
                                        </ul>
                                        <p><strong>Payment Schedule:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>A deposit may be required to confirm your reservation</li>
                                            <li>Full payment is due at the time of vehicle pickup unless otherwise agreed</li>
                                            <li>Additional charges (fuel, tolls, damages) are payable upon vehicle return</li>
                                        </ul>
                                        <p>
                                            All prices are quoted in Philippine Peso (₱) and are inclusive of applicable taxes unless otherwise stated.
                                        </p>
                                    </div>
                                </section>

                                {/* Cancellation & Refunds */}
                                <section id="cancellation" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Cancellation & Refunds</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p><strong>Cancellation Policy:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li><strong>48+ hours before pickup:</strong> Full refund of deposit</li>
                                            <li><strong>24-48 hours before pickup:</strong> 50% refund of deposit</li>
                                            <li><strong>Less than 24 hours:</strong> No refund</li>
                                            <li><strong>No-shows:</strong> No refund and may affect future bookings</li>
                                        </ul>
                                        <p><strong>Refund Processing:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Refunds are processed within 5-7 business days</li>
                                            <li>Refunds will be returned to the original payment method</li>
                                            <li>Bank transfer refunds may take additional processing time</li>
                                        </ul>
                                        <p>
                                            We reserve the right to cancel bookings due to unforeseen circumstances, in which case a full refund will be provided.
                                        </p>
                                    </div>
                                </section>

                                {/* Your Responsibilities */}
                                <section id="responsibilities" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Your Responsibilities</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>As a renter, you agree to:</p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Use the vehicle only for lawful purposes</li>
                                            <li>Not sublease, sell, or transfer the vehicle</li>
                                            <li>Return the vehicle at the agreed time and location</li>
                                            <li>Return the vehicle with the same fuel level as at pickup</li>
                                            <li>Report any accidents, damage, or theft immediately</li>
                                            <li>Not smoke inside the vehicle</li>
                                            <li>Not drive under the influence of alcohol or drugs</li>
                                            <li>Obey all traffic laws and regulations</li>
                                            <li>Pay for any traffic violations incurred during the rental period</li>
                                        </ul>
                                        <p>
                                            You are responsible for all damages, loss, or theft of the vehicle during your rental period, subject to the terms of any insurance coverage.
                                        </p>
                                    </div>
                                </section>

                                {/* Limitation of Liability */}
                                <section id="liability" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Limitation of Liability</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            AR Car Rentals shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, including but not limited to:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Loss of personal belongings left in the vehicle</li>
                                            <li>Delays caused by traffic, weather, or mechanical issues</li>
                                            <li>Business losses or missed appointments</li>
                                            <li>Personal injury not caused by our negligence</li>
                                        </ul>
                                        <p>
                                            Our total liability for any claim arising from our services shall not exceed the total amount paid for the rental.
                                        </p>
                                    </div>
                                </section>

                                {/* Termination */}
                                <section id="termination" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Termination</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            We reserve the right to terminate or suspend your access to our services immediately, without prior notice, if:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>You breach any provision of these Terms of Service</li>
                                            <li>You provide false or misleading information</li>
                                            <li>You engage in fraudulent or illegal activities</li>
                                            <li>You damage our vehicles or property</li>
                                            <li>You endanger yourself, passengers, or others</li>
                                        </ul>
                                        <p>
                                            Upon termination, all provisions of these terms that should reasonably survive termination shall remain in effect.
                                        </p>
                                    </div>
                                </section>

                                {/* Governing Law */}
                                <section id="governing-law" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Governing Law</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions.
                                        </p>
                                        <p>
                                            Any disputes arising from these terms or your use of our services shall be resolved through the courts of Cebu City, Philippines.
                                        </p>
                                        <p>
                                            If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                                        </p>
                                    </div>
                                </section>

                                {/* Contact Us */}
                                <section id="contact" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Contact Us</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            If you have any questions about these Terms of Service, please contact us:
                                        </p>
                                        <div className="space-y-2">
                                            <p><strong>AR Car Rentals & Tour Services</strong></p>
                                            <p>
                                                Email:{' '}
                                                <a href="mailto:arcarrentalsservices@gmail.com" className="text-neutral-900 underline hover:no-underline">
                                                    arcarrentalsservices@gmail.com
                                                </a>
                                            </p>
                                            <p>
                                                Phone:{' '}
                                                <a href="tel:+639566625224" className="text-neutral-900 underline hover:no-underline">
                                                    +63 942 394 3545
                                                </a>
                                            </p>
                                            <p>Location: Cebu City, Cebu, Philippines</p>
                                        </div>
                                    </div>
                                </section>

                            </div>
                        </main>
                    </div>
                </div>
            </section>
            </div>
        </>
    );
};

export default TermsOfServicePage;
