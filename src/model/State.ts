import { Nullable } from "../types/Nullable";

export interface State<P> {
  readonly stateName: string;
  readonly payload?: Nullable<P>;
}
