/**
 * SEO Utilities - Structured Data (Schema.org) Generators
 * 
 * These functions generate JSON-LD structured data objects
 * that help search engines understand your content better.
 * This is similar to what Yoast does automatically for WordPress.
 */

const SITE_URL = 'https://arcarrentalscebu.com';
const BUSINESS_NAME = 'AR Car Rentals & Tour Services';

/**
 * Organization Schema - Use this on your homepage
 */
export const generateOrganizationSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'LocalBusiness', 'AutoRental'],
        '@id': `${SITE_URL}/#organization`,
        name: BUSINESS_NAME,
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/ARCarRentals.png`,
        },
        image: `${SITE_URL}/ARCarRentals.png`,
        description: 'Premium car rental and tour services in Cebu, Philippines. Offering self-drive rentals, chauffeur services, airport transfers, and guided tours.',
        telephone: '+639423943545',
        email: 'arcarrentalsservices@gmail.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '428 Bonifacio St',
            addressLocality: 'Lapu-Lapu City',
            addressRegion: 'Cebu',
            postalCode: '6015',
            addressCountry: 'PH',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 10.3103,
            longitude: 123.9494,
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
        },
        priceRange: '₱₱',
        sameAs: [
            'https://www.facebook.com/arcarrentalsservicescebu',
        ],
        areaServed: {
            '@type': 'City',
            name: 'Cebu City',
            containedIn: {
                '@type': 'AdministrativeArea',
                name: 'Cebu',
            },
        },
    };
};

/**
 * Breadcrumb Schema - Use on all internal pages
 */
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
};

/**
 * Service Schema - Use on service/feature pages
 */
export const generateServiceSchema = (
    serviceName: string,
    description: string,
    serviceType: string,
    areaServed: string = 'Cebu, Philippines'
) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${SITE_URL}/#service-${serviceName.toLowerCase().replace(/\s+/g, '-')}`,
        name: serviceName,
        description: description,
        provider: {
            '@type': 'LocalBusiness',
            name: BUSINESS_NAME,
            '@id': `${SITE_URL}/#organization`,
        },
        serviceType: serviceType,
        areaServed: {
            '@type': 'City',
            name: areaServed,
        },
    };
};

/**
 * Product Schema - Use for vehicle listings
 */
export const generateProductSchema = (vehicle: {
    name: string;
    description: string;
    image: string;
    price: number;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: vehicle.name,
        description: vehicle.description,
        image: vehicle.image,
        offers: {
            '@type': 'Offer',
            price: vehicle.price,
            priceCurrency: 'PHP',
            availability: `https://schema.org/${vehicle.availability}`,
            seller: {
                '@type': 'Organization',
                name: BUSINESS_NAME,
                '@id': `${SITE_URL}/#organization`,
            },
        },
    };
};

/**
 * FAQ Schema - Use on FAQ or help pages
 */
export const generateFAQSchema = (questions: { question: string; answer: string }[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer,
            },
        })),
    };
};

/**
 * Article Schema - Use on blog posts or news articles
 */
export const generateArticleSchema = (article: {
    title: string;
    description: string;
    image: string;
    publishedDate: string;
    modifiedDate?: string;
    authorName: string;
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: article.image,
        datePublished: article.publishedDate,
        dateModified: article.modifiedDate || article.publishedDate,
        author: {
            '@type': 'Person',
            name: article.authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: BUSINESS_NAME,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/ARCarRentals.png`,
            },
        },
    };
};

/**
 * Contact Page Schema
 */
export const generateContactPageSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': `${SITE_URL}/contact/#webpage`,
        url: `${SITE_URL}/contact`,
        name: 'Contact Us - AR Car Rentals',
        description: 'Get in touch with AR Car Rentals for bookings, inquiries, and customer support.',
    };
};

/**
 * About Page Schema
 */
export const generateAboutPageSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': `${SITE_URL}/about/#webpage`,
        url: `${SITE_URL}/about`,
        name: 'About Us - AR Car Rentals',
        description: 'Learn about AR Car Rentals, our mission, values, and commitment to providing excellent car rental services in Cebu.',
    };
};

/**
 * WebPage Schema - Generic webpage (use for other pages)
 */
export const generateWebPageSchema = (page: {
    url: string;
    name: string;
    description: string;
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${page.url}/#webpage`,
        url: page.url,
        name: page.name,
        description: page.description,
    };
};

/**
 * WebSite Schema with SearchAction - Use on homepage
 */
export const generateWebSiteSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BUSINESS_NAME,
        description: 'Premium car rental and tour services in Cebu, Philippines',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/browse-vehicles?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
};

/**
 * Reviews/Rating Aggregate Schema - For displaying star ratings in search results
 */
export const generateAggregateRatingSchema = (rating: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#organization`,
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.ratingValue,
            reviewCount: rating.reviewCount,
            bestRating: rating.bestRating || 5,
            worstRating: rating.worstRating || 1,
        },
    };
};

/**
 * Individual Review Schema
 */
export const generateReviewSchema = (review: {
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: {
            '@type': 'LocalBusiness',
            name: BUSINESS_NAME,
            '@id': `${SITE_URL}/#organization`,
        },
        author: {
            '@type': 'Person',
            name: review.author,
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
        },
        reviewBody: review.reviewBody,
        datePublished: review.datePublished,
    };
};

/**
 * Combined schema for multiple structured data objects
 */
export const combineSchemas = (schemas: Record<string, any>[]) => {
    return {
        '@context': 'https://schema.org',
        '@graph': schemas,
    };
};
