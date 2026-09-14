import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { fontData, experimental_getFontFileURL } from "astro:assets";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

import { getFontPathByWeight } from "@/utils/getFontPathByWeight";
import { getNoteSlug } from "@/utils/getNotePaths";
import config from "@/config";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const PUBLIC_ASSET_PATH = join(process.cwd(), "public");

let atmosphericImagePromise: Promise<string> | undefined;

function getAtmosphericImage() {
  atmosphericImagePromise ??= sharp(
    join(PUBLIC_ASSET_PATH, "securityon-og.webp")
  )
    .extract({ left: 556, top: 0, width: 640, height: OG_HEIGHT })
    .grayscale()
    .tint("#725b43")
    .modulate({ brightness: 1.15, saturation: 0.25 })
    .blur(0.5)
    .png()
    .toBuffer()
    .then(image => `data:image/png;base64,${image.toString("base64")}`);

  return atmosphericImagePromise;
}

function getTitleFontSize(title: string, lang: "ko" | "en") {
  const length = Array.from(title).length;

  if (lang === "ko") {
    if (length <= 18) return 64;
    if (length <= 28) return 58;
    if (length <= 42) return 52;
    return 46;
  }

  if (length <= 38) return 64;
  if (length <= 62) return 58;
  if (length <= 88) return 51;
  return 45;
}

function wrapKoreanTitle(title: string, lang: "ko" | "en") {
  if (lang !== "ko" || Array.from(title).length <= 28) return title;

  const lines: string[] = [];
  let currentLine = "";

  for (const word of title.trim().split(/\s+/)) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (currentLine && Array.from(candidate).length > 14) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.join("\n");
}

