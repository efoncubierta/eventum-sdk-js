import { Command } from "../../src/model/Command";

export class DeleteEntity extends Command {
  public static readonly COMMAND_TYPE = "DeleteEntity";

  constructor() {
    super(DeleteEntity.COMMAND_TYPE);
  }
}
