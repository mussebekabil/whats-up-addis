import { Event } from '@whats-up-addis/shared';
import { PlaceContent } from '@/lib/place-content';

export function generateEventSchema(event: Event) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location || 'Addis Ababa',
        addressCountry: 'Ethiopia',
      },
    },
    image: event.imageUrl || undefined,
    offers: event.price
      ? {
          '@type': 'Offer',
          price: event.price,
          priceCurrency: 'ETB',
          availability: 'https://schema.org/InStock',
          url: `https://whatsupaddis.io/events/${event.id}`,
        }
      : {
          '@type': 'Offer',
          price: 0,
          priceCurrency: 'ETB',
          availability: 'https://schema.org/InStock',
          url: `https://whatsupaddis.io/events/${event.id}`,
        },
    organizer: {
      '@type': 'Organization',
      name: "What's Up Addis",
      url: 'https://whatsupaddis.io',
    },
  };
  return JSON.parse(JSON.stringify(schema));
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "What's Up Addis",
    url: 'https://whatsupaddis.io',
    logo: 'https://whatsupaddis.io/logo.png',
    description:
      'Your ultimate guide to events in Addis Ababa, Ethiopia. Discover concerts, conferences, workshops, and entertainment.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Amharic'],
    },
    areaServed: {
      '@type': 'City',
      name: 'Addis Ababa',
      containedIn: { '@type': 'Country', name: 'Ethiopia' },
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "What's Up Addis",
    url: 'https://whatsupaddis.io',
    description:
      'Discover events in Addis Ababa, Ethiopia. Your guide to concerts, conferences, workshops, and entertainment.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://whatsupaddis.io/events?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateEventListSchema(events: Event[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateEventSchema(event),
    })),
  };
}

export function generatePlaceSchema(content: PlaceContent) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: content.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: content.address || undefined,
      addressLocality: 'Addis Ababa',
      addressCountry: 'Ethiopia',
    },
    telephone: content.contactInfo || undefined,
    image: content.imageUrls[0] || undefined,
    url: `https://whatsupaddis.io/places/${content.slug}`,
  };
  return JSON.parse(JSON.stringify(schema));
}

export function generateBreadcrumbSchema(
  crumbs: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://whatsupaddis.io${crumb.url}`,
    })),
  };
}

export function generateGuideSchema(
  title: string,
  description: string,
  places: PlaceContent[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    itemListElement: places.map((place, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generatePlaceSchema(place),
    })),
  };
}
