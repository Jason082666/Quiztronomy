class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.type = "custom error";
    Error.captureStackTrace(this, this.constructor);
  }
}

class ParameterError extends CustomError {
  constructor(params, statusCode) {
    const message = `Lacking parameters: ${params.join(", ")}`;
    super(message, statusCode);
    this.isOperational = true;
    this.type = "Parameter error";
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthenticateError extends CustomError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.isOperational = true;
    this.type = "Authentication error";
    Error.captureStackTrace(this, this.constructor);
  }
}

class TypeError extends CustomError {
  constructor(obj, statusCode) {
    const message = `Type error: ${Object.entries(obj)
      .map(([key, value]) => `${key} should be ${typeof value} type`)
      .join(", ")}`;
    super(message, statusCode);
    this.isOperational = true;
    this.type = "Type error";
    Error.captureStackTrace(this, this.constructor);
  }
}

const errors = {
  CustomError,
  ParameterError,
  AuthenticateError,
  TypeError,
};

export default errors;
