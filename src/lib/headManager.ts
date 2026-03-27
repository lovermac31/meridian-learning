import type { JsonLd } from './structuredData';

type HeadMetadata = {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  og?: {
    title: string;
    description: string;
    url: string;
    image: string;
    type: string;
    siteName: string;
    locale?: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  jsonLd?: JsonLd[];
};

const CONTROLLED_ATTRIBUTE = 'data-seo-controlled';
const JSON_LD_SELECTOR = 'script[type="application/ld+json"][data-seo-controlled="json-ld"]';

function upsertMetaByName(name: string, content?: string) {
  const selector = `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }

  element.setAttribute(CONTROLLED_ATTRIBUTE, 'true');
  element.content = content;
}

function upsertMetaByProperty(property: string, content?: string) {
  const selector = `meta[property="${property}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }

  element.setAttribute(CONTROLLED_ATTRIBUTE, 'true');
  element.content = content;
}

function upsertCanonical(href?: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!href) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }

  element.setAttribute(CONTROLLED_ATTRIBUTE, 'true');
  element.href = href;
}

function replaceJsonLd(blocks: JsonLd[] = []) {
  document.head.querySelectorAll(JSON_LD_SELECTOR).forEach((element) => element.remove());

  for (const block of blocks) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(CONTROLLED_ATTRIBUTE, 'json-ld');
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  }
}

export function applyHeadMetadata(metadata: HeadMetadata) {
  document.title = metadata.title;

  upsertMetaByName('description', metadata.description);
  upsertMetaByName('robots', metadata.robots);

  upsertCanonical(metadata.canonical);

  upsertMetaByProperty('og:title', metadata.og?.title);
  upsertMetaByProperty('og:description', metadata.og?.description);
  upsertMetaByProperty('og:url', metadata.og?.url);
  upsertMetaByProperty('og:image', metadata.og?.image);
  upsertMetaByProperty('og:type', metadata.og?.type);
  upsertMetaByProperty('og:site_name', metadata.og?.siteName);
  upsertMetaByProperty('og:locale', metadata.og?.locale);

  upsertMetaByName('twitter:card', metadata.twitter?.card);
  upsertMetaByName('twitter:title', metadata.twitter?.title);
  upsertMetaByName('twitter:description', metadata.twitter?.description);
  upsertMetaByName('twitter:image', metadata.twitter?.image);

  replaceJsonLd(metadata.jsonLd);
}
