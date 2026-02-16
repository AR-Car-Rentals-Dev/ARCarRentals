# SEO Quick Reference

## 🚀 Quick Start - Add SEO to Any Page

```tsx
import { SEO } from '@/components/SEO';
import { generateWebPageSchema, generateBreadcrumbSchema, combineSchemas } from '@/utils/seoSchemas';

export const YourPage: FC = () => {
  const structuredData = combineSchemas([
    generateWebPageSchema({
      url: 'https://arcarrentalscebu.com/your-page',
      name: 'Page Title',
      description: 'Page description',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://arcarrentalscebu.com' },
      { name: 'Your Page', url: 'https://arcarrentalscebu.com/your-page' },
    ]),
  ]);

  return (
    <>
      <SEO
        title="Your Page Title"
        description="Compelling 150-160 char description with keywords"
        keywords={['keyword1', 'location keyword', 'service keyword']}
        canonical="https://arcarrentalscebu.com/your-page"
        structuredData={structuredData}
      />
      <div>{/* Your content */}</div>
    </>
  );
};
```

---

## 📋 SEO Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Page title (auto-appends site name) |
| `description` | string | Yes | Meta description (150-160 chars) |
| `keywords` | string[] | No | Array of keywords |
| `canonical` | string | Recommended | Full URL to prevent duplicates |
| `structuredData` | object | Recommended | JSON-LD schema |
| `ogImage` | string | No | Social sharing image URL |
| `robots` | string | No | Default: 'index, follow' |

---

## 🎯 Available Schema Generators

```tsx
// Organization (for homepage)
generateOrganizationSchema()

// Breadcrumbs (use on all pages)
generateBreadcrumbSchema([
  { name: 'Home', url: 'https://arcarrentalscebu.com' },
  { name: 'Page', url: 'https://arcarrentalscebu.com/page' }
])

// FAQ (shows in search results)
generateFAQSchema([
  { question: 'Question?', answer: 'Answer here' }
])

// Service page
generateServiceSchema('Service Name', 'Description', 'Type', 'Cebu')

// Product/Vehicle
generateProductSchema({
  name: 'Vehicle Name',
  description: 'Description',
  image: 'url',
  price: 1800,
  availability: 'InStock'
})

// Webpage (generic)
generateWebPageSchema({
  url: 'full-url',
  name: 'Page Name',
  description: 'Description'
})

// Contact/About pages
generateContactPageSchema()
generateAboutPageSchema()

// Website (homepage)
generateWebSiteSchema()

// Reviews
generateAggregateRatingSchema({
  ratingValue: 4.8,
  reviewCount: 150
})

// Combine multiple schemas
combineSchemas([schema1, schema2, schema3])
```

---

## ✅ SEO Checklist for New Pages

- [ ] Unique title (under 60 chars)
- [ ] Description 150-160 chars with CTA
- [ ] 5-10 relevant keywords (include location)
- [ ] Canonical URL set
- [ ] Breadcrumb schema added
- [ ] Appropriate page schema (FAQ, Service, etc.)
- [ ] Images have alt text
- [ ] H1 present and unique
- [ ] Internal links to related pages

---

## 🔍 Keyword Research Tips

**For Car Rental Cebu:**
- Primary: "car rental Cebu", "rent a car Cebu"
- Location: "Cebu City", "Mactan", "Lapu-Lapu", "airport"
- Service: "with driver", "self-drive", "airport transfer"
- Long-tail: "cheap car rental Cebu", "affordable SUV rental", "airport pickup Cebu"
- Questions: "how to rent", "what documents", "best car rental"

---

## 📊 SEO Best Practices

### Title Optimization
✅ Include primary keyword
✅ Keep under 60 characters
✅ Front-load important words
✅ Use "| AR Car Rentals" suffix

❌ Don't keyword stuff
❌ Don't use all caps
❌ Don't duplicate titles

### Description Optimization
✅ 150-160 characters exactly
✅ Include call-to-action
✅ Use numbers/prices when relevant
✅ Natural keyword usage

❌ Don't exceed 160 chars (gets cut off)
❌ Don't duplicate content from page
❌ Don't stuff keywords

### Image Optimization
```tsx
// Good
<img 
  src="/vios.jpg" 
  alt="Toyota Vios 2024 for rent in Cebu - affordable sedan"
  loading="lazy"
/>

// Bad
<img src="/vios.jpg" />
```

---

## 🛠️ Testing Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Rich Results Test | search.google.com/test/rich-results | Validate structured data |
| Meta Tags | metatags.io | Preview social cards |
| PageSpeed | pagespeed.web.dev | Speed optimization |
| Search Console | search.google.com/search-console | Monitor performance |

---

## 🎨 Example: Vehicle Detail Page

```tsx
import { SEO } from '@/components/SEO';
import { generateProductSchema, generateBreadcrumbSchema, combineSchemas } from '@/utils/seoSchemas';

export const VehiclePage: FC = () => {
  const vehicle = {
    name: 'Toyota Vios 2024',
    price: 1800,
    image: 'https://arcarrentalscebu.com/vehicles/vios.jpg',
  };

  const structuredData = combineSchemas([
    generateProductSchema({
      name: vehicle.name,
      description: 'Fuel-efficient sedan perfect for city driving in Cebu',
      image: vehicle.image,
      price: vehicle.price,
      availability: 'InStock',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://arcarrentalscebu.com' },
      { name: 'Vehicles', url: 'https://arcarrentalscebu.com/browsevehicles' },
      { name: vehicle.name, url: `https://arcarrentalscebu.com/vehicle/${vehicle.id}` },
    ]),
  ]);

  return (
    <>
      <SEO
        title={`${vehicle.name} - Rent for ₱${vehicle.price}/day`}
        description={`Rent a ${vehicle.name} in Cebu for only ₱${vehicle.price}/day. Fuel-efficient, air-conditioned, clean. Book now for airport pickup and island tours!`}
        keywords={[
          'Toyota Vios rental Cebu',
          'sedan car rental',
          'cheap car rental',
          'fuel efficient rental',
          'Cebu car rental',
        ]}
        canonical={`https://arcarrentalscebu.com/vehicle/${vehicle.id}`}
        ogImage={vehicle.image}
        structuredData={structuredData}
      />
      <div>{/* Vehicle content */}</div>
    </>
  );
};
```

---

## 🌟 Pro Tips

1. **Update sitemap.xml** when adding new pages
2. **Use FAQSchema** on pages with questions - can appear as featured snippets
3. **Add reviews** - they boost SEO and show stars in search
4. **Internal linking** - link between related pages
5. **Fresh content** - update pages regularly (Google loves this)
6. **Mobile-first** - ensure responsive design
7. **Speed matters** - compress images, lazy load
8. **Track keywords** - monitor what brings traffic

---

## 📞 Quick Actions

### Submit to Google (Do This Now!)
1. Go to: search.google.com/search-console
2. Add property: arcarrentalscebu.com
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: https://arcarrentalscebu.com/sitemap.xml

### Ongoing Maintenance
- Weekly: Check Search Console for errors
- Monthly: Update sitemap with new pages
- Monthly: Review and optimize low-performing pages
- Quarterly: Audit all titles/descriptions

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `src/components/SEO.tsx` | Main SEO component |
| `src/hooks/useSEO.ts` | SEO hook |
| `src/utils/seoSchemas.ts` | Schema generators |
| `public/robots.txt` | Search engine crawling rules |
| `public/sitemap.xml` | Site structure for search engines |
| `index.html` | Global meta tags |

---

**Full documentation:** See `SEO_GUIDE.md`
