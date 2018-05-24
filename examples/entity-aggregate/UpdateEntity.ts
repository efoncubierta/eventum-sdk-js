import { Command } from "../../src/model/Command";

export class UpdateEntity extends Command {
  public static readonly COMMAND_TYPE = "UpdateEntity";

  // data
  public readonly property1: string;
  public readonly property2: string;
  public readonly property3: number;

  constructor(property1: string, property2: string, property3: number) {
    super(UpdateEntity.COMMAND_TYPE);
    this.property1 = property1;
    this.property2 = property2;
    this.property3 = property3;
  }
}
