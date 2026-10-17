/** Closed, application-owned symbols. Lesson data never supplies drawing commands. */
export const FIGURE_SYMBOLS = Object.freeze({
  source: 'M8 32h48M40 16l16 16-16 16M8 20v24',
  filter: 'M8 12h48L38 34v18H26V34Z',
  container: 'M12 12v40h40V12M12 32h40',
  output: 'M8 12h20v40H8M30 32h26M42 18l14 14-14 14',
  energy: 'M36 6 14 36h16l-2 22 22-32H34Z',
  clock: 'M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48M32 16v16l14 8',
  sensor: 'M8 32c12-24 36-24 48 0-12 24-36 24-48 0ZM32 24a8 8 0 1 0 0 16 8 8 0 1 0 0-16',
  adjustment: 'M12 16h40M12 32h40M12 48h40M24 10v12M42 26v12M30 42v12',
  person: 'M32 8a8 8 0 1 0 0 16 8 8 0 1 0 0-16M32 24v20M16 34l16-8 16 8M20 56l12-12 12 12',
  object: 'M12 18 32 8l20 10v28L32 56 12 46ZM12 18l20 10 20-10M32 28v28',
  document: 'M14 8h26l10 10v38H14ZM38 8v14h12M22 32h20M22 42h20',
  decision: 'M32 6 58 32 32 58 6 32ZM24 24c0-12 22-10 16 2l-8 6v6M32 46v1',
});
export const TOOLKIT_TYPES = Object.freeze(['concept-flow', 'orbital-motion']);
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v)
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const only = (v, names) => Object.keys(v).every(key => names.includes(key));
const plain = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max
  && !/[<>`]|!\[|\[[^\]]*\]\(|\*\*|(?:^|\n)\s*(?:#|[-*]\s)|[\u0000-\u001f]/.test(v);
const unique = labels => new Set(labels.map(s => s.trim().toLowerCase().replace(/\s+/g, ' '))).size === labels.length;

/** Returns plain diagnostic strings; used by both the canonical loader and trusted-base guard.
 * @param {string} type
 * @param {unknown} data
 * @returns {string[]}
 */
export function validateToolkitData(type, data) {
  if (!object(data)) return ['Expected a structured toolkit data mapping.'];
  if (type === 'orbital-motion') {
    return only(data, ['style']) && data.style === 'shared-free-fall' ? [] : ['Unknown orbital-motion style or fields.'];
  }
  if (type === 'concept-flow') {
    if (!only(data, ['pattern', 'nodes']) || !['sequence', 'cycle', 'branch'].includes(data.pattern)) return ['Expected an approved concept-flow pattern.'];
    const min = data.pattern === 'sequence' ? 2 : 3;
    if (!Array.isArray(data.nodes) || data.nodes.length < min || data.nodes.length > (data.pattern==='branch'?3:4)) return ['Sequences require 2–4 nodes, cycles 3–4, and a branch exactly one source and two outcomes.'];
    if (!data.nodes.every(n => object(n) && only(n, ['label', 'symbol']) && plain(n.label, 28)
      && typeof n.symbol === 'string' && Object.hasOwn(FIGURE_SYMBOLS, n.symbol))) return ['Each node needs a bounded label and an approved semantic symbol.'];
    if (!unique(data.nodes.map(n => n.label))) return ['Concept-flow labels must be unique.'];
    return [];
  }
  if (type === 'comparison-bars') {
    if (!only(data, ['style', 'items', 'unit']) || data.style !== 'proportional'
      || (data.unit !== undefined && !plain(data.unit, 40))) return ['Expected proportional bars with a bounded optional unit.'];
    if (!Array.isArray(data.items) || data.items.length < 2 || data.items.length > 6) return ['Proportional bars require 2–6 items.'];
    if (!data.items.every(n => object(n) && only(n, ['label', 'value', 'display']) && plain(n.label, 24)
      && typeof n.value === 'number' && Number.isFinite(n.value) && n.value >= 0 && n.value <= 1_000_000_000
      && plain(n.display, 16))) return ['Invalid proportional-bar label, value or display.'];
    if (!unique(data.items.map(n => n.label)) || !data.items.some(n => n.value > 0)) return ['Bar labels must be unique and at least one value positive.'];
    return [];
  }
  return ['Unknown toolkit type.'];
}
