import { NOTES_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

type NoteLanguage = "ko" | "en";

function getNotePathSegments(filePath: string | undefined): string[] {
  return (
    filePath
      ?.replace(NOTES_PATH, "")
      .split("/")
      .filter(path => path !== "")
      .filter(path => !path.startsWith("_"))
      .slice(0, -1)
      .map(segment => slugifyStr(segment)) ?? []
  );
}

function getIdSlug(id: string): string {
  const noteId = id.split("/");
  const rawId =
    noteId.length > 0 ? String(noteId[noteId.length - 1]) : id;

  return rawId
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/-en$/, "");
}

function getNoteSlugPath(
  id: string,
  filePath: string | undefined
): string {
  const pathSegments = getNotePathSegments(filePath);
  const slug = getIdSlug(id);

  return pathSegments.length > 0
    ? [...pathSegments, slug].join("/")
    : String(slug);
}

/**
 * Returns the slug-only path for use as a route param.
 *
 * Example:
 * /research-journey-begins
 */
export function getNoteSlug(
  id: string,
  filePath: string | undefined
): string {
  return `/${getNoteSlugPath(id, filePath)}`;
}

/**
 * Returns the public URL of a note.
 *
 * Examples:
 * /notes/ko/research-journey-begins/
 * /notes/en/research-journey-begins/
 */
export function getNoteUrl(
  id: string,
  filePath: string | undefined,
  language: NoteLanguage
): string {
  return `/notes/${language}/${getNoteSlugPath(id, filePath)}/`;
}