import { Event } from '@whats-up-addis/shared';

/**
 * Generate JSON-LD structured data for an event
 * This helps search engines understand and display event information
 */
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
          priceCurrency: 'ETH Birr',
          availability: 'https://schema.org/InStock',
          url: `https://whatsupaddis.io/events/${event.id}`,
        }
      : {
          '@type': 'Offer',
          price: 0,
          priceCurrency: 'ETH Birr',
          availability: 'https://schema.org/InStock',
          url: `https://whatsupaddis.io/events/${event.id}`,
        },
    organizer: {
      '@type': 'Organization',
      name: "What's Up Addis",
      url: 'https://whatsupaddis.io',
    },
  };

  // Remove undefined values
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Generate JSON-LD structured data for the website/organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "What's Up Addis",
    url: 'https://whatsupaddis.io',
    logo: 'https://whatsupaddis.io/logo.png',
    description:
      'Your ultimate guide to events in Addis Ababa, Ethiopia. Discover concerts, conferences, workshops, and entertainment.',
    sameAs: [
      // Add your social media profiles here
      // 'https://facebook.com/whatsupaddis',
      // 'https://twitter.com/whatsupaddis',
      // 'https://instagram.com/whatsupaddis',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Amharic'],
    },
    areaServed: {
      '@type': 'City',
      name: 'Addis Ababa',
      containedIn: {
        '@type': 'Country',
        name: 'Ethiopia',
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for the website
 */
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

/**
 * Generate JSON-LD for a list of events
 */
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
