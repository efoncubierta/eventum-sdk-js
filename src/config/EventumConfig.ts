export interface EventumConfig {
  provider: EventumProvider;
  serviceName: string;
  stage: string;
  aws: EventumAWSConfig;
}

export enum EventumProvider {
  AWS = "AWS",
  INMEMORY = "INMEMORY"
}

export interface EventumAWSConfig {
  lambdas: EventumAWSLambdasConfig;
}

export interface EventumAWSLambdasConfig {
  saveSnapshot: EventumAWSLambdaConfig;
  getJournal: EventumAWSLambdaConfig;
  saveEvents: EventumAWSLambdaConfig;
}

export interface EventumAWSLambdaConfig {
  functionName: string;
}

export const EventumConfigDefault: EventumConfig = {
  provider: EventumProvider.AWS,
  serviceName: "eventum",
  stage: "dev",
  aws: {
    lambdas: {
      getJournal: {
        functionName: "api-getJournal"
      },
      saveEvents: {
        functionName: "api-saveEvents"
      },
      saveSnapshot: {
        functionName: "api-saveSnapshot"
      }
    }
  }
};
