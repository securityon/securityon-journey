import type { CollectionEntry } from "astro:content";
import { noteFilter } from "./noteFilter";

/**
 * Returns notes that are eligible to be shown to users, sorted by “last updated”
 * descending (uses `modDatetime` when present, otherwise `pubDatetime`).
 *
 * Note: filtering respects drafts and scheduled notes via `noteFilter()`.
 */
export function getSortedNotes(notes: CollectionEntry<"notes">[]) {
  return notes
    .filter(noteFilter)
    .sort(
      (a, b) =>
        Math.floor(
          new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
        )
    );
}