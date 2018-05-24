// in-memory connectors
import { InMemoryJournalConnector } from "../../../../src/connector/inmemory/InMemoryJournalConnector";

// model
import { Snapshot } from "../../../../src/model/Snapshot";
import { Journal } from "../../../../src/model/Journal";
import { Event } from "../../../../src/model/Event";

import { AWSLambdaInvokeMock } from "./AWSLambdaInvokeMock";

/**
 * Mock for the 'createSnapshot' lambda function.
 */
export class CreateSnapshotMock implements AWSLambdaInvokeMock {
  public static CREATE_SNAPSHOT_FUNCTION_NAME = "createSnapshot_test";

  private journalConnector = new InMemoryJournalConnector();

  public getFunctionName(): string {
    return CreateSnapshotMock.CREATE_SNAPSHOT_FUNCTION_NAME;
  }

  public handle(params, callback: (error?: Error, response?: any) => void): void {
    const jsonPayload = JSON.parse(params.Payload);

    const aggregateId: string = jsonPayload.aggregateId;
    const sequence: number = jsonPayload.sequence;
    const payload = jsonPayload.payload;

    this.journalConnector.createSnapshot(aggregateId, sequence, payload).then(() => {
      callback(null, {
        StatusCode: 200
      });
    });
  }
}
