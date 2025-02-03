import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

const validateRequest =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body); // Validate request body
      next(); // Call next middleware if validation passes
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          responseCode: 0,
          message: "Invalid request data",
          errors: error.format(),
        });
      } else {
        res.status(500).json({responseCode: 0, message: "Internal Server Error" });
      }
    }
  };

export default validateRequest;
