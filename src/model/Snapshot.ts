import { Nullable } from "../types/Nullable";

export type SnapshotPayload = any;

/**
 * A snapshot is used to improve performance when rehydrating an aggregate from events. Instead
 * of aggregating all the events ever emited for an aggregate, snapshots can be created from a certain event
 * and resume the rehydration process from it.
 */
export interface Snapshot {
  readonly aggregateId: string;
  readonly sequence: number;
  readonly payload: SnapshotPayload;
}

export type SnapshotKey = Pick<Snapshot, "aggregateId" | "sequence">;

export type SnapshotInput = Pick<Snapshot, "aggregateId" | "sequence" | "payload">;
