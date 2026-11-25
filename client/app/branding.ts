// Branding for forks. Both are set at build time (Docker build args SITE_TITLE and SOURCE_URL).
export const upstreamUrl = "https://github.com/gabehf/koito";

// Name shown in page titles, the footer and the About box.
export const siteTitle: string = import.meta.env.VITE_SITE_TITLE || "Koito";

// Where "View the source" points: the fork's repository, if this is one.
export const sourceUrl: string = import.meta.env.VITE_SOURCE_URL || upstreamUrl;

// True when built as a rebranded fork: the footer and About box then credit Koito.
export const isFork = siteTitle !== "Koito";
