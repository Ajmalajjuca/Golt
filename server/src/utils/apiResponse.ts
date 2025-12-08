import { Response } from 'express';

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  [key: string]: any;
}

/**
 * Utility class for standardized API responses
 */
export class ApiResponse {
  /**
   * Send a success response
   */
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    message = 'Error',
    statusCode = 500,
    errors: any = null
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: T,
    pagination: Pagination
  ): Response {
    return res.status(200).json({
      success: true,
      data,
      pagination,
    });
  }
}
