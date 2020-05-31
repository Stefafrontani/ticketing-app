export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    // Likehaving this when you throw an error: throw new Error('This string')
    // For loggin purpose, note shown to the final users ever.
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
