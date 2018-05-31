/**
 * A message is any data structure that is transmitted over the wire. This class
 * provides some meta data which can be use to identify the message once its has
 * been serialized (is it an Event? a Snashot?).
 */
export abstract class Message {
  public readonly messageType: string;

  /**
   * Constructor.
   *
   * @param messageType Message type. Used to identify serialized messages by its type
   */
  constructor(messageType: string) {
    this.messageType = messageType;
  }
}
