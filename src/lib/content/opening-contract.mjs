/** Shared source contract for the canonical loader and trusted submission guard. */
export function validateOpening(presentation) {
  if (!Object.hasOwn(presentation, 'opening')) return [];
  if (presentation.opening !== 'answer-first') return ['Opening must be answer-first when supplied.'];
  const visuals = presentation.figures;
  if (!Array.isArray(visuals)) return ['Answer-first requires a figures collection with a lead after paragraph 1.'];
  const leads = visuals.filter(v => v?.role === 'lead');
  if (leads.length !== 1 || leads[0]?.figure?.type !== 'image' || leads[0].figure.afterParagraph !== 1) {
    return ['Answer-first requires exactly one raster lead after paragraph 1.'];
  }
  if (visuals.find(v => v?.figure?.afterParagraph === 1) !== leads[0]) {
    return ['The answer-first lead must precede other figures at paragraph 1.'];
  }
  return [];
}
