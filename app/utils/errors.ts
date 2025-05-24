export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class CalendarError extends AppError {
  constructor(message: string = 'Calendar error occurred') {
    super(message, 'CALENDAR_ERROR', 400);
    this.name = 'CalendarError';
  }
}

export class MeetingError extends AppError {
  constructor(message: string = 'Meeting error occurred') {
    super(message, 'MEETING_ERROR', 400);
    this.name = 'MeetingError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
} 