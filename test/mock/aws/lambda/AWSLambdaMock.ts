// External dependencies
import * as AWS from "aws-sdk-mock";

// Eventum configuration
import { Eventum } from "../../../../src/Eventum";

// Eventum test dependencies
import { AWSLambdaInvokeMock } from "./AWSLambdaInvokeMock";
import { SaveSnapshotMock } from "./SaveSnapshotMock";
import { GetJournalMock } from "./GetJournalMock";
import { SaveEventsMock } from "./SaveEventsMock";

/**
 * Mock AWS Lambda API.
 */
export class AWSLambdaMock {
  private static lambdaInvokeMocks = {};

  /**
   * Register an Lambda.invoke() mock.
   *
   * @param mock AWS Lambda.invoke() mock
   */
  private static addLambdaInvokeMock(mock: AWSLambdaInvokeMock) {
    AWSLambdaMock.lambdaInvokeMocks[mock.getFunctionName()] = mock;
  }

  /**
   * Mock for Lambda.invoke(). It'll find a mock among the registered mocks and use it to
   * handle the call.
   *
   * @param params Lambda.invoke() call parameters
   * @param callback Callback
   */
  private static lambdaInvokeMock(params, callback) {
    if (AWSLambdaMock.lambdaInvokeMocks[params.FunctionName]) {
      AWSLambdaMock.lambdaInvokeMocks[params.FunctionName].handle(params, callback);
    } else {
      return callback(new Error("This Lambda.invoke() call hasn't been mocked."));
    }
  }

  /**
   * Enable the AWS mockup.
   */
  public static enableMock(): void {
    AWSLambdaMock.addLambdaInvokeMock(new SaveSnapshotMock());
    AWSLambdaMock.addLambdaInvokeMock(new GetJournalMock());
    AWSLambdaMock.addLambdaInvokeMock(new SaveEventsMock());

    AWS.mock("Lambda", "invoke", AWSLambdaMock.lambdaInvokeMock);
  }

  /**
   * Restore AWS mockup back to normal.
   */
  public static restoreMock(): void {
    AWS.restore("Lambda");
  }
}
