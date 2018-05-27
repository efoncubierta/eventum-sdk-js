import { Lambda } from "aws-sdk";
import { Eventum } from "../../Eventum";
import { EventumAWSLambdaConfig, EventumAWSConfig } from "../../config/EventumConfig";
import { JournalConnector } from "../JournalConnector";
import { AWSConnector } from "./AWSConnector";
import { Journal } from "../../model/Journal";
import { Event } from "../../model/Event";

/**
 * Journal connector for AWS.
 */
export class AWSJournalConnector extends AWSConnector implements JournalConnector {
  private readonly awsConfig: EventumAWSConfig;
  private readonly saveSnapshotFunctionName: string;
  private readonly getJournalFunctionName: string;
  private readonly saveEventsFunctionName: string;

  constructor() {
    super();
    this.awsConfig = Eventum.config().aws;
    this.saveSnapshotFunctionName = this.awsConfig.lambdas.saveSnapshot.functionName;
    this.getJournalFunctionName = this.awsConfig.lambdas.getJournal.functionName;
    this.saveEventsFunctionName = this.awsConfig.lambdas.saveEvents.functionName;
  }

  public saveSnapshot(aggregateId: string, sequence: number, payload: any): Promise<void> {
    const lambda = new Lambda();

    return lambda
      .invoke({
        FunctionName: this.saveSnapshotFunctionName,
        Payload: JSON.stringify({
          aggregateId,
          sequence,
          payload
        })
      })
      .promise()
      .then((value) => {
        // handle AWS Lambda errors
        if (value.StatusCode !== 200) {
          throw new Error(value.Payload as string);
        }

        const response = JSON.parse(value.Payload as string);

        // handle Eventum errors
        if (response.$type !== "Success") {
          throw new Error(response.message);
        }

        return null;
      });
  }

  public getJournal(aggregateId: any): Promise<Journal> {
    const lambda = new Lambda();

    return lambda
      .invoke({
        FunctionName: this.getJournalFunctionName,
        Payload: JSON.stringify({
          aggregateId
        })
      })
      .promise()
      .then((value) => {
        // handle AWS Lambda errors
        if (value.StatusCode !== 200) {
          throw new Error(value.Payload as string);
        }

        const response = JSON.parse(value.Payload as string);

        // handle Eventum errors
        if (response.$type !== "Success") {
          throw new Error(response.message);
        }

        return response.journal as Journal;
      });
  }

  public saveEvents(events: Array<Event<any>>): Promise<void> {
    const lambda = new Lambda();
    return lambda
      .invoke({
        FunctionName: this.saveEventsFunctionName,
        Payload: JSON.stringify({
          events
        })
      })
      .promise()
      .then((value) => {
        // handle AWS Lambda errors
        if (value.StatusCode !== 200) {
          throw new Error(value.Payload as string);
        }

        const response = JSON.parse(value.Payload as string);

        // handle Eventum errors
        if (response.$type !== "Success") {
          throw new Error(response.message);
        }

        return null;
      });
  }
}
