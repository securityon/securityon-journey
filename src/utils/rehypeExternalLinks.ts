type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type Options = { siteUrl: string };

export function rehypeExternalLinks({ siteUrl }: Options) {
  const siteOrigin = new URL(siteUrl).origin;

  return (tree: HastNode) => {
    function visit(node: HastNode) {
      const href = node.properties?.href;
      if (node.tagName === "a" && typeof href === "string") {
        let url: URL | undefined;
        try {
          url = new URL(href, siteUrl);
        } catch {
          // Leave non-URL links unchanged.
        }
        if (
          url &&
          (url.protocol === "https:" || url.protocol === "http:") &&
          url.origin !== siteOrigin
        ) {
          const properties = (node.properties ??= {});
          properties.target = "_blank";
          const rel = properties.rel;
          const tokens = Array.isArray(rel)
            ? rel.map(String)
            : typeof rel === "string"
              ? rel.split(/\s+/u)
              : [];
          properties.rel = [...new Set([...tokens, "noopener", "noreferrer"])];
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