function trimDescription(
  description: string,
  lang: "ko" | "en",
  hasLongTitle: boolean
) {
  const limit =
    lang === "ko" ? (hasLongTitle ? 78 : 92) : hasLongTitle ? 120 : 140;
  const characters = Array.from(description.trim());

  if (characters.length <= limit) return description.trim();

  const shortened = characters.slice(0, limit).join("");
  const cleanEnding = shortened
    .replace(/\s+\S*$/u, "")
    .replace(/[\s,.;:·/([{\-]+$/u, "")
    .trimEnd();

  return `${cleanEnding}…`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: config.site.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", ".");
}

function formatTag(tag: string) {
  return tag
    .replaceAll("-", " ")
    .replace(/\b[a-z]/g, character => character.toUpperCase());
}

export async function getStaticPaths() {
  if (!config.features.dynamicOgImage) {
    return [];
  }

  const notes = await getCollection("notes").then(notes =>
    notes.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return notes.map(note => ({
    params: {
      lang: note.data.lang,
      slug: getNoteSlug(note.id, note.filePath),
    },
    props: note,
  }));
}

export const GET: APIRoute = async ({ props, url }) => {
  if (!config.features.dynamicOgImage) {
    return new Response(null, { status: 404, statusText: "Not found" });
  }

  const fonts = fontData["--font-google-sans-code"];
  const regularFontPath = getFontPathByWeight(fonts, 400);
  const boldFontPath = getFontPathByWeight(fonts, 700);

  if (regularFontPath === undefined || boldFontPath === undefined) {
    throw new Error("Cannot find the font path.");
  }

  const isKorean = props.data.lang === "ko";
  const fontFamily = "RIDIBatang";
  const titleFontSize = getTitleFontSize(props.data.title, props.data.lang);
  const title = wrapKoreanTitle(props.data.title, props.data.lang);
  const hasLongTitle = titleFontSize <= 52;
  const description = trimDescription(
    props.data.description,
    props.data.lang,
    hasLongTitle
  );
  const metadata = [
    formatDate(props.data.pubDatetime),
    ...props.data.tags
      .filter((tag: string) => tag.toLowerCase() !== "research-journey")
      .slice(0, 3)
      .map(formatTag),
  ].join("  |  ");
  const author = props.data.author || config.site.author;

  const [regularData, boldData, ridiFontData, atmosphericImage] =
    await Promise.all([
      fetch(experimental_getFontFileURL(regularFontPath, url)).then(res =>
        res.arrayBuffer()
      ),
      fetch(experimental_getFontFileURL(boldFontPath, url)).then(res =>
        res.arrayBuffer()
      ),
      readFile(join(PUBLIC_ASSET_PATH, "fonts", "RIDIBatang.otf")),
      getAtmosphericImage(),
    ]);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#f4efe5",
          color: "#292621",
          fontFamily: "Google Sans Code",
        },
        children: [
          {
            type: "img",
            props: {
              src: atmosphericImage,
              style: {
                position: "absolute",
                top: 0,
                right: 0,
                width: 640,
                height: OG_HEIGHT,
                opacity: 0.16,
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                right: 0,
                width: 760,
                height: OG_HEIGHT,
                display: "flex",
                backgroundImage:
                  "linear-gradient(90deg, #f4efe5 0%, rgba(244,239,229,0.88) 26%, rgba(244,239,229,0.12) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: 8,
                height: OG_HEIGHT,
                display: "flex",
                background: "#9b7651",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      top: 48,
                      right: 64,
                      left: 72,
                      height: 76,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      borderBottom: "1px solid rgba(92,76,58,0.28)",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            textTransform: "uppercase",
                            lineHeight: 1.15,
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: 17,
                                  fontWeight: 700,
                                  letterSpacing: "0.24em",
                                },
                                children: "SECURITYON",
                              },
                            },
                            {
                              type: "span",
                              props: {
                                style: {
                                  marginTop: 7,
                                  color: "#7b6955",
                                  fontSize: 12,
                                  letterSpacing: "0.31em",
                                },
                                children: "RESEARCH JOURNEY",
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            marginTop: 2,
                            color: "#7b6955",
                            fontSize: 15,
                            letterSpacing: "0.12em",
                          },
                          children: "Research Note",
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      top: 124,
                      left: 72,
                      width: 850,
                      height: 357,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      overflow: "hidden",
                      paddingBottom: 6,
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            maxHeight: 214,
                            overflow: "hidden",
                            fontFamily,
                            fontSize: titleFontSize,
                            fontWeight: 400,
                            lineHeight: 1.18,
                            letterSpacing: isKorean ? "-0.035em" : "-0.045em",
                            whiteSpace: "pre-wrap",
                          },
                          children: title,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            width: 790,
                            maxHeight: isKorean ? 66 : 63,
                            marginTop: hasLongTitle ? 20 : 24,
                            overflow: "hidden",
                            color: "#5f584f",
                            fontFamily,
                            fontSize: isKorean ? 21 : 20,
                            fontWeight: 400,
                            lineHeight: 1.55,
                            letterSpacing: isKorean ? "-0.012em" : "-0.02em",
                          },
                          children: description,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      top: 481,
                      right: 64,
                      left: 72,
                      height: 103,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      borderTop: "1px solid rgba(92,76,58,0.28)",
                      paddingTop: 19,
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            width: 665,
                            maxHeight: 38,
                            display: "flex",
                            overflow: "hidden",
                            color: "#745e48",
                            fontSize: 13,
                            fontWeight: 700,
                            letterSpacing: "0.055em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          },
                          children: metadata,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            lineHeight: 1.25,
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: {
                                  color: "#544b42",
                                  fontSize: 13,
                                  letterSpacing: "0.015em",
                                },
                                children:
                                  "Open Notes for a More Secure Tomorrow",
                              },
                            },
                            {
                              type: "span",
                              props: {
                                style: {
                                  marginTop: 7,
                                  color: "#8d6946",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                },
                                children: author,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      embedFont: true,
      fonts: [
        {
          name: "Google Sans Code",
          data: regularData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Google Sans Code",
          data: boldData,
          weight: 700,
          style: "normal",
        },
        {
          name: "RIDIBatang",
          data: ridiFontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
