// External dependencies
import { Lambda } from "aws-sdk";
import { Option, some, none } from "fp-ts/lib/Option";

// Eventum configuration
import { Eventum } from "../../Eventum";
import { EventumConfig } from "../../config/EventumConfig";

// Eventum models
import { Event, EventInput } from "../../model/Event";
import { Journal } from "../../model/Journal";
import { SnapshotInput } from "../../model/Snapshot";
import { AggregateId } from "../../model/Common";

// Eventum connectors
import { JournalConnector } from "../JournalConnector";
import { AWSConnector } from "./AWSConnector";
import { EventumResponseType } from "../EventumResponseType";
import { EventumErrorType } from "../EventumErrorType";

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

  public saveSnapshot(snapshotInput: SnapshotInput): Promise<void> {
    const lambda = new Lambda();

    return lambda
      .invoke({
        FunctionName: this.saveSnapshotFunctionName,
        Payload: JSON.stringify(snapshotInput)
      })
      .promise()
      .then((value) => {
        // handle AWS Lambda errors
        if (value.StatusCode !== 200) {
          throw new Error(value.Payload as string);
        }

        const response = JSON.parse(value.Payload as string);

        switch (response.type) {
          // handle Eventum errors
          case EventumResponseType.ERROR:
            throw new Error(response.message);
          case EventumResponseType.OK:
            return;
          default:
            throw new Error(`Unknown response type ${response.type} from server`);
        }
      });
  }

  public getJournal(aggregateId: AggregateId): Promise<Option<Journal>> {
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

        switch (response.type) {
          // handle Eventum errors
          case EventumResponseType.ERROR:
            switch (response.errorType) {
              case EventumErrorType.NotFound:
                return none;
              default:
                throw new Error(response.message);
            }
          case EventumResponseType.OK:
            return some(response.payload as Journal);
          default:
            throw new Error(`Unknown response type ${response.type} from server`);
        }
      });
  }

  public saveEvents(eventInputs: EventInput[]): Promise<Event[]> {
    const lambda = new Lambda();
    return lambda
      .invoke({
        FunctionName: this.saveEventsFunctionName,
        Payload: JSON.stringify(eventInputs)
      })
      .promise()
      .then((value) => {
        // handle AWS Lambda errors
        if (value.StatusCode !== 200) {
          throw new Error(value.Payload as string);
        }

        const response = JSON.parse(value.Payload as string);

        switch (response.type) {
          // handle Eventum errors
          case EventumResponseType.ERROR:
            throw new Error(response.message);
          case EventumResponseType.OK:
            return response.payload as Event[];
          default:
            throw new Error(`Unknown response type ${response.type} from server`);
        }
      });
  }
}
