import { Command } from "../../src/model/Command";

export class GetEntity extends Command {
  public static readonly COMMAND_TYPE = "GetEntity";

  constructor() {
    super(GetEntity.COMMAND_TYPE);
  }
}
