type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

export function rehypeWrapTables() {
  return (tree: HastNode) => {
    function visit(node: HastNode) {
      if (!node.children) return;

      node.children = node.children.map(child => {
        visit(child);

        if (child.tagName !== "table") return child;

        return {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll"] },
          children: [child],
        };
      });
    }

    visit(tree);
  };
}
