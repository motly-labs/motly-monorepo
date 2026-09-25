/**
 * The units one kind of property accepts, each as a multiple of the unit its Draw record uses.
 * Only units that convert without reading layout: core never knows what `em` or `%` is.
 */
export type Units = Readonly<Record<string, number>>;

export const LENGTH = { px: 1 } as const satisfies Units;
export const ANGLE = { deg: 1, rad: 180 / Math.PI, turn: 360 } as const satisfies Units;
export const TIME = { s: 1, ms: 0.001 } as const satisfies Units;
export const UNITLESS = {} as const satisfies Units;

const NUMBER_WITH_UNIT = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z]*)$/i;

/**
 * `value`, a number followed by a unit, in the unit a Draw record uses, or `undefined` if the unit
 * is not one of `units`.
 */
export function toNumber(value: string, units: Units): number | undefined {
  const match = NUMBER_WITH_UNIT.exec(value);
  const unit = match?.[2]?.toLowerCase();
  if (match?.[1] === undefined || unit === undefined || !Object.hasOwn(units, unit)) return;
  return Number(match[1]) * (units[unit] as number);
}
