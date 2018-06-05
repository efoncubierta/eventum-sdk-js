// External dependencies
import { Option, none, some } from "fp-ts/lib/Option";

// Eventum models
import { Snapshot, SnapshotKey } from "../../model/Snapshot";
import { AggregateId, Sequence } from "../../model/Common";

/**
 * Manage snapshot data in memory.
 */
export class InMemorySnapshotStore {
  private static snapshots: Snapshot[] = [];

  /**
   * Put a snapshot in the in-memory snapshots array. This action replace any existing
   * snapshot for the same aggregate ID and sequence number.
   *
   * @param snapshot Snapshot<any>
   */
  public static putSnapshot(snapshot: Snapshot): void {
    this.deleteSnapshot({
      aggregateId: snapshot.aggregateId,
      sequence: snapshot.sequence
    });
    this.snapshots.push(snapshot);
  }

  /**
   * Delete an snapshot from the in-memory snapshots array.
   *
   * @param snapshotKey Snapshot key
   */
  public static deleteSnapshot(snapshotKey: SnapshotKey): void {
    this.snapshots = this.snapshots.filter((e) => {
      return !(e.aggregateId === snapshotKey.aggregateId && e.sequence === snapshotKey.sequence);
    });
  }

  /**
   * Get latest snapshot.
   *
   * @param aggregateId Aggregate ID
   */
  public static getLatestSnapshot(aggregateId: string): Option<Snapshot> {
    const snapshots = this.snapshots
      .filter((e) => {
        return e.aggregateId === aggregateId;
      })
      .reverse();

    return snapshots.length > 0 ? some(snapshots[0]) : none;
  }

  /**
   * Get all snapshots for an aggregate sorted by sequence (lower sequence first).
   *
   * @param aggregateId Aggregate ID
   * @param fromSequence Start sequence number
   * @param toSequence End sequence number
   * @param reverse Reverse the order (higher sequence first)
   * @return Sequence of snapshots
   */
  public static getSnapshots(
    aggregateId: AggregateId,
    fromSequence: Sequence = 0,
    toSequence: Sequence = Number.MAX_SAFE_INTEGER,
    reverse: boolean = true
  ): Snapshot[] {
    const snapshots = this.snapshots
      .filter((snapshot) => {
        return (
          snapshot.aggregateId === aggregateId && snapshot.sequence >= fromSequence && snapshot.sequence <= toSequence
        );
      })
      .sort((last, current) => last.sequence - current.sequence);

    if (reverse) {
      snapshots.reverse();
    }

    return snapshots;
  }

  /**
   * Get list of snapshots to roll forward.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   */
  public static getRollForwardSnapshots(aggregateId: string, sequence: number): Snapshot[] {
    return this.snapshots
      .filter((snapshot) => {
        return snapshot.aggregateId === aggregateId && snapshot.sequence <= sequence;
      })
      .sort((last, current) => last.sequence - current.sequence);
  }
}
