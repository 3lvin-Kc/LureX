/**
 * Helper utility functions for the editor components
 */

interface FileTreeNode {
  type: "file" | "folder";
  name: string;
  path?: string;
  children?: FileTreeNode[];
}

export const buildStructure = (
  filesMap: Record<string, string> | undefined,
): FileTreeNode[] => {
  const root: FileTreeNode = { type: "folder", name: "", children: [] };
  if (!filesMap) return [];

  for (const fullPath of Object.keys(filesMap)) {
    const parts = fullPath.split("/");
    let node = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (!node.children) {
        node.children = [];
      }

      if (isFile) {
        node.children.push({ type: "file", name: part, path: fullPath });
      } else {
        let next = node.children.find(
          (c) => c.type === "folder" && c.name === part,
        );
        if (!next) {
          next = { type: "folder", name: part, children: [] };
          node.children.push(next);
        }
        node = next;
      }
    }
  }

  return root.children || [];
};

export const getFileLanguage = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "dart":
      return "dart";
    case "yaml":
    case "yml":
      return "yaml";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
};
