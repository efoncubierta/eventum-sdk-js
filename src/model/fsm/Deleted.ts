import { State } from "../State";

export class Deleted<P> extends State<P> {
  public static readonly STATE_NAME = "Deleted";

  constructor(payload: P) {
    super(Deleted.STATE_NAME, payload);
  }
}
