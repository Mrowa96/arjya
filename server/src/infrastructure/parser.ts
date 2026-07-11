import { type BaseIssue, type BaseSchema, safeParse } from 'valibot';

export function parseData<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  data: unknown,
  schema: TSchema,
) {
  const parseResult = safeParse(schema, data);

  if (!parseResult.success) {
    console.error('Parsing issues found.', parseResult.issues);

    return null;
  }

  return parseResult.output;
}
