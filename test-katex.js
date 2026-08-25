const katex = require('katex');
try {
  console.log(katex.renderToString(' A = \\begin{pmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 5 & 6 & 0 \\end{pmatrix} ', { displayMode: true }));
} catch (e) {
  console.log(e.message);
}
