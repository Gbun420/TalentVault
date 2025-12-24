type BlockNode = {
  text?: string;
  children?: BlockNode[];
};

type Block = {
  children?: BlockNode[];
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const walkNodes = (nodes: BlockNode[], parts: string[]) => {
  nodes.forEach((node) => {
    if (typeof node.text === 'string') {
      parts.push(node.text);
    }
    if (Array.isArray(node.children)) {
      walkNodes(node.children, parts);
    }
  });
};

const blocksToText = (blocks: unknown): string => {
  if (!Array.isArray(blocks)) return '';
  const parts: string[] = [];
  blocks.forEach((block) => {
    const children = (block as Block).children;
    if (Array.isArray(children)) {
      walkNodes(children, parts);
    }
  });
  return normalizeWhitespace(parts.join(' '));
};

export { blocksToText };
