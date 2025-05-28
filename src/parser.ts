export type PlaceholderInfo = {
  name: string;
  type: string;
  value?: string;
  description?: string;
};

const PLACEHOLDER_KEYWORD = "@placeholder";

// @placeholder <name>: <type> [= <value>] [<description>]
const COMMENT_BLOCK_PLACEHOLDER_REGEX =
  /@placeholder\s+([_\w$]+)\s*:\s*([\w\[\]]+)(?:\s*=\s*([^\s]+))?(?:\s{2,}(.*?))?\s*$/i;

// val <variable-name>: <type> = <name> // @placeholder [description]
const INLINE_PLACEHOLDER_REGEX =
  /^\s*val\s+\w+\s*:\s*([\w\[\]]+)\s*=\s*([$\w]+)\s*\/\/\s*@placeholder\s*(.*)$/i;

export function extractPlaceholders(source: string): PlaceholderInfo[] {
  const results: PlaceholderInfo[] = [];
  if (!source || !source.includes(PLACEHOLDER_KEYWORD)) return results;

  const lines = splitSource(source);
  for (const line of lines) {
    if (line.length <= PLACEHOLDER_KEYWORD.length) continue; // skip too short lines
    if (!line.includes(PLACEHOLDER_KEYWORD)) continue; // ignore lines without @placeholder keyword

    const match = matchCommentBlockPlaceholder(line) ?? matchInlinePlaceholder(line);
    if (!match) continue;

    results.push(match);
  }

  return results;
}

function matchCommentBlockPlaceholder(line: string): PlaceholderInfo | undefined {
  const match = line.match(COMMENT_BLOCK_PLACEHOLDER_REGEX);
  if (!match) return undefined;

  const [, name, type, value, desc] = match;
  if (!name || !type) return undefined; // Ensure both name and type are present

  return { name, type, value, description: desc?.trim() ?? "" };
}

function matchInlinePlaceholder(line: string): PlaceholderInfo | undefined {
  const match = line.match(INLINE_PLACEHOLDER_REGEX);
  if (!match) return undefined;

  const [, type, name, desc] = match;
  if (!name || !type) return undefined; // Ensure both name and type are present

  return { name, type, description: desc?.trim() ?? "" };
}

export function splitSource(source: string): string[] {
  return source
    .split(/(?:\r?\n|;)/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
