import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://journey.securityon.org/",
    title: "SecurityOn Research Journey",
    description: "Study, engineering, and research notes by BAN Seok.",
    author: "BAN Seok",
    profile: "https://journey.securityon.org/about",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Asia/Seoul",
    dir: "ltr",
  },

  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },

  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: false,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },

  socials: [
    { name: "github",
      url: "https://github.com/securityon",
    },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/securityon/",
    },
    {
      name: "mail", url: "mailto:security@securityon.org",
    },
  ],
  

  shareLinks: [
    { name: "mail",
      url: "mailto:?subject=Research%20Note&body="
    },
  ],
});