import { Lambda } from "aws-sdk";
import { Eventum } from "../../Eventum";
import { EventumConfig } from "../../config/EventumConfig";
import { JournalConnector } from "../JournalConnector";
import { AWSConnector } from "./AWSConnector";
import { Journal } from "../../model/Journal";
import { Event } from "../../model/Event";

/**
 * Journal connector for AWS.
 */
export class AWSJournalConnector extends AWSConnector implements JournalConnector {
  private readonly config: EventumConfig;
  private readonly saveSnapshotFunctionName: string;
  private readonly getJournalFunctionName: string;
  private readonly saveEventsFunctionName: string;

  constructor() {
    super();
    this.config = Eventum.config();
    this.getJournalFunctionName = this.constructFunctionName(this.config.aws.lambdas.getJournal.functionName);
    this.saveSnapshotFunctionName = this.constructFunctionName(this.config.aws.lambdas.saveSnapshot.functionName);
    this.saveEventsFunctionName = this.constructFunctionName(this.config.aws.lambdas.saveEvents.functionName);
  }

  private constructFunctionName(functionName: string): string {
    return `${this.config.serviceName}-${this.config.stage}-${functionName}`;
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
        if (response.$type !== "Success" && response.$type !== "NotFound") {
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
