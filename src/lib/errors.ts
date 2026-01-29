export class CriticalExtractionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'CriticalExtractionError';
  }
}

export class TimeoutError extends CriticalExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'TimeoutError';
  }
}

export class RenderingError extends CriticalExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'RenderingError';
  }
}

export class NetworkError extends CriticalExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends CriticalExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'ValidationError';
  }
}