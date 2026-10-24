// A citation is a bounded index into the lesson's existing sources array.
export const SOURCE_FRAGMENT = /^#source-([1-9]\d{0,2})$/;

export function citationAt(text, offset, sourceCount) {
  if (!text.startsWith('[^', offset)) return null;
  const end = text.indexOf(']', offset + 2);
  const token = end < 0 ? '' : text.slice(offset + 2, end);
  if (!/^[1-9]\d{0,2}$/.test(token)) throw Error('Citation must use [^N] with N from 1 to 999.');
  const number = Number(token);
  if (!Number.isSafeInteger(sourceCount) || number > sourceCount) throw Error(`Citation ${number} has no matching lesson source.`);
  return { number, length: end - offset + 1 };
}

export function citationLink(number) {
  return `<a href="#source-${number}" class="source-citation" aria-label="Source ${number}">[${number}]</a>`;
}

// Match the safe Markdown renderer's code/link handling. Code and link labels
// are literal text; a citation-like string inside them is not a reference.
export function validateCitations(text, sourceCount, markdown = false) {
  const numbers = [];
  let fenced = false;
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (markdown && /^```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (markdown && /^\s*\[\^[^\]]*\]:/.test(line)) throw Error('Citation definitions belong in lesson.yaml sources, not Markdown.');
    for (let i = 0; i < line.length;) {
      if (markdown && line[i] === '`') {
        const end = line.indexOf('`', i + 1);
        if (end > i + 1) { i = end + 1; continue; }
      }
      const citation = citationAt(line, i, sourceCount);
      if (citation) { numbers.push(citation.number); i += citation.length; continue; }
      if (markdown && line[i] === '[') {
        const labelEnd = line.indexOf('](', i + 1);
        if (labelEnd !== -1) {
          let depth = 0, end = labelEnd + 2;
          for (; end < line.length; end++) {
            if (line[end] === '(') depth++;
            else if (line[end] === ')' && depth-- === 0) break;
          }
          if (end < line.length) { i = end + 1; continue; }
        }
      }
      i++;
    }
  }
  return numbers;
}

export function verifySourceLinks(html) {
  const ids = [...html.matchAll(/\bid="(source-[1-9]\d{0,2})"/g)].map(match=>match[1]);
  if (new Set(ids).size !== ids.length) throw Error('Duplicate source reference targets.');
  for (const match of html.matchAll(/\bhref="#(source-[1-9]\d{0,2})"/g)) {
    if (!ids.includes(match[1])) throw Error(`Missing source reference target: ${match[1]}.`);
  }
}
