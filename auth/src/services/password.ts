import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

let scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    let salt = randomBytes(8).toString("hex");
    let buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    let [hash, salt] = storedPassword.split(".");
    let buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return buf.toString("hex") === hash;
  }
}
