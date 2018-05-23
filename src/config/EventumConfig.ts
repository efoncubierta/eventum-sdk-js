import * as yaml from "js-yaml";
import * as fs from "fs";

export interface EventumConfig {
  provider?: EventumProvider;
  aws?: EventumAWSConfig;
}

export enum EventumProvider {
  AWS = "AWS"
}

export interface EventumAWSConfig {
  lambdas?: EventumAWSLambdasConfig;
}

export interface EventumAWSLambdasConfig {
  createSnapshot?: EventumAWSLambdaConfig;
  getJournal?: EventumAWSLambdaConfig;
  saveEvents?: EventumAWSLambdaConfig;
}

export interface EventumAWSLambdaConfig {
  functionName: string;
}
