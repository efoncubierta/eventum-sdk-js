import { Event } from "../model/Event";

export interface IMaterializer {
  handle(event: Event<any>): Promise<void>;
}

export abstract class Materializer implements IMaterializer {
  public abstract handle(event: Event<any>): Promise<void>;
}
