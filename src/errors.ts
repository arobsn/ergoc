export class ErgoCompilerError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}

export class FileNotFoundError extends ErgoCompilerError {
  constructor(filename: string) {
    super(`Couldn't find script file: ${filename}`);
    this.name = "FileNotFoundError";
  }
}
