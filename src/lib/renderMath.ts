import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

export interface ParsedQuestionContent {
  stimulusTitle?: string;
  stimulus?: string;
  prompt: string;
}

export function parseQuestionContent(raw: string): ParsedQuestionContent {
  if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.prompt === "string") {
        return {
          stimulusTitle: parsed.stimulusTitle || undefined,
          stimulus: parsed.stimulus || undefined,
          prompt: parsed.prompt,
        };
      }
    } catch {
      // Fallback to raw Markdown string
    }
  }
  return { prompt: raw || "" };
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function renderMathInsideSvg(svg: string): string {
  return svg.replace(
    /(<foreignObject\b[^>]*>)([\s\S]*?)(<\/foreignObject>)/gi,
    (_full, openTag: string, inner: string, closeTag: string) => {
      let out = inner.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (match, math) => {
        try {
          return katex.renderToString(decodeXmlEntities(math), {
            displayMode: true,
            throwOnError: false,
          });
        } catch {
          return match;
        }
      });
      out = out.replace(/\$((?:\\.|[^$\\])+)\$/g, (match, math) => {
        try {
          return katex.renderToString(decodeXmlEntities(math), {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return match;
        }
      });
      return `${openTag}${out}${closeTag}`;
    }
  );
}

export function renderMarkdownWithMath(content: string, inline: boolean = false) {
  if (!content) return "";
  let counter = 0;
  const svgBlocks: Record<string, string> = {};
  const mathBlocks: Record<string, string> = {};

  // Protect raw inline <svg> blocks BEFORE marked runs so blank lines/indentation inside SVG are never broken
  let processed = content.replace(/<svg\b[\s\S]*?<\/svg>/gi, (svg) => {
    const id = `SVGBLOCKPLACEHOLDER${counter++}XYZ`;
    svgBlocks[id] = `<div class="utbk-svg-figure">${renderMathInsideSvg(svg.trim())}</div>`;
    return inline ? id : `\n\n${id}\n\n`;
  });

  processed = processed.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (match, math) => {
    const id = `MATHBLOCKPLACEHOLDER${counter++}XYZ`;
    try {
      mathBlocks[id] = katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch {
      mathBlocks[id] = match;
    }
    return inline ? id : `\n\n${id}\n\n`;
  });

  processed = processed.replace(/\$((?:\\.|[^$\\])+)\$/g, (match, math) => {
    const id = `MATHINLINEPLACEHOLDER${counter++}XYZ`;
    try {
      mathBlocks[id] = katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      mathBlocks[id] = match;
    }
    return id;
  });

  let html = (inline ? marked.parseInline(processed) : marked.parse(processed)) as string;
  for (const [id, mathHtml] of Object.entries(mathBlocks)) {
    if (!inline) html = html.replace(`<p>${id}</p>`, () => mathHtml);
    html = html.replace(id, () => mathHtml);
  }
  for (const [id, svgHtml] of Object.entries(svgBlocks)) {
    if (!inline) html = html.replace(`<p>${id}</p>`, () => svgHtml);
    html = html.replace(id, () => svgHtml);
  }
  return html;
}
