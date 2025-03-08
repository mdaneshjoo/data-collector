export function unwrapError(err) {
    // If the error is an AggregateError and has a non-empty errors array, unwrap recursively.
    if (err instanceof AggregateError && Array.isArray(err.errors) && err.errors.length > 0) {
      return unwrapError(err.errors[0]);
    }
    // If the error has a 'cause' that is an AggregateError, unwrap it.
    if (err.cause instanceof AggregateError && Array.isArray(err.cause.errors) && err.cause.errors.length > 0) {
      return unwrapError(err.cause.errors[0]);
    }
    return err;
  }