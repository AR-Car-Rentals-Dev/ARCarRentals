import { type FC, useEffect } from 'react';

export interface SEOProps {
    /** Page title (will be suffixed with site name) */
    title?: string;
    /** Meta description (150-160 characters recommended) */
    description?: string;
    /** Keywords for the page */
    keywords?: string[];
    /** Canonical URL */
    canonical?: string;
    /** Open Graph image URL */
    ogImage?: string;
    /** Open Graph type (default: 'website') */
    ogType?: 'website' | 'article' | 'product' | 'business.business';
    /** Article published time (ISO 8601 format) */
    articlePublishedTime?: string;
    /** Article modified time (ISO 8601 format) */
    articleModifiedTime?: string;
    /** Twitter card type (default: 'summary_large_image') */
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    /** Robots meta directives */
    robots?: 'index, follow' | 'noindex, nofollow' | 'index, nofollow' | 'noindex, follow';
    /** JSON-LD structured data */
    structuredData?: Record<string, any> | Record<string, any>[];
    /** Author name */
    author?: string;
    /** Language code (default: 'en') */
    lang?: string;
}

const SITE_NAME = 'AR Car Rentals & Tour Services';
const DEFAULT_DESCRIPTION = 'Premium car rental and tour services in Cebu, Philippines. Affordable rates, well-maintained vehicles, airport transfers, and guided tours.';
const DEFAULT_OG_IMAGE = 'https://arcarrentalscebu.com/ARCarRentals.png';

/**
 * SEO Component - Manages meta tags, Open Graph, Twitter Cards, and structured data
 * 
 * This provides the same SEO capabilities as Yoast for WordPress, but with full control:
 * - Dynamic meta tags (title, description, keywords)
 * - Open Graph tags for social media
 * - Twitter Card tags
 * - JSON-LD structured data
 * - Canonical URLs
 * - Robots directives
 */
export const SEO: FC<SEOProps> = ({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = [],
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    articlePublishedTime,
    articleModifiedTime,
    twitterCard = 'summary_large_image',
    robots = 'index, follow',
    structuredData,
    author = SITE_NAME,
    lang = 'en',
}) => {
    useEffect(() => {
        // Set page title
        const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Best Car Rental & Tour Services in Cebu`;
        document.title = fullTitle;

        // Set HTML lang attribute
        document.documentElement.lang = lang;

        // Helper function to set or update meta tag
        const setMetaTag = (selector: string, content: string, attribute: 'name' | 'property' = 'name') => {
            let element = document.querySelector<HTMLMetaElement>(selector);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, selector.replace(/meta\[name="|meta\[property="|"\]/g, ''));
                document.head.appendChild(element);
            }
            element.content = content;
        };

        // Set basic meta tags
        setMetaTag('meta[name="description"]', description);
        if (keywords.length > 0) {
            setMetaTag('meta[name="keywords"]', keywords.join(', '));
        }
        setMetaTag('meta[name="author"]', author);
        setMetaTag('meta[name="robots"]', robots);

        // Set canonical URL
        if (canonical) {
            let linkElement = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
            if (!linkElement) {
                linkElement = document.createElement('link');
                linkElement.rel = 'canonical';
                document.head.appendChild(linkElement);
            }
            linkElement.href = canonical;
        }

        // Set Open Graph tags
        setMetaTag('meta[property="og:title"]', title || fullTitle, 'property');
        setMetaTag('meta[property="og:description"]', description, 'property');
        setMetaTag('meta[property="og:type"]', ogType, 'property');
        setMetaTag('meta[property="og:image"]', ogImage, 'property');
        setMetaTag('meta[property="og:site_name"]', SITE_NAME, 'property');
        
        if (canonical) {
            setMetaTag('meta[property="og:url"]', canonical, 'property');
        }

        // Set article-specific Open Graph tags
        if (ogType === 'article' && articlePublishedTime) {
            setMetaTag('meta[property="article:published_time"]', articlePublishedTime, 'property');
        }
        if (ogType === 'article' && articleModifiedTime) {
            setMetaTag('meta[property="article:modified_time"]', articleModifiedTime, 'property');
        }

        // Set Twitter Card tags
        setMetaTag('meta[name="twitter:card"]', twitterCard);
        setMetaTag('meta[name="twitter:title"]', title || fullTitle);
        setMetaTag('meta[name="twitter:description"]', description);
        setMetaTag('meta[name="twitter:image"]', ogImage);

        // Set structured data (JSON-LD)
        if (structuredData) {
            let scriptElement = document.querySelector<HTMLScriptElement>('script[data-seo-structured-data]');
            if (!scriptElement) {
                scriptElement = document.createElement('script');
                scriptElement.type = 'application/ld+json';
                scriptElement.setAttribute('data-seo-structured-data', 'true');
                document.head.appendChild(scriptElement);
            }
            scriptElement.textContent = JSON.stringify(structuredData);
        } else {
            // Remove structured data script if none provided
            const existingScript = document.querySelector('script[data-seo-structured-data]');
            if (existingScript) {
                existingScript.remove();
            }
        }

        // Cleanup function (optional - meta tags can persist)
        return () => {
            // We keep meta tags as they'll be updated by the next page
        };
    }, [
        title,
        description,
        keywords,
        canonical,
        ogImage,
        ogType,
        articlePublishedTime,
        articleModifiedTime,
        twitterCard,
        robots,
        structuredData,
        author,
        lang,
    ]);

    return null; // This component doesn't render anything
};

export default SEO;
