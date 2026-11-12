export type FieldSize = 'sm' | 'md' | 'lg';
export type ValidationState = 'none' | 'valid' | 'invalid';
/** Warning is for answers that are allowed but probably wrong. */
export type FieldState = ValidationState | 'warning';

let nextId = 0;

/** A page-unique id, for wiring labels, help text and feedback to their controls. */
export function uniqueId(prefix: string): string {
  return `${prefix}-${++nextId}`;
}
