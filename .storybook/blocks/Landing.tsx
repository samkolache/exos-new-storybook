import React, { useMemo, useState } from 'react';
import { Story } from '@storybook/addon-docs/blocks';
import './landing.css';

/** Opens another Storybook page from inside a docs page. */
const docsHref = (id: string) => `/?path=/docs/${id}`;

// ─── Welcome ────────────────────────────────────────────────────────────────

// Shapes and stars from the PCR designs (exported in pcr-demo/src/assets/figma):
// the "Report submitted" flower, moons and cross, and the AI sparkles.
import flower from './assets/submitted-flower.svg';
import moons from './assets/submitted-moons.svg';
import cross from './assets/submitted-cross.svg';
import starGold from './assets/submitted-sp1.svg';
import starBlue from './assets/report-ai.svg';
import starGreen from './assets/submit-spark.svg';
import starPurple from './assets/icon-kicker-sparkle.svg';
import aiSparkle from './assets/icon-ai-sparkle.svg';

/**
 * Where each shape floats: position (% of the hero), size (px), tilt and timing.
 * `phone` places it in the bands above and below the text on small screens; without it the
 * shape is hidden there.
 */
const SHAPES: { src: string; top: number; left: number; size: number; rotate: number; delay: number; phone?: [number, number] }[] = [
  { src: flower, top: 10, left: 8, size: 76, rotate: -12, delay: 0, phone: [3, 6] },
  { src: starGold, top: 6, left: 30, size: 44, rotate: 8, delay: 1.4, phone: [5, 42] },
  { src: moons, top: 12, left: 76, size: 64, rotate: 10, delay: 0.7, phone: [3, 76] },
  { src: aiSparkle, top: 34, left: 90, size: 54, rotate: 0, delay: 2.1 },
  { src: cross, top: 46, left: 3, size: 58, rotate: 18, delay: 1.1, phone: [86, 8] },
  { src: starBlue, top: 72, left: 16, size: 40, rotate: -6, delay: 0.3, phone: [90, 44] },
  { src: starPurple, top: 82, left: 44, size: 30, rotate: 12, delay: 1.8 },
  { src: flower, top: 70, left: 84, size: 52, rotate: 20, delay: 0.9, phone: [86, 78] },
  { src: starGreen, top: 19, left: 66, size: 26, rotate: -10, delay: 2.5 },
  { src: moons, top: 78, left: 70, size: 34, rotate: -18, delay: 1.6 },
];

/** Welcome hero: centred title and links with the PCR shapes and stars floating around. */
export const Hero = ({ title, subtitle, children }: { title: React.ReactNode; subtitle: string; children?: React.ReactNode }) => (
  <header className="exos-hero exos-theme-dcfc">
    <div className="exos-hero__shapes" aria-hidden="true">
      {SHAPES.map((shape, i) => (
        <img
          key={i}
          className={`exos-hero__shape${shape.phone ? '' : ' exos-hero__shape--wide-only'}`}
          src={shape.src}
          alt=""
          style={{
            top: `${shape.top}%`,
            left: `${shape.left}%`,
            width: shape.size,
            height: shape.size,
            animationDelay: `${shape.delay}s`,
            ['--tilt' as string]: `${shape.rotate}deg`,
            ['--phone-top' as string]: shape.phone ? `${shape.phone[0]}%` : undefined,
            ['--phone-left' as string]: shape.phone ? `${shape.phone[1]}%` : undefined,
          }}
        />
      ))}
    </div>

    <h1 className="exos-hero__title">{title}</h1>
    <p className="exos-hero__subtitle">{subtitle}</p>
    {children && <div className="exos-hero__links">{children}</div>}
  </header>
);

const ICONS: Record<string, React.ReactNode> = {
  github: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  figma: (
    <svg width="16" height="16" viewBox="0 0 38 57" aria-hidden="true">
      <path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z" />
      <path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 019.5 38H19v9.5a9.5 9.5 0 11-19 0z" />
      <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 100-19H19z" />
      <path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 009.5 19H19V0H9.5A9.5 9.5 0 000 9.5z" />
      <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 009.5 38H19V19H9.5A9.5 9.5 0 000 28.5z" />
    </svg>
  ),
  catalog: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.75" y="1.75" width="5" height="5" rx="1.25" />
      <rect x="9.25" y="1.75" width="5" height="5" rx="1.25" />
      <rect x="1.75" y="9.25" width="5" height="5" rx="1.25" />
      <rect x="9.25" y="9.25" width="5" height="5" rx="1.25" />
    </svg>
  ),
};

