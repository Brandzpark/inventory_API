module.exports = class ValidationException extends Error {
  constructor(message) {
    super(message)
    Error.captureStackTrace(this, this.constructor);

    this.code = 422;
    this.success = false;
    this.name = this.constructor.name
    this.errors = message;
    if (message?.errorResponse?.keyValue && Object.keys(message?.errorResponse?.keyValue)?.length > 0) {
      this.errors = Object.keys(message?.errorResponse?.keyValue)?.reduce((acc, key) => {
        acc[key] = `"${message?.errorResponse?.keyValue[key]}" ${key} already taken`;
        return acc;
      }, {})
    }
  }

  statusCode() {
    return this.code
  }
}

