// Template Helpers
// Shared utilities for website templates: radius, button styles, scroll animation

import { WebsiteConfig, WebsiteTheme, CustomBlock, CustomBlockLayout } from '../types';

// ── Border Radius ──────────────────────────────────────────────────────────

export function getRadius(br: WebsiteTheme['borderRadius'], size: 'sm' | 'md' | 'lg' = 'md'): string {
  if (br === 'sharp') return '0px';
  if (br === 'pill') return '9999px';
  const map = { sm: '8px', md: '12px', lg: '16px' };
  return map[size];
}

// ── Button Styles ──────────────────────────────────────────────────────────

interface ButtonStyleResult {
  backgroundColor: string;
  color: string;
  border?: string;
  borderRadius: string;
  paddingLeft: string;
  paddingRight: string;
}

/**
 * Returns inline styles for CTA buttons based on theme settings.
 * Respects both `buttonStyle` (solid/outline/ghost) and `borderRadius`.
 * Includes 12px left/right padding for consistent button appearance.
 */
export function getButtonStyle(
  theme: WebsiteTheme,
  /** The button's primary color */
  color: string,
  /** Text color for solid buttons (auto-detected if omitted) */
  textColor: string = '#ffffff',
): ButtonStyleResult {
  const radius = getRadius(theme.borderRadius, 'md');

  switch (theme.buttonStyle) {
    case 'outline':
      return {
        backgroundColor: 'transparent',
        color,
        border: `2px solid ${color}`,
        borderRadius: radius,
        paddingLeft: '12px',
        paddingRight: '12px',
      };
    case 'ghost':
      return {
        backgroundColor: `${color}15`,
        color,
        borderRadius: radius,
        paddingLeft: '12px',
        paddingRight: '12px',
      };
    case 'solid':
    default:
      return {
        backgroundColor: color,
        color: textColor,
        borderRadius: radius,
        paddingLeft: '12px',
        paddingRight: '12px',
      };
  }
}

/**
 * CSS class string for button hover/interaction.
 * Complements the inline styles from getButtonStyle().
 */
export function getButtonClasses(theme: WebsiteTheme): string {
  const base = 'inline-flex items-center gap-2 font-semibold text-sm shadow-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all';
  if (theme.buttonStyle === 'outline') {
    return base + ' shadow-none';
  }
  if (theme.buttonStyle === 'ghost') {
    return base + ' shadow-none hover:opacity-100';
  }
  return base;
}

// ── Section Style (builder highlight) ──────────────────────────────────────

export function sectionStyle(isSelected: boolean, variant: 'light' | 'dark' = 'light'): string {
  if (variant === 'dark') {
    return isSelected
      ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950 relative cursor-pointer transition-all'
      : 'relative cursor-pointer transition-all hover:ring-1 hover:ring-yellow-400/30 hover:ring-offset-1 hover:ring-offset-slate-950';
  }
  return isSelected
    ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white relative cursor-pointer transition-all'
    : 'relative cursor-pointer transition-all hover:ring-1 hover:ring-blue-300/50 hover:ring-offset-1';
}

// ── Custom Block Layout Metadata ──────────────────────────────────────────

export const CUSTOM_BLOCK_PRESETS: {
  layout: CustomBlockLayout;
  label: string;
  description: string;
  /** Lucide icon name (not emoji) */
  icon: string;
}[] = [
  { layout: 'text-image-left', label: 'Text + Image (Left)', description: 'Image on the left, text on the right', icon: 'image' },
  { layout: 'text-image-right', label: 'Text + Image (Right)', description: 'Text on the left, image on the right', icon: 'columns-2' },
  { layout: 'full-text', label: 'Full Width Text', description: 'Large heading with body text', icon: 'file-text' },
  { layout: 'image-grid', label: 'Image Grid', description: '2-3 column image grid', icon: 'layout-grid' },
  { layout: 'cta-banner', label: 'CTA Banner', description: 'Call-to-action with button', icon: 'megaphone' },
  { layout: 'testimonial', label: 'Testimonial', description: 'Quote with author attribution', icon: 'message-square-quote' },
];

export function createDefaultBlock(layout: CustomBlockLayout): CustomBlock {
  const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  switch (layout) {
    case 'text-image-left':
      return {
        id,
        layout,
        title: 'Why Attend?',
        content: 'Join industry leaders and innovators for an unforgettable experience. Network, learn, and grow with the best in the field.',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
        buttonText: 'Learn More',
        buttonUrl: '#',
      };
    case 'text-image-right':
      return {
        id,
        layout,
        title: 'What to Expect',
        content: 'From keynote presentations to hands-on workshops, every moment is designed to inspire and empower you.',
        imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop',
        buttonText: 'View Schedule',
        buttonUrl: '#',
      };
    case 'full-text':
      return {
        id,
        layout,
        title: 'Our Mission',
        content: 'We believe in the power of bringing people together. Our events create meaningful connections that last beyond the conference hall. Whether you are a first-time attendee or a seasoned professional, there is something here for everyone.',
      };
    case 'image-grid':
      return {
        id,
        layout,
        title: 'Highlights',
        content: 'Moments from our events',
        images: [
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop',
        ],
      };
    case 'cta-banner':
      return {
        id,
        layout,
        title: 'Don\'t Miss Out!',
        content: 'Early bird pricing ends soon. Secure your spot today and save.',
        buttonText: 'Register Now',
        buttonUrl: '#',
      };
    case 'testimonial':
      return {
        id,
        layout,
        title: '',
        content: '"This was hands down the best event I have attended. The speakers were phenomenal, the networking was incredible, and I left feeling truly inspired."',
        author: 'Sarah Johnson',
        authorRole: 'CEO, TechCorp',
      };
  }
}

// ── Gallery placeholder images ─────────────────────────────────────────────

export const GALLERY_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop',
];
