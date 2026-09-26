/**
 * The outlines of the Element kinds, built from their Draw records for any Renderer. Shared by the
 * Renderer entries and never exported from the engine: a Draw record carries parameters, and each
 * Renderer builds geometry from them (ADR-0013).
 */

import type { CircleRecord, DrawRecord, PathRecord } from './draw-list.js';

/**
 * What an outline is traced with. A Canvas 2D context is one as it stands; an SVG Renderer builds
 * path data with one.
 */
export interface Pen {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
}

/** A record whose outline is traced. A circle and a custom path each have a primitive of their own. */
export type TracedRecord = Exclude<DrawRecord, CircleRecord | PathRecord>;

/** Trace `record`'s outline with `pen`, centred on (0, 0) and pointing at 12 o'clock. */
export function trace(record: TracedRecord, pen: Pen): void {
  const { radius } = record;
  switch (record.kind) {
    case 'polygon':
      ring(pen, record.points, radius, radius);
      return;
    case 'star':
      ring(pen, record.points * 2, radius, radius * record.innerRadius);
      return;
    case 'cross':
      pen.moveTo(0, -radius);
      pen.lineTo(0, radius);
      pen.moveTo(-radius, 0);
      pen.lineTo(radius, 0);
      return;
    case 'line':
      pen.moveTo(0, -radius);
      pen.lineTo(0, radius);
      return;
    case 'zigzag': {
      const last = record.points - 1;
      pen.moveTo(0, -radius);
      for (let corner = 1; corner <= last; corner++) {
        const swing = corner === last ? 0 : corner % 2 === 1 ? record.amplitude : -record.amplitude;
        pen.lineTo(swing, -radius + (2 * radius * corner) / last);
      }
      return;
    }
  }
}

/**
 * A closed ring of `corners` corners, clockwise from 12 o'clock, alternating `outer` and `inner`
 * from the centre, starting with `outer`.
 */
function ring(pen: Pen, corners: number, outer: number, inner: number): void {
  for (let corner = 0; corner < corners; corner++) {
    const distance = corner % 2 === 0 ? outer : inner;
    const angle = (2 * Math.PI * corner) / corners;
    const x = distance * Math.sin(angle);
    const y = -distance * Math.cos(angle);
    if (corner === 0) pen.moveTo(x, y);
    else pen.lineTo(x, y);
  }
  pen.closePath();
}
