import type { CollectionEntry } from "astro:content";

type GroupKey = string | number | symbol;
type GroupFunction<T> = (item: T, index?: number) => GroupKey;

export function getNotesByGroupCondition(
  notes: CollectionEntry<"notes">[],
  groupFunction: GroupFunction<CollectionEntry<"notes">>
) {
  const result: Record<GroupKey, CollectionEntry<"notes">[]> = {};

  for (let i = 0; i < notes.length; i++) {
    const item = notes[i];
    const groupKey = groupFunction(item, i);

    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);
  }

  return result;
}