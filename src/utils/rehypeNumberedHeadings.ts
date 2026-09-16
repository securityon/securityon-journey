type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function getText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return node.children?.map(getText).join("") ?? "";
}

export function rehypeNumberedHeadings() {
  return (tree: HastNode) => {
    function visit(node: HastNode) {
      if (node.tagName === "h2" && /^\d+\.\s/u.test(getText(node))) {
        const properties = (node.properties ??= {});
        const className = properties.className;

        properties.className = Array.isArray(className)
          ? [...className, "numbered-heading"]
          : className
            ? [className, "numbered-heading"]
            : ["numbered-heading"];
      }

      node.children?.forEach(visit);
    }

    visit(tree);
  };
}
