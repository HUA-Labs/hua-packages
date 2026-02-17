/**
 * GEO Metadata Validator
 *
 * Validates GEO (Generative Engine Optimization) metadata against Schema.org specifications.
 * Ensures that generated JSON-LD is valid and follows best practices for AI search engines.
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate a single JSON-LD object
 */
export function validateJsonLd(jsonLd: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!jsonLd['@context']) {
    errors.push({
      field: '@context',
      message: '@context is required',
      severity: 'error',
    });
  } else if (jsonLd['@context'] !== 'https://schema.org') {
    errors.push({
      field: '@context',
      message: '@context must be "https://schema.org"',
      severity: 'error',
    });
  }

  if (!jsonLd['@type']) {
    errors.push({
      field: '@type',
      message: '@type is required',
      severity: 'error',
    });
  }

  if (!jsonLd.name) {
    errors.push({
      field: 'name',
      message: 'name is required',
      severity: 'error',
    });
  } else if (typeof jsonLd.name !== 'string' || jsonLd.name.length === 0) {
    errors.push({
      field: 'name',
      message: 'name must be a non-empty string',
      severity: 'error',
    });
  }

  if (!jsonLd.description) {
    errors.push({
      field: 'description',
      message: 'description is required',
      severity: 'error',
    });
  } else if (typeof jsonLd.description !== 'string' || jsonLd.description.length < 10) {
    warnings.push({
      field: 'description',
      message: 'description should be at least 10 characters for better AI understanding',
      severity: 'warning',
    });
  }

  // Type-specific validation
  if (jsonLd['@type'] === 'SoftwareApplication') {
    validateSoftwareApplication(jsonLd, errors, warnings);
  } else if (jsonLd['@type'] === 'WebSite') {
    validateWebSite(jsonLd, errors, warnings);
  }

  // URL validation
  if (jsonLd.url && !isValidUrl(jsonLd.url)) {
    errors.push({
      field: 'url',
      message: 'url must be a valid HTTP(S) URL',
      severity: 'error',
    });
  }

  // Author validation
  if (jsonLd.author) {
    if (typeof jsonLd.author === 'object') {
      if (!jsonLd.author.name) {
        errors.push({
          field: 'author.name',
          message: 'author.name is required when author is an object',
          severity: 'error',
        });
      }
    } else if (typeof jsonLd.author !== 'string') {
      errors.push({
        field: 'author',
        message: 'author must be a string or object',
        severity: 'error',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate SoftwareApplication specific fields
 */
function validateSoftwareApplication(
  jsonLd: any,
  errors: ValidationError[],
  warnings: ValidationError[]
) {
  // applicationCategory
  if (jsonLd.applicationCategory && typeof jsonLd.applicationCategory !== 'string') {
    errors.push({
      field: 'applicationCategory',
      message: 'applicationCategory must be a string',
      severity: 'error',
    });
  }

  // softwareVersion
  if (jsonLd.softwareVersion && typeof jsonLd.softwareVersion !== 'string') {
    errors.push({
      field: 'softwareVersion',
      message: 'softwareVersion must be a string',
      severity: 'error',
    });
  }

  // offers
  if (jsonLd.offers) {
    if (typeof jsonLd.offers !== 'object') {
      errors.push({
        field: 'offers',
        message: 'offers must be an object',
        severity: 'error',
      });
    } else {
      if (jsonLd.offers['@type'] !== 'Offer') {
        errors.push({
          field: 'offers.@type',
          message: 'offers.@type must be "Offer"',
          severity: 'error',
        });
      }

      if (!jsonLd.offers.price) {
        warnings.push({
          field: 'offers.price',
          message: 'offers.price is recommended',
          severity: 'warning',
        });
      }
    }
  }

  // operatingSystem
  if (jsonLd.operatingSystem && typeof jsonLd.operatingSystem !== 'string') {
    errors.push({
      field: 'operatingSystem',
      message: 'operatingSystem must be a string',
      severity: 'error',
    });
  }

  // Warnings for recommended fields
  if (!jsonLd.applicationCategory) {
    warnings.push({
      field: 'applicationCategory',
      message: 'applicationCategory is recommended for better categorization',
      severity: 'warning',
    });
  }

  if (!jsonLd.offers) {
    warnings.push({
      field: 'offers',
      message: 'offers is recommended to indicate pricing',
      severity: 'warning',
    });
  }
}

/**
 * Validate WebSite specific fields
 */
function validateWebSite(jsonLd: any, errors: ValidationError[], _warnings: ValidationError[]) {
  if (!jsonLd.url) {
    errors.push({
      field: 'url',
      message: 'url is required for WebSite',
      severity: 'error',
    });
  }

  if (!jsonLd.name) {
    errors.push({
      field: 'name',
      message: 'name is required for WebSite',
      severity: 'error',
    });
  }
}

/**
 * Simple URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate GEO metadata (multiple JSON-LD objects)
 */
export function validateGEOMetadata(jsonLdArray: any[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  if (!Array.isArray(jsonLdArray)) {
    return {
      valid: false,
      errors: [
        {
          field: 'root',
          message: 'GEO metadata must be an array of JSON-LD objects',
          severity: 'error',
        },
      ],
      warnings: [],
    };
  }

  if (jsonLdArray.length === 0) {
    return {
      valid: false,
      errors: [
        {
          field: 'root',
          message: 'GEO metadata must contain at least one JSON-LD object',
          severity: 'error',
        },
      ],
      warnings: [],
    };
  }

  jsonLdArray.forEach((jsonLd, index) => {
    const result = validateJsonLd(jsonLd);

    // Prefix errors with index
    result.errors.forEach((error) => {
      allErrors.push({
        ...error,
        field: `[${index}].${error.field}`,
      });
    });

    result.warnings.forEach((warning) => {
      allWarnings.push({
        ...warning,
        field: `[${index}].${warning.field}`,
      });
    });
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Format validation result as human-readable string
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✅ GEO metadata is valid');
  } else {
    lines.push('❌ GEO metadata validation failed');
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach((error) => {
      lines.push(`  - ${error.field}: ${error.message}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach((warning) => {
      lines.push(`  - ${warning.field}: ${warning.message}`);
    });
  }

  return lines.join('\n');
}
