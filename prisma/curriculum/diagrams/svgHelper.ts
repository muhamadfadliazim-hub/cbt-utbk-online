function escXml(s: string): string {
  return s
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function svgTex(
  x: number,
  y: number,
  w: number,
  h: number,
  content: string,
  opts: {
    color?: string;
    size?: number;
    align?: "left" | "center" | "right";
    bold?: boolean;
  } = {}
): string {
  const color = opts.color ?? "#0f172a";
  const size = opts.size ?? 10.5;
  const align = opts.align ?? "left";
  const jc = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const fw = opts.bold ? ";font-weight:700" : "";
  const safeContent = escXml(content).replace(/\n+/g, " ").trim();
  return `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:${w}px;height:${h}px;justify-content:${jc};text-align:${align};color:${color};font-size:${size}px${fw}"><span>${safeContent}</span></div></foreignObject>`;
}

export function svgFigure(
  uid: string,
  title: string,
  subtitle: string,
  width: number,
  height: number,
  body: string,
  defs: string = ""
): string {
  const safeTitle = escXml(title);
  const safeBody = body.replace(/\n\s*\n/g, "\n").trim();
  const safeDefs = defs ? defs.replace(/\n\s*\n/g, "\n").trim() : "";
  const titleEl = title.includes("$")
    ? svgTex(16, 4, width - 32, 22, title, { color: "#ffffff", size: 12.5, bold: true })
    : `<text x="16" y="21" fill="#ffffff" font-size="13" font-weight="700">${safeTitle}</text>`;
  const subtitleEl = subtitle.includes("$")
    ? svgTex(16, 23, width - 32, 18, subtitle, { color: "#bfdbfe", size: 10.2 })
    : `<text x="16" y="36" fill="#bfdbfe" font-size="10.5" font-weight="500">${escXml(subtitle)}</text>`;
  const ariaTitle = escXml(title.replace(/\$/g, ""));
  const raw = `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px" role="img" aria-label="${ariaTitle}" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="hdr-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0%" stop-color="#0f172a"/>
<stop offset="100%" stop-color="#1e3a8a"/>
</linearGradient>
<marker id="arr-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0,1 L9,5 L0,9 z" fill="#1d4ed8"/>
</marker>
<marker id="arr-dark-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0,1 L9,5 L0,9 z" fill="#334155"/>
</marker>
<marker id="arr-emerald-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0,1 L9,5 L0,9 z" fill="#047857"/>
</marker>
<marker id="arr-rose-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0,1 L9,5 L0,9 z" fill="#be123c"/>
</marker>
${safeDefs}
</defs>
<rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
<path d="M1,13 Q1,1 13,1 L${width - 13},1 Q${width - 1},1 ${width - 1},13 L${width - 1},44 L1,44 Z" fill="url(#hdr-${uid})"/>
${titleEl}
${subtitleEl}
${safeBody}
</svg>`;
  return raw.replace(/\n\s*\n/g, "\n");
}
