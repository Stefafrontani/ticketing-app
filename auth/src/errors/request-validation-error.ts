import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

// TS: Hey REquestValidationError, if you want to be ancustom error, implement .statusCode and serializeErrors()
// This is what TS will be doing with that extends syntax
export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return {
        message: err.msg,
        field: err.param,
      };
    });
  }
}
