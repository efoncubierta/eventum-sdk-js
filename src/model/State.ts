export interface State<P> {
  readonly stateName: string;
  readonly payload?: P;
}
