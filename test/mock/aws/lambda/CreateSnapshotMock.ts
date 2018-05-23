import { InMemoryJournalStore } from "../../InMemoryJournalStore";
import { InMemorySnapshotStore } from "../../InMemorySnapshotStore";
import { Snapshot } from "../../../../src/model/Snapshot";
import { Journal } from "../../../../src/model/Journal";
import { Event } from "../../../../src/model/Event";
import { AWSLambdaInvokeMock } from "./AWSLambdaInvokeMock";

/**
 * Mock for the 'createSnapshot' lambda function.
 */
export class CreateSnapshotMock implements AWSLambdaInvokeMock {
  public static CREATE_SNAPSHOT_FUNCTION_NAME = "createSnapshot_test";

  public getFunctionName(): string {
    return CreateSnapshotMock.CREATE_SNAPSHOT_FUNCTION_NAME;
  }

  public handle(params, callback: (error?: Error, response?: any) => void): void {
    const jsonPayload = JSON.parse(params.Payload);

    // JournalDynamoDBStore.getEvent()
    const aggregateId: string = jsonPayload.aggregateId;
    const sequence: number = jsonPayload.sequence;
    const payload = jsonPayload.payload;

    const snapshot = new Snapshot(aggregateId, sequence, payload);

    callback(null, {
      StatusCode: 200,
      Payload: InMemorySnapshotStore.putSnapshot(snapshot)
    });
  }
}
