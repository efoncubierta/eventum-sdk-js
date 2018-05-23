import { State } from "../State";

export class Active<P> extends State<P> {
  public static readonly STATE_NAME = "Active";

  constructor(payload: P) {
    super(Active.STATE_NAME, payload);
  }
}
