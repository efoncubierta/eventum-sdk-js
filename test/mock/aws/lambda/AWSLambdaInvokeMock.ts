/**
 * Interface for AWS Lambda functions mocks.
 */
export interface AWSLambdaInvokeMock {
  /**
   * Get the name of the lambda function the class mocking.
   */
  getFunctionName(): string;

  /**
   * Handle the Lambda.invoke() call.
   *
   * @param params Lambda.invoke() parameters
   * @param callback Callback
   */
  handle(params: any, callback: (error?: Error, response?: any) => void): void;
}
