import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodObject, ZodSchema, ZodError } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

const VALIDATION_KEYS = ["body", "query", "params"] as const;

const formatZodErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

const resolveSchemas = (schemas: ZodSchema | ValidationSchemas): ValidationSchemas => {
  if (schemas instanceof ZodObject) {
    const shapeKeys = Object.keys(schemas.shape);
    const hasValidationKeys = shapeKeys.some((k) =>
      (VALIDATION_KEYS as readonly string[]).includes(k)
    );
    if (hasValidationKeys) {
      const resolved: ValidationSchemas = {};
      for (const key of VALIDATION_KEYS) {
        if (schemas.shape[key]) {
          resolved[key] = schemas.shape[key] as ZodSchema;
        }
      }
      return resolved;
    }
  }
  if (schemas instanceof ZodSchema) {
    return { body: schemas };
  }
  return schemas;
};

export const validate = (schemas: ZodSchema | ValidationSchemas): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resolved = resolveSchemas(schemas);

    const errors: Record<string, { field: string; message: string }[]> = {};

    if (resolved.body) {
      const result = resolved.body.safeParse(req.body);
      if (!result.success) {
        errors.body = formatZodErrors(result.error);
      }
    }

    if (resolved.query) {
      const result = resolved.query.safeParse(req.query);
      if (!result.success) {
        errors.query = formatZodErrors(result.error);
      }
    }

    if (resolved.params) {
      const result = resolved.params.safeParse(req.params);
      if (!result.success) {
        errors.params = formatZodErrors(result.error);
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors,
      });
      return;
    }

    next();
  };
};

export const validateBody = (schema: ZodSchema): RequestHandler => validate({ body: schema });

export const validateQuery = (schema: ZodSchema): RequestHandler => validate({ query: schema });

export const validateParams = (schema: ZodSchema): RequestHandler => validate({ params: schema });
