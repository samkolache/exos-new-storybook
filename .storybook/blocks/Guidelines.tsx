import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Story } from '@storybook/addon-docs/blocks';
import './guidelines.css';

// ─── On this page ───────────────────────────────────────────────────────────

type NavItem = { id: string; text: string };

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * "On this page" navigation: a sticky list of the page's sections (h2) on the right, highlighting
 * the one being read. On narrow screens it sits at the top of the page instead.
 */
export const PageNav = () => {
  const [items, setItems] = useState<NavItem[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    document.body.classList.add('exos-has-pagenav');
    // Wait a frame so every section on the page has rendered.
    const raf = requestAnimationFrame(() => {
      const content = document.querySelector('.sbdocs-content');
      const nodes = [...(content?.querySelectorAll<HTMLElement>('h2') ?? [])].filter(
        (el) => !el.classList.contains('sbdocs-subtitle') && !el.closest('.sbdocs-subtitle') && el.textContent?.trim(),
      );
      const sections: NavItem[] = nodes.map((el) => {
        if (!el.id) el.id = slug(el.textContent ?? '');
        return { id: el.id, text: el.textContent!.trim() };
      });
      setItems(sections);
      const onScroll = () => {
        let current = sections[0]?.id ?? '';
        for (const h of sections) {
          const el = document.getElementById(h.id);
          if (el && el.getBoundingClientRect().top <= 140) current = h.id;
        }
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1)?.id ?? current;
        setActive(current);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanup = () => window.removeEventListener('scroll', onScroll);
    });
    let cleanup = () => {};
    return () => {
      cancelAnimationFrame(raf);
      cleanup();
      document.body.classList.remove('exos-has-pagenav');
    };
  }, []);

  if (!items.length) return null;
  return (
    <nav className="exos-pagenav" aria-label="On this page">
      <p className="exos-pagenav__title">On this page</p>
      <ul>
        {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={active === item.id ? 'is-active' : ''}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActive(item.id);
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
      </ul>
    </nav>
  );
};

// ─── Page header, section strips, half markers ─────────────────────────────

/** Status, Figma link, code tag and last update, under the title. */
export const ComponentMeta = ({ status, figma, code, updated }: { status: 'Stable' | 'Beta' | 'Draft'; figma?: string; code?: string; updated?: string }) => (
  <div className="exos-meta">
    <span className={`exos-meta__status exos-meta__status--${status.toLowerCase()}`}>{status}</span>
    {figma && (
      <a href={figma} target="_blank" rel="noreferrer">
        Figma ↗
      </a>
    )}
    {code && (
      <span>
        Code · <code>{code}</code>
      </span>
    )}
    {updated && <span>Updated · {updated}</span>}
  </div>
);

// ─── Do / Don't ─────────────────────────────────────────────────────────────

/** A grid of Do / Don't cards. */
export const DoDont = ({ children }: { children: React.ReactNode }) => <div className="exos-dodont">{children}</div>;

