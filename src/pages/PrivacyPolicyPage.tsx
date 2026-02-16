import { type FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { generateWebPageSchema, generateBreadcrumbSchema, combineSchemas } from '@/utils/seoSchemas';

// Privacy policy sections for navigation
const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'information-collected', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'information-sharing', title: 'Information Sharing' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'data-retention', title: 'Data Retention' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'cookies', title: 'Cookies & Tracking' },
    { id: 'changes', title: 'Policy Changes' },
    { id: 'contact', title: 'Contact Us' },
];

/**
 * Privacy Policy Page - Minimalist 2-column layout with sticky navigation
 */
export const PrivacyPolicyPage: FC = () => {
    const [activeSection, setActiveSection] = useState('introduction');

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

    // SEO structured data
    const structuredData = combineSchemas([
        generateWebPageSchema({
            url: 'https://arcarrentalscebu.com/privacy',
            name: 'Privacy Policy - AR Car Rentals',
            description: 'Privacy policy for AR Car Rentals. Learn how we collect, use, and protect your personal information.',
        }),
        generateBreadcrumbSchema([
            { name: 'Home', url: 'https://arcarrentalscebu.com' },
            { name: 'Privacy Policy', url: 'https://arcarrentalscebu.com/privacy' },
        ]),
    ]);

    return (
        <>
            <SEO
                title="Privacy Policy"
                description="Privacy policy for AR Car Rentals in Cebu, Philippines. Learn how we collect, use, protect, and handle your personal information when you use our car rental services."
                keywords={[
                    'privacy policy',
                    'data protection',
                    'personal information',
                    'GDPR',
                    'data privacy',
                    'customer data',
                    'car rental privacy',
                    'information security',
                ]}
                canonical="https://arcarrentalscebu.com/privacy"
                structuredData={structuredData}
            />
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="bg-white min-h-screen">
            {/* Header Section - Minimalist */}
            <section className="border-b border-neutral-200 py-12">
                <div className="mx-auto w-full max-w-[1200px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm mb-4">
                        <Link to="/" className="text-neutral-500 hover:text-neutral-900 transition-colors">
                            Home
                        </Link>
                        <span className="text-neutral-300">/</span>
                        <span className="text-neutral-900">Privacy Policy</span>
                    </nav>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">Privacy Policy</h1>
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

                                {/* Introduction */}
                                <section id="introduction" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Introduction</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            Welcome to AR Car Rentals. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our car rental services in Cebu, Philippines.
                                        </p>
                                        <p>
                                            By using our services, website, or mobile applications, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access our services.
                                        </p>
                                    </div>
                                </section>

                                {/* Information We Collect */}
                                <section id="information-collected" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Information We Collect</h2>

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-medium text-neutral-900 mb-3">Personal Information</h3>
                                            <p className="text-neutral-600 mb-4">We collect the following personal information when you make a booking:</p>
                                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                                <li>Full name</li>
                                                <li>Email address</li>
                                                <li>Phone number</li>
                                                <li>Valid driver's license</li>
                                                <li>Government-issued ID</li>
                                                <li>Payment information</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-neutral-900 mb-3">Booking & Usage Information</h3>
                                            <p className="text-neutral-600 mb-4">We automatically collect certain information about your rental:</p>
                                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                                <li>Pickup and return locations</li>
                                                <li>Rental dates and times</li>
                                                <li>Vehicle preferences</li>
                                                <li>Booking history</li>
                                                <li>Payment receipts</li>
                                                <li>Communication records</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-neutral-900 mb-3">Technical Information</h3>
                                            <p className="text-neutral-600 mb-4">When you visit our website, we may collect:</p>
                                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                                <li>IP address</li>
                                                <li>Browser type and version</li>
                                                <li>Device information</li>
                                                <li>Pages visited</li>
                                                <li>Time spent on pages</li>
                                                <li>Referral source</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                {/* How We Use Your Information */}
                                <section id="how-we-use" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">How We Use Your Information</h2>
                                    <p className="text-neutral-600 mb-4">We use the collected information for the following purposes:</p>
                                    <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                        <li><strong>Process Bookings:</strong> To facilitate vehicle reservations and rentals</li>
                                        <li><strong>Customer Support:</strong> To respond to inquiries and provide assistance</li>
                                        <li><strong>Communication:</strong> To send booking confirmations, updates, and reminders</li>
                                        <li><strong>Payment Processing:</strong> To process transactions securely</li>
                                        <li><strong>Service Improvement:</strong> To enhance our services based on feedback</li>
                                        <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                                    </ul>
                                </section>

                                {/* Information Sharing */}
                                <section id="information-sharing" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Information Sharing</h2>
                                    <p className="text-neutral-600 mb-4">
                                        We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                        <li><strong>Service Providers:</strong> With trusted partners who assist in operating our business (e.g., payment processors, email services)</li>
                                        <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                        <li><strong>Your Consent:</strong> When you have given explicit permission</li>
                                    </ul>
                                </section>

                                {/* Data Security */}
                                <section id="data-security" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Data Security</h2>
                                    <p className="text-neutral-600 mb-4">
                                        We implement robust security measures to protect your personal information:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                        <li>SSL/TLS encryption for data transmission</li>
                                        <li>Secure payment processing via trusted gateways</li>
                                        <li>Regular security audits and updates</li>
                                        <li>Access controls and authentication</li>
                                        <li>Employee training on data protection</li>
                                        <li>Encrypted data storage</li>
                                    </ul>
                                </section>

                                {/* Data Retention */}
                                <section id="data-retention" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Data Retention</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
                                        </p>
                                        <p><strong>Retention Periods:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li><strong>Booking Records:</strong> 7 years (for legal and tax purposes)</li>
                                            <li><strong>Account Information:</strong> Until account deletion</li>
                                            <li><strong>Marketing Preferences:</strong> Until consent is withdrawn</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* Your Rights */}
                                <section id="your-rights" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Your Rights</h2>
                                    <p className="text-neutral-600 mb-4">
                                        Under applicable data protection laws, you have the following rights:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                        <li><strong>Access:</strong> Request a copy of your personal data</li>
                                        <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                                        <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                                        <li><strong>Portability:</strong> Receive your data in a portable format</li>
                                        <li><strong>Objection:</strong> Object to processing of your data</li>
                                        <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
                                    </ul>
                                    <p className="text-neutral-600 mt-4">
                                        To exercise any of these rights, please contact us at{' '}
                                        <a href="mailto:info@arcarrentalscebu.com" className="text-neutral-900 underline hover:no-underline">
                                            info@arcarrentalscebu.com
                                        </a>.
                                    </p>
                                </section>

                                {/* Cookies */}
                                <section id="cookies" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Cookies & Tracking</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            We use cookies and similar tracking technologies to enhance your browsing experience and analyze website usage.
                                        </p>
                                        <p><strong>Types of Cookies:</strong></p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li><strong>Essential Cookies:</strong> Required for basic website functionality and security</li>
                                            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                                            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign performance</li>
                                        </ul>
                                        <p>
                                            You can manage cookie preferences through your browser settings.
                                        </p>
                                    </div>
                                </section>

                                {/* Policy Changes */}
                                <section id="changes" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Policy Changes</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make significant changes:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>We will update the "Last updated" date at the top of this policy</li>
                                            <li>We may notify you via email for material changes</li>
                                            <li>Continued use of our services constitutes acceptance of the updated policy</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* Contact Us */}
                                <section id="contact" className="mb-16 scroll-mt-24">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Contact Us</h2>
                                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                                        <p>
                                            If you have any questions about this Privacy Policy or our data practices, please contact us:
                                        </p>
                                        <div className="space-y-2">
                                            <p><strong>AR Car Rentals & Tour Services</strong></p>
                                            <p>
                                                Email:{' '}
                                                <a href="mailto:info@arcarrentalscebu.com" className="text-neutral-900 underline hover:no-underline">
                                                    info@arcarrentalscebu.com
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

export default PrivacyPolicyPage;
