export type FieldSize = 'sm' | 'md' | 'lg';
export type ValidationState = 'none' | 'valid' | 'invalid';

let nextId = 0;

/** A page-unique id, for wiring labels, help text and feedback to their controls. */
export function uniqueId(prefix: string): string {
  return `${prefix}-${++nextId}`;
}
