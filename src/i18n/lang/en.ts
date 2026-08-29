import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Home",
    notes: "Notes",
    tags: "Tags",
    about: "About",
    archives: "Archives",
    search: "Search",
  },

  note: {
    publishedAt: "Published at",
    updatedAt: "Updated",
    shareNoteIntro: "Share this note:",
    shareNoteOn: "Share this note on {{platform}}",
    shareNoteViaEmail: "Share this note via email",
    tagLabel: "Tags",
    backToTop: "Back to top",
    goBack: "Go back",
    editPage: "Edit page",
    previousNote: "Previous Note",
    nextNote: "Next Note",
  },

  pagination: {
    prev: "Prev",
    next: "Next",
    page: "Page",
  },

  home: {
    socialLinks: "Social Links",
    featured: "Featured",
    recentNotes: "Recent Notes",
    allNotes: "All Notes",
  },

  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },

  pages: {
    tagTitle: "Tag",
    tagDesc: "All the notes with the tag",

    tagsTitle: "Tags",
    tagsDesc: "All the tags used in notes.",

    notesTitle: "Notes",
    notesDesc: "Study, engineering, and research notes.",

    archivesTitle: "Archives",
    archivesDesc: "All archived notes.",

    searchTitle: "Search",
    searchDesc: "Search notes ...",
  },

  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle theme",
    searchPlaceholder: "Search notes...",
    noResults: "No results found",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
  },

  notFound: {
    title: "404 Not Found",
    message: "Page Not Found",
    goHome: "Go back home",
  },
} satisfies UIStrings;