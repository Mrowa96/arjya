type SuccessfulResult<T> = [T, null];

type FailedResult = [null, Error];

export async function tryCatch<T>(
  fn: () => Promise<T>,
  logError = false,
): Promise<FailedResult | SuccessfulResult<T>> {
  try {
    return [await fn(), null];
  } catch (error) {
    let preparedError: Error;

    if (!(error instanceof Error)) {
      preparedError = new Error(String(error));
    } else {
      preparedError = error;
    }

    if (logError) {
      console.error(preparedError);
    }

    return [null, preparedError];
  }
}

export function tryCatchSync<T>(fn: () => T, logError = false): SuccessfulResult<T> | FailedResult {
  try {
    return [fn(), null];
  } catch (error) {
    let preparedError: Error;

    if (!(error instanceof Error)) {
      preparedError = new Error(String(error));
    } else {
      preparedError = error;
    }

    if (logError) {
      console.error(preparedError);
    }

    return [null, preparedError];
  }
}
