export class State<P> {
  public readonly stateName: string;
  public readonly payload: P;

  constructor(stateName: string, payload?: P) {
    this.stateName = stateName;
    this.payload = payload;
  }
}
