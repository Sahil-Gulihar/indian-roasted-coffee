import { siteConfig } from '../config/site';
import { getProductPackOptions, type PackPrice } from './pricing';

export const SITE_ORIGIN = `https://${siteConfig.domain}`;
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

export function absUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${SITE_ORIGIN}${path}`;
}

export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: siteConfig.name,
    url: `${SITE_ORIGIN}/`,
    logo: absUrl('/logo-512.png'),
    email: 'office@graycup.org',
    telephone: '+91-85-2791-4317',
    parentOrganization: { '@type': 'Organization', name: 'Gray Cup Enterprises Private Limited' },
    sameAs: ['https://graycup.com', 'https://graycup.in', 'https://graycup.org'],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

export function productSchema(p: {
  url: string;
  name: string;
  description: string;
  image?: string;
  inStock: boolean;
  priceMultiplier: number;
  packPricing?: PackPrice[];
}) {
  const prices = getProductPackOptions(p.priceMultiplier, p.packPricing).map((o) => o.priceInr);
  return {
    '@type': 'Product',
    name: p.name,
    description: p.description,
    url: p.url,
    ...(p.image && { image: absUrl(p.image) }),
    brand: { '@type': 'Brand', name: siteConfig.name },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: `https://schema.org/${p.inStock ? 'InStock' : 'OutOfStock'}`,
    },
  };
}

export function faqPageSchema(items: { question: string; answerHtml: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answerHtml },
    })),
  };
}
