import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kicker: z.string(),
      description: z.string(),
      tags: z.array(z.string()).default([]),
      link: z.string().url().optional(),
      repo: z.string().url().optional(),
      cover: image().optional(),
      /** 'contain' for logo-style covers that shouldn't be cropped. */
      coverFit: z.enum(['cover', 'contain']).default('cover'),
      /** Optional badge next to the title, e.g. "In development". */
      status: z.string().optional(),
      date: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
