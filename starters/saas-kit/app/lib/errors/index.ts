/**
 * Unified error system barrel export
 *
 * @example
 *   import { apiError, unauthorized, Errors } from '@/app/lib/errors';
 *
 * @see docs/areas/architecture/error-code-system.md
 */

export { Errors, type ErrorCode } from "./error-codes";
export {
  apiError,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  internalError,
} from "./create-error";
