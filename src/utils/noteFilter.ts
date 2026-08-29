import type { CollectionEntry } from "astro:content";
import config from "@/config";

/**
 * Determines whether a note is eligible to be listed/rendered.
 *
 * - Excludes drafts always
 * - In production, excludes scheduled notes until `pubDatetime` minus the configured margin
 * - In dev, always shows non-draft notes to make authoring easier
 */
export function noteFilter({ data }: CollectionEntry<"notes">) {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - config.notes.scheduledNoteMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
}
