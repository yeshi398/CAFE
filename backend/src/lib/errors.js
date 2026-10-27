/** Error with an HTTP status. Thrown anywhere; turned into JSON by the error handler. */
export class ApiError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}
