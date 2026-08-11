import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Shared style definitions for elements that repeat across components.
 * Defining each treatment once here is what stops the same button or pill
 * from being re-typed as a slightly different class string per component.
 */

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        /** The one primary CTA treatment, on any surface. */
        primary: 'bg-cyan text-white hover:bg-cyan-hover dark:text-surface-on-dark',
        secondary:
          'border border-border bg-background text-foreground hover:border-cyan hover:text-cyan',
        /** For the always-dark surfaces, where theme-aware tokens can't reach. */
        'secondary-on-dark':
          'border border-border-on-dark text-foreground-on-dark hover:border-cyan-on-dark hover:text-cyan-on-dark',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const tagVariants = cva(
  'rounded-lg border border-border font-mono text-xs text-foreground',
  {
    variants: {
      size: {
        /** Metadata tags on project cards and inside the project sheet. */
        sm: 'px-2 py-1 font-medium',
        /** Skill chips — a deliberate step up, they carry the section. */
        md: 'inline-flex h-[var(--chip-height)] items-center px-4 font-medium',
        /** Actionable pills, e.g. the sheet's "Live site" / "Repo" links. */
        lg: 'px-4 py-2 font-medium',
      },
      interactive: {
        true: 'transition-colors hover:border-cyan hover:text-cyan',
        false: '',
      },
    },
    defaultVariants: { size: 'sm', interactive: false },
  }
);

export type TagVariants = VariantProps<typeof tagVariants>;
