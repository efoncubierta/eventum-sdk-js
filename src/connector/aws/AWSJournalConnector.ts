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
  private readonly createSnapshotFunctionName: string;
  private readonly getJournalFunctionName: string;
  private readonly saveEventsFunctionName: string;

  constructor() {
    super();
    this.awsConfig = Eventum.config().aws;
    this.createSnapshotFunctionName = this.awsConfig.lambdas.createSnapshot.functionName;
    this.getJournalFunctionName = this.awsConfig.lambdas.getJournal.functionName;
    this.saveEventsFunctionName = this.awsConfig.lambdas.saveEvents.functionName;
  }

  public createSnapshot(aggregateId: string, sequence: number, payload: any): Promise<void> {
    const lambda = new Lambda();

    return lambda
      .invoke({
        FunctionName: this.createSnapshotFunctionName,
        Payload: JSON.stringify({
          aggregateId,
          sequence,
          payload
        })
      })
      .promise()
      .then((value) => {
        if (value.StatusCode !== 200) {
          // TODO handle error
          throw new Error();
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
        if (value.StatusCode !== 200) {
          // TODO handle error
          throw new Error();
        }

        return JSON.parse(value.Payload as string) as Journal;
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
        if (value.StatusCode !== 200) {
          // TODO handle error
          throw new Error();
        }

        return null;
      });
  }
}
