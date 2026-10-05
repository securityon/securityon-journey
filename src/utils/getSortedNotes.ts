import type { CollectionEntry } from "astro:content";
import { noteFilter } from "./noteFilter";

/**
 * Returns visible notes by “last updated” descending, then optional sortOrder
 * descending for equal timestamps. Filtering respects drafts and scheduling.
 */
export function getSortedNotes(notes: CollectionEntry<"notes">[]) {
  return notes.filter(noteFilter).sort((a, b) => {
    const dateDifference =
      Math.floor(
        new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
      ) -
      Math.floor(
        new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
      );

    return dateDifference || (b.data.sortOrder ?? 0) - (a.data.sortOrder ?? 0);
  });
}
