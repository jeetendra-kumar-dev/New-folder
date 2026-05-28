import type { Request, RequestHandler } from "express";
import type { z } from "zod";

type RequestSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Request["params"];
    }

    if (schemas.query) {
      res.locals.validatedQuery = schemas.query.parse(req.query) as Request["query"];
    }

    next();
  };
}
