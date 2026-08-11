import {
  SITE_TITLE,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SKILL_GROUPS,
  SOCIALS,
} from '@/consts';

type PersonSchemaInput = {
  /** Absolute site URL, e.g. Astro.site */
  url?: string;
  /** Absolute URL of the social image */
  image: string;
};

export function buildPersonSchema({ url, image }: PersonSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_TITLE,
    jobTitle: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    url,
    image,
    email: `mailto:${SOCIALS.email}`,
    sameAs: [SOCIALS.github, SOCIALS.linkedin],
    knowsAbout: SKILL_GROUPS.flatMap((group) => group.items),
  };
}

/**
 * Serialise for embedding in a <script> via `set:html`, which does not escape.
 * `JSON.stringify` leaves `</script>` intact, so any string containing it would
 * close the tag early — escaping `<` removes that class of bug entirely.
 */
export function toJsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
