import * as v from 'valibot';

import { Api } from '../_generated/Api';
import { getApiUrl } from '../features/apiUrlManager/ApiUrlManager';

let api: Api<unknown> | undefined;

const responseWithErrorSchema = v.object({
  error: v.object({
    error: v.string(),
    code: v.optional(v.number()),
  }),
  status: v.number(),
});

const apiErrors: Record<number, string> = {
  404: 'Resource not found',
  2000: 'Search is not configured. Please go to settings and fill required fields.',
  2001: 'Provided configuration for search seems to be invalid.',
  2002: 'You exceeded limits for search. Please update your Taddy plan.',
  2100: 'Provided rss seems to be invalid.',
  2101: 'Podcast with given rss url already exists.',
  2102: 'Unable to add podcast because of server error.',
  2103: 'Unable to add podcast because of server error.',
};

export class ApiError extends Error {
  #code?: number | undefined;

  constructor(message: string, options?: ErrorOptions & { code?: number | undefined }) {
    super(message, options);

    this.#code = options?.code;
  }

  get code() {
    return this.#code;
  }

  static fromResponse(response: unknown) {
    const parsedError = v.safeParse(responseWithErrorSchema, response);

    if (parsedError.success) {
      if (parsedError.output.status === 404) {
        return new ApiError(getApiErrorMessage(404), {
          code: 404,
        });
      }

      return new ApiError(parsedError.output.error.error, {
        code: parsedError.output.error.code,
      });
    }

    return new ApiError('Unknown api error.');
  }
}

export function getApiClient() {
  if (!api) {
    api = new Api({
      baseUrl: getApiUrl(),
    });
  }

  return api;
}

export function getApiErrorMessage(code: number | undefined) {
  const defaultMessage = 'Unknown error message';

  if (!code) {
    return defaultMessage;
  }

  return code in apiErrors && typeof apiErrors[code] === 'string'
    ? apiErrors[code]
    : defaultMessage;
}

export function createApiEndpointUrl(endpoint: string) {
  return new URL(endpoint, getApiUrl()).toString();
}

export type * from '../_generated/Api';
