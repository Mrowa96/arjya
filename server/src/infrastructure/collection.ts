import * as v from 'valibot';

export const MIN_LIMIT = 10;
export const MAX_LIMIT = 50;

export const totalSchema = v.object({ total: v.number() });

export function createCollectionSchema<T>(itemSchema: v.GenericSchema<T>) {
  return v.object({
    items: v.array(itemSchema),
    meta: v.object({
      total: v.number(),
      limit: v.number(),
      offset: v.number(),
    }),
  });
}

export function createEmptyCollection(limit: number, offset: number) {
  return {
    items: [],
    meta: {
      total: 0,
      limit,
      offset,
    },
  };
}

export function useLimitGuard(limit: number) {
  if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
    throw new Error(`Limit has to between ${MIN_LIMIT} and ${MAX_LIMIT}, used ${limit}`);
  }
}

export type Collection<TItem> = {
  items: TItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
