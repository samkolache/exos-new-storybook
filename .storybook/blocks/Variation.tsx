import React from 'react';
import { Canvas, Subheading } from '@storybook/addon-docs/blocks';
import './docs.css';

type Props = {
  /** Section heading, e.g. "Variant". Gets a deep-link anchor. */
  title: string;
  /** Story export to render on the right. */
  of: unknown;
  /** Guidance shown on the left (markdown). */
  children?: React.ReactNode;
};

/** One "Variations" row: guidance on the left, live example + code on the right. */
export const Variation = ({ title, of, children }: Props) => (
  <section className="exos-docs-variation">
    <div className="exos-docs-variation__text">
      <Subheading>{title}</Subheading>
      {children}
    </div>
    <div className="exos-docs-variation__example">
      <Canvas of={of as never} />
    </div>
  </section>
);
