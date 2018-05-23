import { Message } from "./Message";

/**
 * A command is used to instruct an aggregate to do something. Commands may or may not have
 * side effects (i.e. emit an {@link Event}.
 */
export abstract class Command extends Message {
  public static readonly MESSAGE_TYPE = "Command";

  public readonly commandType: string;

  /**
   * Constructor.
   *
   * @param commandType Command type
   */
  constructor(commandType: string) {
    super(Command.MESSAGE_TYPE);
    this.commandType = commandType;
  }
}
