import type { CollectionEntry } from "astro:content";
import { noteFilter } from "./noteFilter";
import { slugifyStr } from "./slugify";

type Tag = {
  tag: string;
  tagName: string;
};

/**
 * Builds a de-duplicated, sorted tag list from notes.
 *
 * - Drafts and scheduled notes are excluded via `noteFilter()`
 * - `tag` is the slug used in URLs; `tagName` is the original label for display
 * - Uniqueness is based on the slug (so differently-cased labels collapse)
 */
export function getUniqueTags(notes: CollectionEntry<"notes">[]) {
  const tagsBySlug = new Map<string, Tag>();

  for (const tagName of notes.filter(noteFilter).flatMap(note => note.data.tags)) {
    const tag = slugifyStr(tagName);

    if (!tagsBySlug.has(tag)) {
      tagsBySlug.set(tag, { tag, tagName });
    }
  }

  const tags = [...tagsBySlug.values()].sort((tagA, tagB) =>
    tagA.tag.localeCompare(tagB.tag)
  );

  return tags;
}
