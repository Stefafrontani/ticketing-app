import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    // Salt produces a random string
    const salt = randomBytes(8).toString("hex");
    // Scrypt produces a buffer, an array with raw data inside.
    // We tell TS what is the value type return by the scryptAsync func
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    // We .toString the buffer because... yeah, it's a buffer.
    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPassword;
  }
}