/** Small rounded link with an icon (GitHub, Figma, Catalog…). */
export const LinkPill = ({ href, icon, children }: { href: string; icon?: keyof typeof ICONS; children: React.ReactNode }) => {
  const external = /^https?:/.test(href);
  return (
    <a className="exos-pill" href={href} target={external ? '_blank' : '_top'} rel={external ? 'noreferrer' : undefined}>
      {icon && ICONS[icon]}
      {children}
    </a>
  );
};

/** The "Start here" row. */
export const CardGrid = ({ children }: { children: React.ReactNode }) => <div className="exos-start">{children}</div>;

/** Line icons for the start-here cards (20px, currentColor). */
const START_ICONS: Record<string, React.ReactNode> = {
  catalog: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.75" y="2.75" width="5.5" height="5.5" rx="1.25" />
      <rect x="11.75" y="2.75" width="5.5" height="5.5" rx="1.25" />
      <rect x="2.75" y="11.75" width="5.5" height="5.5" rx="1.25" />
      <rect x="11.75" y="11.75" width="5.5" height="5.5" rx="1.25" />
    </svg>
  ),
  components: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5l6.5 3.75v7.5L10 17.5l-6.5-3.75v-7.5L10 2.5z" />
      <path d="M3.5 6.25L10 10l6.5-3.75M10 10v7.5" />
    </svg>
  ),
  patterns: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="2" />
      <path d="M2.75 7.25h14.5M8.25 7.25v10" />
    </svg>
  ),
  // Pen nib: the design source.
  figma: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M10 2.75l5 6.5-5 8-5-8 5-6.5z" />
      <path d="M10 2.75v7.25" />
      <circle cx="10" cy="11.25" r="1.25" />
    </svg>
  ),
};

/**
 * A start-here card: icon tile, title, a line of description and a link line.
 * Without `href` it shows as coming soon and isn't clickable.
 */
export const StartCard = ({
  title,
  href,
  icon,
  cta,
  children,
}: {
  title: string;
  href?: string;
  icon: keyof typeof START_ICONS;
  /** Link text at the bottom, e.g. "Browse catalog". */
  cta?: string;
  children: React.ReactNode;
}) => {
  const external = !!href && /^https?:/.test(href);
  const body = (
    <>
      <span className="exos-start__icon">{START_ICONS[icon]}</span>
      <span className="exos-start__title">{title}</span>
      <span className="exos-start__body">{children}</span>
      <span className="exos-start__cta">
        {href ? (
          <>
            {cta}
            <span aria-hidden="true">{external ? ' ↗' : ' →'}</span>
          </>
        ) : (
          'Coming soon'
        )}
      </span>
    </>
  );
  return href ? (
    <a className="exos-start__card" href={href} target={external ? '_blank' : '_top'} rel={external ? 'noreferrer' : undefined}>
      {body}
    </a>
  ) : (
    <div className="exos-start__card exos-start__card--soon" aria-disabled="true">
      {body}
    </div>
  );
};

// ─── Catalog ────────────────────────────────────────────────────────────────

export type CatalogItem = {
  name: string;
  description: string;
  /** Docs page id, e.g. 'components-chip--docs'. */
  docs: string;
  /** Story shown as the live preview. */
  of: unknown;
  group: string;
};

/** Searchable grid of components, each with a live preview, its name and a one-line description. */
export const Catalog = ({ items }: { items: CatalogItem[] }) => {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const shown = items
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...new Set(items.map((i) => i.group))]
      .map((group) => ({ group, items: shown.filter((i) => i.group === group) }))
      .filter((g) => g.items.length);
  }, [items, q]);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="exos-catalog">
      <label className="exos-catalog__search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="7" cy="7" r="4.75" />
          <path d="M10.5 10.5L14 14" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search by component name…"
          aria-label="Search components"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <p className="exos-catalog__count" aria-live="polite">
        {count} {count === 1 ? 'component' : 'components'}
      </p>

      {groups.map(({ group, items: groupItems }) => (
        <section key={group} className="exos-catalog__group">
          <h2 className="exos-catalog__group-title">{group}</h2>
          <div className="exos-catalog__grid">
            {groupItems.map((item) => (
              <article key={item.name} className="exos-catalog__item">
                <div className="exos-catalog__preview">
                  <div className="exos-catalog__stage" inert>
                    <Story of={item.of as never} inline />
                  </div>
                  {/* Whole preview opens the docs; the name link below is the keyboard target. */}
                  <a className="exos-catalog__cover" href={docsHref(item.docs)} target="_top" tabIndex={-1} aria-hidden="true" />
                </div>
                <a className="exos-catalog__name" href={docsHref(item.docs)} target="_top">
                  {item.name}
                </a>
                <p className="exos-catalog__description">{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      {!count && <p className="exos-catalog__empty">No components match “{query}”.</p>}
    </div>
  );
};