/** One card: a live example, a green ✓ or red ✕, and a one-line caption. */
export const Guideline = ({ type, of, children }: { type: 'do' | 'dont'; of: unknown; children: React.ReactNode }) => (
  <figure className={`exos-guideline exos-guideline--${type}`}>
    <div className="exos-guideline__preview">
      <span className="exos-guideline__badge" aria-hidden="true">
        {type === 'do' ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6.2L4.8 8.5 9.5 3.6" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        )}
      </span>
      <div className="exos-guideline__stage" inert>
        <Story of={of as never} inline />
      </div>
    </div>
    <figcaption>
      <strong>{type === 'do' ? 'Do' : "Don't"}</strong> {children}
    </figcaption>
  </figure>
);

// ─── Specimens (edge cases) ─────────────────────────────────────────────────

export const SpecimenGrid = ({ children }: { children: React.ReactNode }) => <div className="exos-specimens">{children}</div>;

/** A live example with a one-line caption, in a dashed card. */
export const Specimen = ({ of, children }: { of: unknown; children: React.ReactNode }) => (
  <figure className="exos-specimen">
    <div className="exos-specimen__stage" inert>
      <Story of={of as never} inline />
    </div>
    <figcaption>{children}</figcaption>
  </figure>
);

// ─── Screen reader output ───────────────────────────────────────────────────

/** What assistive tech gets for one element: name, role, state and position, plus the group. */
export const ScreenReader = ({ name, role, state, position, group, description }: { name: string; role: string; state: string; position?: string; group?: string; description?: string }) => (
  <div className="exos-sr">
    <span className="exos-sr__icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 5.5h2.5L8 2.5v9L4.5 8.5H2z" />
        <path d="M10 4.5a3.5 3.5 0 010 5" />
      </svg>
    </span>
    <div>
      <q>{[name, role, state, position, group, description].filter(Boolean).join(', ')}</q>
      <div className="exos-sr__facts">
        {(
          [
            ['Name', name],
            ['Role', role],
            ['State', state],
            ['Position', position],
            ['Group', group],
            ['Description', description],
          ] as const
        )
          .filter(([, value]) => value)
          .map(([key, value]) => (
            <span key={key} className="exos-sr__fact">
              <span className="exos-sr__key">{key}</span>
              <span className="exos-sr__val">{value}</span>
            </span>
          ))}
      </div>
    </div>
  </div>
);

// ─── Related ────────────────────────────────────────────────────────────────

export const Related = ({ items }: { items: { title: string; text: string; href: string }[] }) => (
  <div className="exos-related">
    {items.map((item) => (
      <a key={item.title} href={item.href} target={/^https?:/.test(item.href) ? '_blank' : '_top'} rel="noreferrer">
        <b>{item.title}</b>
        <span>{item.text}</span>
      </a>
    ))}
  </div>
);

// ─── Specs and tokens, read live from the theme ─────────────────────────────

const px = (v: string) => `${Math.round(parseFloat(v) * 10) / 10}px`;

/**
 * Measures the real component at each size from the theme CSS, so the numbers can't drift.
 * Renders hidden samples like `<button class="chip chip-single chip-sm">`, then reads computed styles.
 */
export const SizeSpecs = ({
  baseClass,
  sizes,
  sample,
  groupClass,
  element = 'button',
  labelClass = 'chip-label',
}: {
  baseClass: string;
  sizes: { label: string; className: string }[];
  sample: string;
  groupClass?: string;
  /** The sample's element: chips are buttons, tags are spans, fields are inputs. */
  element?: 'button' | 'span' | 'input';
  labelClass?: string;
}) => {
  const host = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<string[][]>([]);
  useLayoutEffect(() => {
    const els = [...(host.current?.querySelectorAll<HTMLElement>('[data-sample]') ?? [])];
    const group = host.current?.querySelector<HTMLElement>('[data-group]');
    const cs = els.map((el) => getComputedStyle(el));
    const radius = (v: string) => (parseFloat(v) >= 999 ? 'Full' : px(v));
    const table = [
      ['Height', ...els.map((el) => px(String(el.getBoundingClientRect().height)))],
      ['Padding (top / side)', ...cs.map((c) => `${px(c.paddingTop)} / ${px(c.paddingRight)}`)],
      ['Text', ...cs.map((c) => `${px(c.fontSize)} / ${px(c.lineHeight)}, ${c.fontWeight}`)],
      ['Border', ...cs.map((c) => px(c.borderTopWidth))],
      ['Corner radius', ...cs.map((c) => radius(c.borderTopLeftRadius))],
    ];
    // Inputs have no icon gap: their icons sit in the padding.
    if (element !== 'input') table.push(['Gap (icon to text)', ...cs.map((c) => px(c.columnGap))]);
    if (group) {
      const g = getComputedStyle(group);
      table.push(['Gap between chips', ...els.map(() => px(g.columnGap))]);
    }
    setRows(table);
  }, []);
  return (
    <div className="exos-specs">
      <div ref={host} className="exos-theme-dcfc exos-specs__samples" aria-hidden="true">
        {sizes.map((s) =>
          element === 'input' ? (
            <input key={s.label} data-sample className={`${baseClass} ${s.className}`.trim()} defaultValue={sample} readOnly tabIndex={-1} />
          ) : React.createElement(
            element,
            { key: s.label, 'data-sample': true, className: `${baseClass} ${s.className}`.trim(), ...(element === 'button' ? { type: 'button', tabIndex: -1 } : {}) },
            <span className={labelClass}>{sample}</span>,
          ),
        )}
        {groupClass && <div data-group className={groupClass} />}
      </div>
      <table>
        <thead>
          <tr>
            <th />
            {sizes.map((s) => (
              <th key={s.label}>{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, ...values]) => (
            <tr key={name}>
              <td>{name}</td>
              {values.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** The CSS variables a component uses, with their live values (colour swatches where they are colours). */
export const TokenTable = ({ tokens }: { tokens: { name: string; use: string }[] }) => {
  const host = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!host.current) return;
    const cs = getComputedStyle(host.current);
    setValues(Object.fromEntries(tokens.map((t) => [t.name, cs.getPropertyValue(t.name).trim()])));
    // Measured once: the token list is fixed for a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isColor = (v: string) => /^(#|rgb|hsl)/i.test(v);
  return (
    <div ref={host} className="exos-theme-dcfc exos-tokens">
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <td>
                <code>{t.name}</code>
              </td>
              <td>
                {isColor(values[t.name] ?? '') && <span className="exos-tokens__swatch" style={{ background: values[t.name] }} />}
                <code>{values[t.name] || '—'}</code>
              </td>
              <td>{t.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

