/** Check built HTML against the mode from validated source, never an HTML-only opt-in. */
export function verifyReadingOrder(html, opening) {
  if (opening !== undefined && opening !== 'answer-first') throw Error('Unknown source opening mode.');
  const positions = expression => [...html.matchAll(expression)].map(match => match.index);
  const once = (expression, label) => {
    const found = positions(expression);
    if (found.length !== 1) throw Error(`Expected exactly one ${label}.`);
    return found[0];
  };
  const bodies = positions(/class="lesson-body(?:\s[^"]*)?"/g);
  const recall = once(/\bdata-recall(?=[\s=>])/g, 'recall section');
  const reveal = once(/\bdata-recall-reveal(?=[\s=>])/g, 'recall reveal');
  const answer = once(/class="answer"/g, 'answer');
  const takeaway = once(/id="takeaway-heading"/g, 'takeaway');
  const endReveal = html.indexOf('</details>', reveal);
  if (!bodies.length || !(bodies[0] < recall && recall < reveal && reveal < answer && answer < endReveal)) {
    throw Error('Recall/answer order invalid.');
  }
  const modes = [...html.matchAll(/\bdata-opening="([^"]*)"/g)].map(match => match[1]);
  const early = positions(/\bdata-opening-takeaway(?=[\s=>])/g);
  const leads = positions(/\bdata-opening-lead(?=[\s=>])/g);
  if (opening === undefined) {
    if (modes.length || early.length || leads.length || !(answer < takeaway && takeaway < endReveal)) {
      throw Error('Default answer and takeaway must follow recall in one reveal.');
    }
    return;
  }
  if (modes.length !== 1 || modes[0] !== opening || early.length !== 1 || leads.length !== 1) {
    throw Error('Answer-first markers disagree with validated source.');
  }
  const endLead = html.indexOf('</figure>', leads[0]);
  const endEarly = html.indexOf('</section>', early[0]);
  if (!(bodies[0] < leads[0] && leads[0] < endLead && endLead < early[0]
    && early[0] < takeaway && takeaway < endEarly && endEarly < recall)
    || (bodies.length > 1 && !(endEarly < bodies[1]))) {
    throw Error('Opening takeaway must follow the lead and precede the remaining prose and recall.');
  }
}
