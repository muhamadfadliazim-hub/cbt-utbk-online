import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

export function renderMarkdownWithMath(content: string, inline: boolean = false) {
  let counter = 0;
  const mathBlocks: Record<string, string> = {};
  
  let processed = content.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (match, math) => {
    const id = `MATHBLOCKPLACEHOLDER${counter++}XYZ`;
    try {
      mathBlocks[id] = katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch (e) {
      mathBlocks[id] = match;
    }
    return inline ? id : `\n\n${id}\n\n`;
  });

  processed = processed.replace(/\$((?:\\.|[^$\\])+)\$/g, (match, math) => {
    const id = `MATHINLINEPLACEHOLDER${counter++}XYZ`;
    try {
      mathBlocks[id] = katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch (e) {
      mathBlocks[id] = match;
    }
    return id;
  });

  let html = (inline ? marked.parseInline(processed) : marked.parse(processed)) as string;
  for (const [id, mathHtml] of Object.entries(mathBlocks)) {
    if (!inline) html = html.replace(`<p>${id}</p>`, mathHtml);
    html = html.replace(id, mathHtml);
  }
  return html;
}
