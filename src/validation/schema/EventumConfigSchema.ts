import { Schema } from "jsonschema";

export const EventumConfigSchema: Schema = {
  id: "/Eventum/Config",
  type: "object",
  properties: {
    provider: {
      $ref: "/Eventum/Config/Provider"
    },
    aws: {
      $ref: "/Eventum/Config/AWS"
    }
  },
  required: ["provider", "aws"]
};

export const EventumConfigProviderSchema: Schema = {
  id: "/Eventum/Config/Provider",
  type: "string",
  enum: ["AWS", "INMEMORY"]
};

export const EventumAWSConfigSchema: Schema = {
  id: "/Eventum/Config/AWS",
  type: "object",
  properties: {
    lambdas: {
      $ref: "/Eventum/Config/AWS/Lambdas"
    }
  },
  required: ["lambdas"]
};

export const EventumAWSLambdasConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/Lambdas",
  type: "object",
  properties: {
    saveSnapshot: {
      $ref: "/Eventum/Config/AWS/Lambda"
    },
    getJournal: {
      $ref: "/Eventum/Config/AWS/Lambda"
    },
    saveEvents: {
      $ref: "/Eventum/Config/AWS/Lambda"
    }
  },
  required: ["saveSnapshot", "getJournal", "saveEvents"]
};

export const EventumAWSLambdaConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/Lambda",
  type: "object",
  properties: {
    functionName: {
      type: "string"
    }
  },
  required: ["functionName"]
};
