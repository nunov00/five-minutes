/** Clone build-rendered artwork without adding image metadata to the search/catalogue contracts. */
export function prependLessonThumbnail(row: HTMLElement, id: string): void {
  const template = Array.from(document.querySelectorAll<HTMLTemplateElement>('template[data-lesson-thumbnail]'))
    .find(candidate => candidate.dataset.lessonThumbnail === id);
  if (!template) return;
  row.classList.add('lesson-row');
  row.prepend(template.content.cloneNode(true));
}
