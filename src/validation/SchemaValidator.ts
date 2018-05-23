import { Schema, Validator, ValidatorResult } from "jsonschema";
import {
  EventumConfigSchema,
  EventumConfigProviderSchema,
  EventumAWSConfigSchema,
  EventumAWSLambdasConfigSchema,
  EventumAWSLambdaConfigSchema
} from "./schema/EventumConfigSchema";
import { EventumConfig } from "../config/EventumConfig";

/**
 * Validator for JSON schemas.
 */
export class SchemaValidator {
  public static getEventumConfigValidator(): Validator {
    const validator = new Validator();
    validator.addSchema(EventumConfigSchema, EventumConfigSchema.id);
    validator.addSchema(EventumConfigProviderSchema, EventumConfigProviderSchema.id);
    validator.addSchema(EventumAWSConfigSchema, EventumAWSConfigSchema.id);
    validator.addSchema(EventumAWSLambdasConfigSchema, EventumAWSLambdasConfigSchema.id);
    validator.addSchema(EventumAWSLambdaConfigSchema, EventumAWSLambdaConfigSchema.id);

    return validator;
  }

  public static validateEventumConfig(config: EventumConfig): ValidatorResult {
    const validator = this.getEventumConfigValidator();
    return validator.validate(config, EventumConfigSchema);
  }
}
