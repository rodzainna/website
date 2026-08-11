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
 * Search engines are blocked site-wide while the site is in progress — this
 * flag drives the robots meta tag, and `public/robots.txt` disallows all.
 * Flip both together when launching.
 */
export const SITE_NOINDEX = true;

export const SOCIALS = {
  github: 'https://github.com/rodzainna',
  linkedin: 'https://www.linkedin.com/in/rodzainnahamisain',
  email: 'rodzainna.hamisain@gmail.com',
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
      'Stripe',
      'Slack API',
      'WordPress',
      'WordPress Multisite',
      'Localization (EN/AR)',
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
    dates: 'Jan 2025 — Jul 2026',
    role: 'Senior Full-Stack Developer',
    company: 'VetEngage — Dallas, TX',
    achievements: [
      'Collaborated on VetEngage, a SaaS platform for veterinary clinics, contributing to its client-facing online booking experience and internal administrative dashboard.',
      'Developed and maintained responsive frontend features using React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.',
      'Contributed to the product marketing website and shared design system, helping maintain a consistent user experience across customer-facing and internal applications.',
      'Contributed to a React frontend monorepo supporting the marketing website, online booking experience, and internal dashboard, while also contributing to a separate Python backend codebase.',
    ],
  },
  {
    dates: 'Aug 2024 — Dec 2024',
    role: 'Full-Stack Developer — Timetracker v2 (Slack-Native SaaS)',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      "Took ownership of the Vue.js, Tailwind CSS, PHP/Laravel time-tracking rewrite after the original developer's departure, supporting its production rollout and resolving critical subscription, clock-in, and time-calculation issues.",
      'Optimized slow database queries, maintained Slack slash-command and interactive time-tracking workflows, and handled customer support for the paid product.',
    ],
  },
  {
    dates: 'Jul 2021 — Jul 2024',
    role: 'Senior Frontend Developer — Luxsurance',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      'Collaborated on the Vue.js and Tailwind CSS customer application, integrating .NET REST APIs for core insurance workflows.',
      'Contributed frontend work to the internal administrative dashboard for operations, partners/retailers, and customer management.',
      'Contributed to the development and maintenance of the Luxsurance WordPress marketing website.',
      'Worked in an Agile/Scrum environment using Microsoft Teams and Azure DevOps.',
    ],
  },
  {
    dates: 'Jan 2017 — Jun 2021',
    role: 'WordPress Developer',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      'Contributed to the development and maintenance of WordPress websites for US and UAE commercial, nonprofit, and government clients.',
      'Built and supported multilingual WordPress Multisite platforms with English and Arabic localization, including right-to-left (RTL) and left-to-right (LTR) layouts.',
      "Contributed to large UAE government web platforms, including the Ministry of Foreign Affairs and International Cooperation (MNFCA) and the Ministry of Culture and Knowledge Development (MCKD), including MCKD's network of subsites.",
      'Delivered WordPress sites for clients including twofour54, Jarvis Analytics, Jarvis University, Ears Texas, and We Thrive ABA.',
    ],
  },
  {
    dates: 'Jun 2016 — Dec 2016',
    role: 'Junior Full-Stack Developer',
    company: 'Mesasix — Dallas, TX',
    achievements: [
      'Contributed to the first version of Mesasix Timetracker, a Slack-native time-tracking application, using Laravel, PHP, jQuery, HTML, and CSS.',
    ],
  },
];
