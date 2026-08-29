import rss from "@astrojs/rss";

import { getCollection } from "astro:content";

import { getSortedNotes } from "@/utils/getSortedNotes";

import { getNoteUrl } from "@/utils/getNotePaths";

import config from "@/config";

export async function GET() {
  const notes = await getCollection("notes");

  const sortedNotes = getSortedNotes(notes);

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,

    items: sortedNotes.map(({ data, id, filePath }) => ({
      link: getNoteUrl(id, filePath, data.lang),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}