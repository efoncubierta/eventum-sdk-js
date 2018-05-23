import { State } from "../State";

export class New<P> extends State<P> {
  public static readonly STATE_NAME = "New";

  constructor() {
    super(New.STATE_NAME);
  }
}
