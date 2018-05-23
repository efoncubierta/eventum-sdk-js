import { AWSLambdaMock } from "./lambda";

/**
 * Mock AWS API.
 */
export class AWSMock {
  /**
   * Enable the AWS mockup.
   */
  public static enableMock(): void {
    AWSLambdaMock.enableMock();
  }

  /**
   * Restore AWS mockup back to normal.
   */
  public static restoreMock(): void {
    AWSLambdaMock.restoreMock();
  }
}
