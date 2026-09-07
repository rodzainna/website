export const SITE_TITLE = 'Rodzainna Hamisain';
export const SITE_TAGLINE = 'Senior Full-Stack Developer';

/** Default <title>. Name first — recruiters search the name, not the role. */
export const SITE_DEFAULT_TITLE = `${SITE_TITLE} — ${SITE_TAGLINE}`;

/** Kept under ~160 chars so search results don't truncate it. */
export const SITE_DESCRIPTION =
  'Senior Full-Stack Developer with 10 years building production web apps and SaaS products in React, Vue.js, TypeScript, Python, PHP/Laravel and WordPress.';

/** Stack shown on the social card. Mirrors the keywords in SITE_DESCRIPTION. */
export const SITE_OG_STACK = [
  'React',
  'Vue.js',
  'TypeScript',
  'Python',
  'PHP',
  'Laravel',
  'WordPress',
];

export const SITE_OG_IMAGE = '/og-image.png';

/** Brand teal — mirrors --cyan in global.css. Meta tags can't read CSS vars. */
export const SITE_THEME_COLOR = '#155E63';

/**
 * Search engines are blocked site-wide, permanently — not a pre-launch state.
 * This flag drives the robots meta tag; `public/robots.txt` disallows all.
 * The two belong together. See SPEC.md § Search indexing before changing either.
 */
export const SITE_NOINDEX = true;

/**
 * Bounds for the accessibility text-scaling control. Read by both the rail
 * (which writes the value) and the no-flash loader in BaseLayout (which reads
 * it back), so a persisted value can't escape the range the UI allows.
 */
export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.4;
export const FONT_SCALE_STEP = 0.1;

export type NavLink = {
  href: string;
  label: string;
};

/**
 * Rendered twice — the desktop bar and the mobile menu — from this one list,
 * so the two can't drift. Ordered to match the order the sections appear on
 * the page. Absolute `/#id` rather than `#id` so the links also work from
 * /privacy and /404, where the sections don't exist.
 */
export const NAV_LINKS: NavLink[] = [
  { href: '/#skills', label: 'Skills' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#contact', label: 'Contact' },
];

export const SOCIALS = {
  github: 'https://github.com/rodzainna',
  linkedin: 'https://www.linkedin.com/in/rodzainna',
  email: 'rodzainna@gmail.com',
};

export type SkillGroup = {
  label: string;
  items: string[];
};

/** Grouped to match the categories on the resume. */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: 'Frontend',
    items: [
      'React',
      'Vue.js',
      'TypeScript',
      'JavaScript',
      'HTML5',
      'Tailwind CSS',
      'Vite',
      'Liquid (Basic)',
      'shadcn/ui',
    ],
  },
  {
    label: 'Backend',
    items: ['PHP', 'Laravel', 'Python', 'FastAPI', 'GraphQL', 'REST APIs'],
  },
  {
    label: 'Testing',
    items: ['Playwright', 'Vitest', 'Jest'],
  },
  {
    label: 'Platform & Tools',
    items: ['Docker', 'CI/CD', 'Git', 'Storybook', 'Figma', 'Jira', 'Linear'],
  },
  {
    label: 'AI-assisted Development',
    items: ['Claude', 'Cursor', 'Grok', 'OpenAI'],
  },
  {
    label: 'Integrations & CMS',
    items: [
      'Shopify',
      'Stripe',
      'Slack API',
      'WordPress',
      'WordPress Multisite',
      'Localization (EN/AR; RTL/LTR)',
      'SEO',
    ],
  },
];

export type ExperienceEntry = {
  dates: string;
  role: string;
  company: string;
  achievements: string[];
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    dates: 'Aug 2024 — Jul 2026',
    role: 'Senior Full-Stack Developer',
    company: 'VetEngage — Dallas, TX',
    achievements: [
      'Collaborated on VetEngage, a SaaS platform for veterinary clinics, building responsive client-facing booking flows and administrative dashboards using React, TypeScript, Vite, and Tailwind CSS.',
      'Maintained a comprehensive React frontend monorepo alongside a secure Python backend architecture.',
      'Collaborated on a unified design system to keep the experience visually consistent across customer-facing platforms.',
    ],
  },
  {
    dates: 'Aug 2024 — Dec 2024',
    role: 'Full-Stack Developer — Timetracker v2 (Slack-Native SaaS)',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      "Assumed sole ownership of the Vue.js, Tailwind CSS, PHP/Laravel time-tracking rewrite after the original developer's departure, driving its production rollout.",
      'Debugged and optimized transactional billing workflows, payment log logic, and slow database queries.',
      'Handled tier-3 technical customer support for the paid product, engineering patches for critical live issues.',
    ],
  },
  {
    dates: 'Jul 2021 — Jul 2024',
    role: 'Senior Frontend Developer — Luxsurance',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      'Developed responsive customer UIs with Vue.js and Tailwind CSS, integrating custom .NET REST APIs for core insurance workflows.',
      'Built dynamic frontend modules for internal operations, retail partner onboarding, and customer management.',
      'Maintained the corporate WordPress marketing website, ensuring cross-browser performance.',
      'Delivered features within an Agile/Scrum environment using Microsoft Teams and Azure DevOps.',
    ],
  },
  {
    dates: 'Jan 2017 — Jun 2021',
    role: 'Mid-Level Full-Stack Developer (WordPress & Shopify)',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      'Configured, updated, and maintained themes for client Shopify storefronts, including Joanna Czech and Dr. Flora Kim, alongside ongoing WordPress work for US and UAE commercial, nonprofit, and government clients.',
      'Built and supported multilingual WordPress Multisite platforms with English and Arabic localization, including right-to-left (RTL) and left-to-right (LTR) layouts.',
      "Contributed to large UAE government web platforms, including the Ministry of State for Federal National Council Affairs (MFNCA) and the Ministry of Culture and Knowledge Development (MCKD), including MCKD's network of subsites.",
      'Delivered WordPress sites for clients including twofour54, Jarvis Analytics, Jarvis University, Ears Texas, and We Thrive ABA.',
    ],
  },
  {
    dates: 'Jun 2016 — Dec 2016',
    role: 'Junior Full-Stack Developer',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      'Contributed to the MVP launch of Mesasix Timetracker, a Slack-native time-tracking application, using Laravel, PHP, jQuery, HTML, and CSS.',
      'Helped build the application core to handle webhook triggers and third-party platform data.',
    ],
  },
];
