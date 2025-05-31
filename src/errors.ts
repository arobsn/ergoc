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
  }
}

export class InvalidParameterError extends ErgoCompilerError {
  constructor(param: string, validOptions: Set<string>) {
    super(
      `Invalid parameter: '${param}'. Valid options are: ${Array.from(validOptions).join(", ")}`
    );
  }
}
