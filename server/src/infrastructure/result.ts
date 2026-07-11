export class ResultError extends Error {
  #code?: number | undefined;

  constructor(message: string, options?: ErrorOptions & { code?: number }) {
    super(message, options);

    this.#code = options?.code;
  }

  get code() {
    return this.#code;
  }
}

export const resultErrorConst = {
  // 1000 - 1999 -> system wide, generic ones
  // 2000 - 9999 -> detailed ones
  SEARCH_NOT_CONFIGURED: 2000,
  SEARCH_CONFIG_INVALID: 2001,
  SEARCH_API_LIMIT_EXCEEDED: 2002,
  ADD_PODCAST_INVALID_RSS: 2100,
  ADD_PODCAST_ALREADY_EXISTS: 2101,
  ADD_PODCAST_DB_INSERT_FAILED: 2102,
  ADD_PODCAST_DB_EPISODES_INSERT_FAILED: 2103,
};

export type Result<T = unknown> =
  { isSuccess: true; data: T } | { isSuccess: false; error: ResultError };
